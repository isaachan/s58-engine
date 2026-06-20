/**
 * Engine audio with two back-ends behind one `start/update/stop` facade:
 *
 *  - SynthEngine  — fully synthesized note (Web Audio, no asset files), built
 *    from harmonics of the firing frequency through an rpm/load-driven lowpass
 *    plus band-passed noise. This is the always-available default and keeps the
 *    app fully offline.
 *  - SampleEngine — crossfades real looped recordings by rpm and pitch-shifts
 *    each toward the target speed. Used only when the active engine supplies
 *    loadable `samples`; until the clips decode (or if they fail) it falls back
 *    to the synth so there is never a silent gap.
 *
 * No audio assets ship yet, so SampleEngine is dormant in practice — see
 * TODO.md "真实引擎音效" for the asset-sourcing follow-up. The integration
 * point is just `EngineDefinition.sound.samples`.
 */
import type { SampleLayer, SoundParams } from '../engines/types'

interface SoundEngine {
  start(rpm: number, load: number, p: SoundParams): void
  update(rpm: number, load: number, p: SoundParams): void
  stop(): void
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// ---------------------------------------------------------------------------
// Synthesized note (the original implementation, unchanged in behavior)
// ---------------------------------------------------------------------------

interface Voice {
  osc: OscillatorNode
  gain: GainNode
  order: number // multiple of the firing frequency
}

const VOICES: { order: number; type: OscillatorType; gain: number }[] = [
  { order: 0.5, type: 'sawtooth', gain: 0.28 }, // crank order (rumble)
  { order: 1, type: 'sawtooth', gain: 0.5 }, // firing order (dominant note)
  { order: 1.5, type: 'square', gain: 0.1 },
  { order: 2, type: 'square', gain: 0.16 },
  { order: 3, type: 'triangle', gain: 0.09 },
]

class SynthEngine implements SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private voices: Voice[] = []
  private noiseSrc: AudioBufferSourceNode | null = null
  private noiseGain: GainNode | null = null
  private running = false

  start(rpm: number, load: number, p: SoundParams) {
    if (this.running) return
    const ctx = (this.ctx ??= new AudioContext())
    void ctx.resume()

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.Q.value = 1.1
    filter.connect(master)

    this.voices = VOICES.map((v) => {
      const osc = ctx.createOscillator()
      osc.type = v.type
      const gain = ctx.createGain()
      gain.gain.value = v.gain
      // slight detune gives mechanical roughness instead of a pure synth tone
      osc.detune.value = (Math.random() - 0.5) * 14
      osc.connect(gain)
      gain.connect(filter)
      osc.start()
      return { osc, gain, order: v.order }
    })

    // looped white noise → bandpass = intake/exhaust rush
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noiseSrc = ctx.createBufferSource()
    noiseSrc.buffer = noiseBuf
    noiseSrc.loop = true
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 900
    noiseFilter.Q.value = 0.6
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0
    noiseSrc.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(master)
    noiseSrc.start()

    this.master = master
    this.filter = filter
    this.noiseSrc = noiseSrc
    this.noiseGain = noiseGain
    this.running = true

    this.update(rpm, load, p)
    master.gain.setTargetAtTime(0.16, ctx.currentTime, 0.25) // start-up swell
  }

  update(rpm: number, load: number, p: SoundParams) {
    if (!this.running || !this.ctx) return
    const t = this.ctx.currentTime
    const fireHz = (rpm / 60) * p.firesPerRev
    for (const v of this.voices) {
      v.osc.frequency.setTargetAtTime(fireHz * v.order, t, 0.06)
    }
    const rpmNorm = rpm / p.redlineRpm
    this.filter!.frequency.setTargetAtTime(280 + load * 2400 + rpmNorm * 2000, t, 0.08)
    this.noiseGain!.gain.setTargetAtTime(0.015 + load * 0.07 + rpmNorm * 0.03, t, 0.1)
    this.master!.gain.setTargetAtTime(0.1 + 0.1 * load + 0.05 * rpmNorm, t, 0.12)
  }

  stop() {
    if (!this.running || !this.ctx || !this.master) return
    const ctx = this.ctx
    const master = this.master
    const voices = this.voices
    const noise = this.noiseSrc
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.12) // shut-down fade
    setTimeout(() => {
      voices.forEach((v) => v.osc.stop())
      noise?.stop()
      master.disconnect()
    }, 600)
    this.voices = []
    this.noiseSrc = null
    this.master = null
    this.filter = null
    this.noiseGain = null
    this.running = false
  }
}

// ---------------------------------------------------------------------------
// Sample-based note (real recordings, crossfaded + pitch-shifted by rpm)
// ---------------------------------------------------------------------------

