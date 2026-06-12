import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { PARTS, PART_MAP } from '../data/parts'
import { PartMesh } from './PartMesh'
import { FlowParticles } from './FlowParticles'
import { SimDriver } from './SimDriver'
import { useStore } from '../store'

const HOME_POS = new THREE.Vector3(4.6, 2.6, 5.2)
const HOME_TARGET = new THREE.Vector3(0, 0.3, 0)

const CameraRig: React.FC<{ controls: React.RefObject<OrbitControlsImpl> }> = ({ controls }) => {
  const resetToken = useStore((s) => s.resetViewToken)
  const focusId = useStore((s) => s.focusPartId)
  const { camera } = useThree()
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; t: number } | null>(null)

  useEffect(() => {
    if (resetToken > 0) goal.current = { pos: HOME_POS.clone(), target: HOME_TARGET.clone(), t: 0 }
  }, [resetToken])

  useEffect(() => {
    if (!focusId) return
    const def = PART_MAP.get(focusId)
    if (!def) return
    const target = new THREE.Vector3(...def.position)
    const exploded = useStore.getState().exploded
    if (exploded) target.add(new THREE.Vector3(...def.explodeOffset))
    const dir = camera.position.clone().sub(target).normalize().multiplyScalar(2.4)
    goal.current = { pos: target.clone().add(dir), target, t: 0 }
    useStore.getState().focusPart(null)
  }, [focusId, camera])

  useFrame((_, dt) => {
    const g = goal.current
    if (!g || !controls.current) return
    g.t += dt
    const k = Math.min(1, dt * 4)
    camera.position.lerp(g.pos, k)
    controls.current.target.lerp(g.target, k)
    controls.current.update()
    if (camera.position.distanceTo(g.pos) < 0.05 || g.t > 2) goal.current = null
  })
  return null
}

const SCENE_THEME = {
  dark: { bg: '#15191f', cell: '#2a323d', section: '#39434f', hemi: 0.5, shadow: 0.5 },
  light: { bg: '#dfe5ec', cell: '#c0cad6', section: '#a8b4c2', hemi: 0.75, shadow: 0.3 },
}

export const EngineScene: React.FC = () => {
  const controls = useRef<OrbitControlsImpl>(null!)
  const theme = useStore((s) => s.theme)
  const t = SCENE_THEME[theme]

  return (
    <Canvas
      shadows
      camera={{ position: [4.6, 2.6, 5.2], fov: 42, near: 0.1, far: 100 }}
      onPointerMissed={() => useStore.getState().select(null)}
      dpr={[1, 2]}
    >
      <color attach="background" args={[t.bg]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 4, -6]} intensity={0.45} />
      <directionalLight position={[0, -4, 2]} intensity={0.2} />
      <hemisphereLight args={['#9fb4cc', '#2a2620', t.hemi]} />

      {PARTS.map((p) => (
        <PartMesh key={p.id} def={p} />
      ))}
      <FlowParticles />
      <SimDriver />

      <Grid
        position={[0, -3.2, 0]}
        args={[30, 30]}
        cellColor={t.cell}
        sectionColor={t.section}
        fadeDistance={26}
        infiniteGrid
      />
      <ContactShadows position={[0, -3.18, 0]} opacity={t.shadow} scale={14} blur={2.2} far={5} />

      <OrbitControls
        ref={controls}
        target={[0, 0.3, 0]}
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={1.2}
        maxDistance={20}
      />
      <CameraRig controls={controls} />
    </Canvas>
  )
}
