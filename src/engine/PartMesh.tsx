import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { PartDef } from '../types'
import { SYSTEMS } from '../data/systems'
import { REMOVAL_SEQUENCE } from '../data/parts'
import { PIN_ANGLES, getCycle, simClock } from '../sim/engineCycle'
import { BUILDERS } from './geometry'
import { useStore } from '../store'
import { pName } from '../i18n/content'

const tmpVec = new THREE.Vector3()
const planeNormal = new THREE.Vector3()
const dragPlane = new THREE.Plane()
const hit = new THREE.Vector3()

/* scene-unit slider-crank used for piston animation (matches crank geometry) */
const R_S = 0.14
const ROD_S = 0.46
function pistonOffsetY(thetaDeg: number, pinDeg: number) {
  const th = ((thetaDeg + pinDeg) * Math.PI) / 180
  const s = R_S * Math.sin(th)
  const x = R_S * (1 - Math.cos(th)) + ROD_S - Math.sqrt(ROD_S * ROD_S - s * s)
  return R_S - x // +R_S at TDC, ≈ -R_S at BDC
}

/* parts that keep full opacity while the engine runs in sim modes */
const MOVING = new Set([
  'crankshaft', 'harmonic-damper', 'camshaft-intake', 'camshaft-exhaust', 'vanos-unit',
  'timing-chain', 'piston-1', 'piston-2', 'piston-3', 'piston-4', 'piston-5', 'piston-6',
])

