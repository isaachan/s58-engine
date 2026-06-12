/**
 * Synthesized engine audio (Web Audio, no asset files so the app stays
 * fully offline). The note is built from harmonics of the active engine's
 * firing frequency: crank-order and firing-order
 * sawtooth/square oscillators through a lowpass filter whose cutoff opens
 * with rpm and load, plus band-passed noise for intake/exhaust rush.
 * `update()` retunes everything smoothly, so revving glides like a real
 * engine instead of stepping.
 */
import type { SoundParams } from '../engines/types'

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

class EngineSound {
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

export const engineSound = new EngineSound()
