import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { CIRCUITS, CircuitDef, computeFlow, FlowResult } from '../sim/flow'

const tmp = new THREE.Vector3()

const Circuit: React.FC<{ def: CircuitDef; speed: number }> = ({ def, speed }) => {
  const points = useRef<THREE.Points>(null!)

  const { curve, positions, ts } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      def.pts.map((p) => new THREE.Vector3(...p)),
      def.closed,
      'catmullrom',
      0.4,
    )
    const positions = new Float32Array(def.count * 3)
    const ts = new Float32Array(def.count)
    for (let i = 0; i < def.count; i++) {
      ts[i] = (i / def.count + Math.random() * 0.01) % 1
      curve.getPointAt(ts[i], tmp)
      positions.set([tmp.x, tmp.y, tmp.z], i * 3)
    }
    return { curve, positions, ts }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const len = useMemo(() => curve.getLength(), [curve])

  useFrame((_, dt) => {
    const step = (speed * Math.min(dt, 0.05)) / len
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < def.count; i++) {
      ts[i] = (ts[i] + step) % 1
      curve.getPointAt(ts[i], tmp)
      attr.setXYZ(i, tmp.x, tmp.y, tmp.z)
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={def.color}
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** faint guide line so the circuit reads even where particles are sparse */
const CircuitGuide: React.FC<{ def: CircuitDef }> = ({ def }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      def.pts.map((p) => new THREE.Vector3(...p)),
      def.closed,
      'catmullrom',
      0.4,
    )
    return new THREE.BufferGeometry().setFromPoints(curve.getPoints(120))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <primitive
      object={useMemo(
        () =>
          new THREE.Line(
            geo,
            new THREE.LineBasicMaterial({ color: def.color, transparent: true, opacity: 0.18 }),
          ),
        [geo, def.color],
      )}
    />
  )
}

const SPEED_KEY: Record<string, keyof FlowResult> = {
  intake: 'vIntake',
  exhaust: 'vExhaust',
  coolant: 'vCoolant',
  oil: 'vOil',
}

export const FlowParticles: React.FC = () => {
  const mode = useStore((s) => s.mode)
  const rpm = useStore((s) => s.flowRpm)
  const throttle = useStore((s) => s.flowThrottle)
  const circuits = useStore((s) => s.flowCircuits)
  const running = useStore((s) => s.engineRunning)

  const flow = useMemo(() => computeFlow({ rpm, throttle }), [rpm, throttle])

  if (mode !== 'flow') return null
  return (
    <group>
      {CIRCUITS.filter((c) => circuits.has(c.id)).map((c) => (
        <group key={c.id}>
          <CircuitGuide def={c} />
          <Circuit def={c} speed={running ? (flow[SPEED_KEY[c.id]] as number) : 0} />
        </group>
      ))}
    </group>
  )
}
