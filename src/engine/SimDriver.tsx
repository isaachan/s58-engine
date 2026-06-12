import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { simClock } from '../sim/engineCycle'

/**
 * Advances the shared crank-angle clock (slow-motion scaled) and renders the
 * combustion flash in whichever cylinder is firing. Active in combustion and
 * stress modes only.
 */
export const SimDriver: React.FC = () => {
  const flashes = useRef<(THREE.Mesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null!)
  const engine = useStore((s) => s.engine)!
  const cylX = engine.geometry.cylX

  useFrame((_, dt) => {
    const s = useStore.getState()
    if (!s.engine) return
    const active = (s.mode === 'combust' || s.mode === 'stress') && s.engineRunning
    if (!active) {
      // engine stopped: kill flashes and light, keep the crank where it is
      flashes.current.forEach((m) => {
        if (m) {
          ;(m.material as THREE.MeshBasicMaterial).opacity = 0
          m.visible = false
        }
      })
      if (light.current) light.current.intensity = 0
      return
    }
    // crank degrees advanced this frame, slowed for visibility
    simClock.thetaDeg = (simClock.thetaDeg + s.simRpm * 6 * s.simTimeScale * Math.min(dt, 0.05)) % 720

    let bright = 0
    let brightX = 0
    for (let i = 0; i < s.engine.geometry.cylX.length; i++) {
      const m = flashes.current[i]
      if (!m) continue
      // burn window: peaks ~14° after each cylinder's firing TDC
      const d = (simClock.thetaDeg - s.engine.geometry.fireDeg[i] + 720) % 720
      const k = Math.exp(-Math.pow((d - 14) / 16, 2))
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = (s.mode === 'combust' ? 0.85 : 0.4) * k
      m.scale.setScalar(0.6 + 0.7 * k)
      m.visible = k > 0.02
      if (k > bright) {
        bright = k
        brightX = s.engine.geometry.cylX[i]
      }
    }
    if (light.current) {
      light.current.intensity = bright * (s.mode === 'combust' ? 14 : 5)
      light.current.position.set(brightX, 0.55, 0)
    }
  })

  const mode = useStore((s) => s.mode)
  if (mode !== 'combust' && mode !== 'stress') return null

  return (
    <group>
      {cylX.map((x, i) => (
        <mesh key={`${engine.meta.id}-${i}`} ref={(el) => (flashes.current[i] = el)} position={[x, 0.48, 0]}>
          <sphereGeometry args={[0.17, 14, 10]} />
          <meshBasicMaterial
            color="#ffae3c"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      <pointLight ref={light} color="#ff9a3c" intensity={0} distance={3.5} decay={2} />
    </group>
  )
}