export const PartMesh: React.FC<{ def: PartDef }> = ({ def }) => {
  const group = useRef<THREE.Group>(null!)
  const { camera, gl, controls } = useThree()
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(new THREE.Vector3())
  const dragOffset = useRef<[number, number, number]>([0, 0, 0])

  const mode = useStore((s) => s.mode)
  const selected = useStore((s) => s.selectedId === def.id)
  const hovered = useStore((s) => s.hoveredId === def.id)
  const exploded = useStore((s) => s.exploded)
  const hidden = useStore((s) => s.hiddenIds.has(def.id))
  const isolatedSystem = useStore((s) => s.isolatedSystem)
  const removed = useStore((s) => s.removedIds.has(def.id))
  const carrying = useStore((s) => s.carryingId === def.id)
  const offset = useStore((s) => s.offsets[def.id])
  const showLabels = useStore((s) => s.showLabels)
  const lang = useStore((s) => s.lang)
  const nextHighlight = useStore(
    (s) => s.mode === 'disassembly' && REMOVAL_SEQUENCE[s.disasmStep]?.id === def.id,
  )

  const system = SYSTEMS[def.system]

  const material = useMemo(() => {
    // blend system color toward workshop metal so parts read as machined alloy
    const c = new THREE.Color(system.color).lerp(new THREE.Color('#878d94'), 0.55)
    return new THREE.MeshStandardMaterial({
      color: c,
      metalness: 0.5,
      roughness: 0.42,
      transparent: true,
    })
  }, [system.color])
  const baseColor = useMemo(() => material.color.clone(), [material])

  // Visibility rules per mode
  const isolatedOut = isolatedSystem !== null && def.system !== isolatedSystem
  const goneInReassembly = mode === 'reassembly' && removed && !carrying
  const visible = !hidden && !goneInReassembly
  // The block is never removed but encloses the rotating assembly. During
  // teardown/reassembly, ghost it and let clicks pass through so the pistons
  // and crankshaft inside it can actually be seen and selected.
  const enclosingGhost = def.removalOrder === -1 && (mode === 'disassembly' || mode === 'reassembly')

  useEffect(() => {
    const noop = () => null
    group.current?.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) mesh.raycast = (enclosingGhost ? noop : THREE.Mesh.prototype.raycast) as THREE.Mesh['raycast']
    })
  }, [enclosingGhost])

  // Target position
  const target = useMemo(() => {
    const p = new THREE.Vector3(...def.position)
    if (exploded) p.add(tmpVec.set(...def.explodeOffset).clone())
    if (mode === 'disassembly' && removed) p.add(new THREE.Vector3(...def.explodeOffset).multiplyScalar(1.6))
    if (mode === 'reassembly' && carrying && !offset) p.add(new THREE.Vector3(...def.explodeOffset).multiplyScalar(1.3))
    if (offset) p.add(new THREE.Vector3(...offset))
    return p
  }, [def, exploded, mode, removed, carrying, offset])

  useFrame((_, dt) => {
    if (!group.current || dragging) return
    group.current.position.lerp(target, Math.min(1, dt * 6))

    const simMode = mode === 'combust' || mode === 'stress'
    if (simMode) {
      const th = (simClock.thetaDeg * Math.PI) / 180
      if (def.id === 'crankshaft' || def.id === 'harmonic-damper') {
        group.current.rotation.x = th % (Math.PI * 2)
      } else if (def.id.startsWith('camshaft') || def.id === 'vanos-unit') {
        group.current.rotation.x = (th / 2) % (Math.PI * 2)
      } else if (def.id.startsWith('piston-')) {
        const cyl = Number(def.id.slice(7)) - 1
        group.current.position.y = target.y + pistonOffsetY(simClock.thetaDeg, PIN_ANGLES[cyl])
      }
    } else if (group.current.rotation.x !== 0) {
      // settle back to the assembled pose when leaving sim modes
      group.current.rotation.x *= Math.max(0, 1 - dt * 6)
      if (Math.abs(group.current.rotation.x) < 0.01) group.current.rotation.x = 0
    }

    // stress heat-map coloring (blue → red by utilization), else base color
    if (mode === 'stress') {
      const st = useStore.getState()
      const u = getCycle(st.simRpm, st.simLoad).partUtil[def.id] ?? 0.05
      material.color.setHSL(0.62 * (1 - Math.min(Math.max(u, 0), 1)), 0.85, 0.5)
    } else if (!material.color.equals(baseColor)) {
      material.color.lerp(baseColor, Math.min(1, dt * 8))
    }

    // material state
    const m = material
    let emissive = 0x000000
    let intensity = 0
    if (selected) {
      emissive = 0x2266ff
      intensity = 0.55
    } else if (hovered) {
      emissive = 0x44aaff
      intensity = 0.3
    } else if (nextHighlight) {
      emissive = 0x22cc66
      intensity = 0.35 + Math.sin(performance.now() / 250) * 0.15
    }
    m.emissive.setHex(emissive)
    m.emissiveIntensity = intensity
    const targetOpacity =
      mode === 'flow'
        ? selected || hovered
          ? 0.45
          : 0.13
        : mode === 'combust'
          ? MOVING.has(def.id)
            ? 1
            : 0.14
          : mode === 'stress'
            ? MOVING.has(def.id)
              ? 1
              : 0.5
            : isolatedOut
              ? 0.08
              : enclosingGhost
                ? 0.16
                : mode === 'disassembly' && removed
                  ? 0.3
                  : 1
    m.opacity += (targetOpacity - m.opacity) * Math.min(1, dt * 8)
    m.depthWrite = m.opacity > 0.5
  })

  const draggable =
    (mode === 'explore' && selected && def.removalOrder !== -1) || (mode === 'reassembly' && carrying)

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!draggable) return
    e.stopPropagation()
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    if (controls) (controls as unknown as { enabled: boolean }).enabled = false
    gl.domElement.style.cursor = 'grabbing'
    planeNormal.copy(camera.getWorldDirection(new THREE.Vector3())).negate()
    dragPlane.setFromNormalAndCoplanarPoint(planeNormal, group.current.position)
    dragStart.current.copy(group.current.position)
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return
    e.stopPropagation()
    if (e.ray.intersectPlane(dragPlane, hit)) {
      group.current.position.copy(hit)
    }
  }

  const endDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging) return
    e.stopPropagation()
    setDragging(false)
    if (controls) (controls as unknown as { enabled: boolean }).enabled = true
    gl.domElement.style.cursor = 'auto'
    const st = useStore.getState()
    const pos = group.current.position
    if (mode === 'reassembly' && carrying) {
      const home = new THREE.Vector3(...def.position)
      if (pos.distanceTo(home) < 0.5) {
        st.attemptPlace(def.id) // snap or reject handled by store
        st.resetPart(def.id)
      } else {
        st.setOffset(def.id, [pos.x - def.position[0], pos.y - def.position[1], pos.z - def.position[2]])
      }
    } else {
      st.setOffset(def.id, [pos.x - def.position[0], pos.y - def.position[1], pos.z - def.position[2]])
    }
  }

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (isolatedOut) return
    const st = useStore.getState()
    if (mode === 'quiz') {
      st.answerIdentify(def.id)
      return
    }
    if (mode === 'disassembly') {
      if (!removed) st.attemptRemove(def.id)
      st.select(def.id)
      return
    }
    st.select(def.id)
  }

  const onDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    useStore.getState().focusPart(def.id)
  }

  const Builder = BUILDERS[def.build]
  if (!Builder) return null

  const labelVisible =
    showLabels && visible && !isolatedOut && (selected || hovered) && mode !== 'quiz'

  return (
    <group
      ref={group}
      position={def.position}
      rotation={def.rotation ?? [0, 0, 0]}
      visible={visible}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (!isolatedOut) useStore.getState().hover(def.id)
        if (!isolatedOut) gl.domElement.style.cursor = draggable ? 'grab' : 'pointer'
      }}
      onPointerOut={() => {
        useStore.getState().hover(null)
        if (!dragging) gl.domElement.style.cursor = 'auto'
      }}
    >
      <Builder material={material} />
      {labelVisible && (
        <Html center distanceFactor={9} position={[0, 0.45, 0]} style={{ pointerEvents: 'none' }}>
          <div className="part-label">{pName(lang, def)}</div>
        </Html>
      )}
    </group>
  )
}