function sampleLayers(s: NonNullable<SoundParams['samples']>): SampleLayer[] {
  return [s.idle, s.mid, s.redline].filter((l): l is SampleLayer => !!l)
}

/** Two-nearest linear crossfade weights across the layers' recorded rpms. */
function layerWeights(rpms: number[], target: number): number[] {
  const w = new Array(rpms.length).fill(0)
  if (rpms.length === 0) return w
  const order = rpms.map((r, i) => ({ r, i })).sort((a, b) => a.r - b.r)
  if (target <= order[0].r) {
    w[order[0].i] = 1
    return w
  }
  const last = order[order.length - 1]
  if (target >= last.r) {
    w[last.i] = 1
    return w
  }
  for (let k = 0; k < order.length - 1; k++) {
    const a = order[k]
    const b = order[k + 1]
    if (target >= a.r && target <= b.r) {
      const f = (target - a.r) / (b.r - a.r)
      w[a.i] = 1 - f
      w[b.i] = f
      break
    }
  }
  return w
}

interface PlayingLayer {
  src: AudioBufferSourceNode
  gain: GainNode
  rpm: number
}

class SampleEngine implements SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private layers: PlayingLayer[] = []
  private fallback = new SynthEngine()
  private fallbackActive = false
  private ready = false
  private running = false

  start(rpm: number, load: number, p: SoundParams) {
    if (this.running) return
    this.running = true
    // Always audible immediately; swapped out once samples decode.
    this.fallback.start(rpm, load, p)
    this.fallbackActive = true
    void this.load(rpm, load, p)
  }

  private async load(rpm: number, load: number, p: SoundParams) {
    const ctx = (this.ctx ??= new AudioContext())
    void ctx.resume()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    this.master = master

    try {
      const defs = sampleLayers(p.samples!)
      const buffers = await Promise.all(
        defs.map((d) =>
          fetch(d.url)
            .then((r) => r.arrayBuffer())
            .then((a) => ctx.decodeAudioData(a)),
        ),
      )
      if (!this.running) return // stopped while loading
      this.layers = defs.map((d, i) => {
        const src = ctx.createBufferSource()
        src.buffer = buffers[i]
        src.loop = true
        const gain = ctx.createGain()
        gain.gain.value = 0
        src.connect(gain)
        gain.connect(master)
        src.start()
        return { src, gain, rpm: d.rpm }
      })
      this.ready = true
      this.update(rpm, load, p)
      master.gain.setTargetAtTime(0.16, ctx.currentTime, 0.3)
      // crossfade out the synth fallback now that real audio is playing
      this.fallback.stop()
      this.fallbackActive = false
    } catch {
      // decode/fetch failed — keep the synth fallback running
      this.ready = false
    }
  }

  update(rpm: number, load: number, p: SoundParams) {
    if (this.fallbackActive) this.fallback.update(rpm, load, p)
    if (!this.ready || !this.ctx || !this.master) return
    const t = this.ctx.currentTime
    const weights = layerWeights(
      this.layers.map((l) => l.rpm),
      rpm,
    )
    this.layers.forEach((l, i) => {
      l.gain.gain.setTargetAtTime(weights[i] * (0.6 + 0.4 * load), t, 0.1)
      // fine pitch toward target rpm, clamped to avoid chipmunk/sludge
      l.src.playbackRate.setTargetAtTime(clamp(rpm / l.rpm, 0.6, 1.6), t, 0.08)
    })
    this.master.gain.setTargetAtTime(0.12 + 0.08 * load, t, 0.12)
  }

  stop() {
    if (!this.running) return
    this.running = false
    this.ready = false
    if (this.fallbackActive) {
      this.fallback.stop()
      this.fallbackActive = false
    }
    if (this.ctx && this.master) {
      const master = this.master
      const layers = this.layers
      master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12)
      setTimeout(() => {
        layers.forEach((l) => {
          try {
            l.src.stop()
          } catch {
            /* already stopped */
          }
        })
        master.disconnect()
      }, 600)
    }
    this.layers = []
    this.master = null
  }
}

// ---------------------------------------------------------------------------
// Facade: pick a back-end per engine, keep the start/update/stop API
// ---------------------------------------------------------------------------

class EngineSound {
  private synth = new SynthEngine()
  private sampler = new SampleEngine()
  private active: SoundEngine | null = null

  start(rpm: number, load: number, p: SoundParams) {
    const useSamples = !!p.samples && sampleLayers(p.samples).length > 0
    this.active = useSamples ? this.sampler : this.synth
    this.active.start(rpm, load, p)
  }

  update(rpm: number, load: number, p: SoundParams) {
    this.active?.update(rpm, load, p)
  }

  stop() {
    this.active?.stop()
    this.active = null
  }
}

export const engineSound = new EngineSound()
