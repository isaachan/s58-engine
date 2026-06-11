import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { FIRE_DEG, simClock } from '../sim/engineCycle'

const CYL_X = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]

/**
 * Advances the shared crank-angle clock (slow-motion scaled) and renders the
 * combustion flash in whichever cylinder is firing. Active in combustion and
 * stress modes only.
 */
export const SimDriver: React.FC = () => {
  const flashes = useRef<(THREE.Mesh | null)[]>([])
  const light = useRef<THREE.PointLight>(null!)

  useFrame((_, dt) => {
    const s = useStore.getState()
    const active = s.mode === 'combust' || s.mode === 'stress'
    if (!active) return
    // crank degrees advanced this frame, slowed for visibility
    simClock.thetaDeg = (simClock.thetaDeg + s.simRpm * 6 * s.simTimeScale * Math.min(dt, 0.05)) % 720

    let bright = 0
    let brightX = 0
    for (let i = 0; i < 6; i++) {
      const m = flashes.current[i]
      if (!m) continue
      // burn window: peaks ~14° after each cylinder's firing TDC
      const d = (simClock.thetaDeg - FIRE_DEG[i] + 720) % 720
      const k = Math.exp(-Math.pow((d - 14) / 16, 2))
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = (s.mode === 'combust' ? 0.85 : 0.4) * k
      m.scale.setScalar(0.6 + 0.7 * k)
      m.visible = k > 0.02
      if (k > bright) {
        bright = k
        brightX = CYL_X[i]
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
      {CYL_X.map((x, i) => (
        <mesh key={i} ref={(el) => (flashes.current[i] = el)} position={[x, 0.48, 0]}>
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
