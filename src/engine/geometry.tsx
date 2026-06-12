import * as THREE from 'three'
import React, { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import type { GeometryLayout } from '../engines/types'
import type { PartDef } from '../types'

/**
 * Procedural geometry builders. Each builder composes primitive meshes that
 * share a single material instance, so highlight states update the whole part.
 * Detail comes from composition: splined tubes, extruded profiles, bolt heads.
 */
export interface BuilderProps {
  material: THREE.Material
  layout: GeometryLayout
  params?: PartDef['buildParams']
}

type Builder = React.FC<BuilderProps>
type V3 = [number, number, number]

/* ---------------------------------- helpers ---------------------------------- */

const Tube: React.FC<{
  pts: V3[]
  r: number
  material: THREE.Material
  closed?: boolean
  seg?: number
}> = ({ pts, r, material, closed = false, seg = 32 }) => {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed, 'catmullrom', 0.5),
    // static per builder instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <mesh material={material}>
      <tubeGeometry args={[curve, seg, r, 12, closed]} />
    </mesh>
  )
}

/** hex bolt head */
const Bolt: React.FC<{ p: V3; material: THREE.Material; r?: number; h?: number; rot?: V3 }> = ({
  p,
  material,
  r = 0.022,
  h = 0.025,
  rot = [0, 0, 0],
}) => (
  <mesh material={material} position={p} rotation={rot}>
    <cylinderGeometry args={[r, r, h, 6]} />
  </mesh>
)

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** rounded casting body, extruded along world X */
const CastBody: React.FC<{
  material: THREE.Material
  w: number // along X
  h: number
  d: number
  r?: number
  position?: V3
}> = ({ material, w, h, d, r = 0.07, position = [0, 0, 0] }) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(d, h, r), { depth: w, bevelEnabled: false })
    g.rotateY(Math.PI / 2)
    g.translate(-w / 2, 0, 0)
    return g
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <mesh material={material} geometry={geo} position={position} />
}

/** cam lobe: egg profile extruded across the shaft */
const lobeGeo = (() => {
  const s = new THREE.Shape()
  s.absarc(0, 0, 0.052, 0.7, Math.PI * 2 - 0.7, false)
  s.lineTo(0.105, 0)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.055, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1 })
  g.translate(0, 0, -0.0275)
  return g
})()

/** crank counterweight: sector wedge */
const weightGeo = (() => {
  const s = new THREE.Shape()
  const a = 1.15 // half-angle
  s.moveTo(0, 0)
  s.lineTo(Math.cos(Math.PI / 2 + a) * 0.22, Math.sin(Math.PI / 2 + a) * 0.22)
  s.absarc(0, 0, 0.22, Math.PI / 2 + a, Math.PI / 2 - a, true)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.055, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1 })
  g.translate(0, 0, -0.0275)
  return g
})()

/** toothed sprocket ring */
const Sprocket: React.FC<{ material: THREE.Material; r: number; w: number; teeth?: number }> = ({
  material,
  r,
  w,
  teeth = 14,
}) => (
  <group>
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[r, r, w, 24]} />
    </mesh>
    {Array.from({ length: teeth }).map((_, i) => {
      const a = (i / teeth) * Math.PI * 2
      return (
        <mesh
          key={i}
          material={material}
          position={[0, Math.cos(a) * (r + 0.012), Math.sin(a) * (r + 0.012)]}
          rotation={[-a, 0, 0]}
        >
          <boxGeometry args={[w * 0.9, 0.025, 0.018]} />
        </mesh>
      )
    })}
  </group>
)

/* ---------------------------------- block ---------------------------------- */

const Block: Builder = ({ material, layout }) => {
  const cyls = layout.cylX
  const blockW = layout.blockHalfLen * 2
  return (
  <group>
    {/* upper crankcase */}
    <CastBody material={material} w={blockW} h={0.62} d={1.0} r={0.05} position={[0, 0.26, 0]} />
    {/* deck plate */}
    <mesh material={material} position={[0, 0.575, 0]}>
      <boxGeometry args={[blockW + 0.04, 0.035, 1.02]} />
    </mesh>
    {/* bores: recessed dark circles + rim */}
    {cyls.map((x) => (
      <group key={x} position={[x, 0.59, 0]}>
        <mesh material={material} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.185, 0.012, 8, 28]} />
        </mesh>
        <mesh material={material} position={[0, -0.025, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.01, 28]} />
        </mesh>
        {/* head bolt bosses */}
        {[0.42, -0.42].map((z) => (
          <Bolt key={z} material={material} p={[0, 0.005, z]} r={0.018} />
        ))}
      </group>
    ))}
    {/* skirt, slightly tapered via two stacked casts */}
    <CastBody material={material} w={blockW} h={0.34} d={0.9} r={0.05} position={[0, -0.22, 0]} />
    {/* bedplate girdle */}
    <CastBody material={material} w={blockW} h={0.24} d={0.8} r={0.04} position={[0, -0.5, 0]} />
    {/* main cap bolt bosses along girdle */}
    {Array.from({ length: cyls.length + 1 }, (_, i) => -layout.blockHalfLen + (i * blockW) / cyls.length).map((x) => (
      <group key={x}>
        <Bolt material={material} p={[x, -0.63, 0.18]} rot={[Math.PI, 0, 0]} />
        <Bolt material={material} p={[x, -0.63, -0.18]} rot={[Math.PI, 0, 0]} />
      </group>
    ))}
    {/* side ribbing */}
    {cyls.map((x) => (
      <group key={x}>
        <mesh material={material} position={[x, 0.05, 0.51]}>
          <boxGeometry args={[0.05, 0.62, 0.035]} />
        </mesh>
        <mesh material={material} position={[x, 0.05, -0.51]}>
          <boxGeometry args={[0.05, 0.62, 0.035]} />
        </mesh>
      </group>
    ))}
    <mesh material={material} position={[0, -0.07, 0.52]}>
      <boxGeometry args={[blockW - 0.1, 0.05, 0.03]} />
    </mesh>
    <mesh material={material} position={[0, -0.07, -0.52]}>
      <boxGeometry args={[blockW - 0.1, 0.05, 0.03]} />
    </mesh>
    {/* rear bellhousing flange */}
    <mesh material={material} position={[layout.blockHalfLen + 0.03, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.52, 0.52, 0.06, 36]} />
    </mesh>
    {/* front accessory bosses */}
    <mesh material={material} position={[-layout.blockHalfLen - 0.02, 0.1, 0.3]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.09, 0.09, 0.08, 16]} />
    </mesh>
    <mesh material={material} position={[-layout.blockHalfLen - 0.02, -0.25, -0.25]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, 0.08, 16]} />
    </mesh>
    {/* engine mount plates with bolts */}
    {[-0.6, 0.6].map((x) => (
      <group key={x} position={[x, -0.05, -0.55]}>
        <RoundedBox material={material} args={[0.42, 0.3, 0.1]} radius={0.03} />
        <Bolt material={material} p={[-0.13, 0.08, -0.05]} rot={[Math.PI / 2, 0, 0]} />
        <Bolt material={material} p={[0.13, 0.08, -0.05]} rot={[Math.PI / 2, 0, 0]} />
        <Bolt material={material} p={[0, -0.08, -0.05]} rot={[Math.PI / 2, 0, 0]} />
      </group>
    ))}
    {/* knock sensor bosses */}
    <mesh material={material} position={[-0.5, 0.2, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
    </mesh>
    <mesh material={material} position={[0.5, 0.2, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
    </mesh>
  </group>
  )
}

/* ---------------------------------- head ---------------------------------- */

const Head: Builder = ({ material, layout }) => {
  const cyls = layout.cylX
  const blockW = layout.blockHalfLen * 2
  return (
  <group>
    <CastBody material={material} w={blockW} h={0.36} d={0.95} r={0.05} position={[0, -0.04, 0]} />
    {/* cam carrier ledge */}
    <CastBody material={material} w={blockW} h={0.14} d={0.78} r={0.04} position={[0, 0.2, 0]} />
    {/* cam bearing towers */}
    {Array.from({ length: cyls.length + 1 }, (_, i) => -layout.blockHalfLen + (i * blockW) / cyls.length).map((x) => (
      <mesh key={x} material={material} position={[x, 0.3, 0]}>
        <boxGeometry args={[0.09, 0.1, 0.72]} />
      </mesh>
    ))}
    {/* intake ports: oval flanges */}
    {cyls.map((x) => (
      <group key={`i${x}`} position={[x, -0.04, 0.49]}>
        <mesh material={material} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.4]}>
          <cylinderGeometry args={[0.085, 0.095, 0.06, 18]} />
        </mesh>
        <RoundedBox material={material} args={[0.24, 0.3, 0.025]} radius={0.02} position={[0, 0, 0.025]} />
      </group>
    ))}
    {/* exhaust ports with stud pairs */}
    {cyls.map((x) => (
      <group key={`e${x}`} position={[x, -0.06, -0.49]}>
        <mesh material={material} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.085, 0.06, 18]} />
        </mesh>
        <RoundedBox material={material} args={[0.22, 0.26, 0.025]} radius={0.02} position={[0, 0, -0.02]} />
        <Bolt material={material} p={[-0.085, 0.1, -0.03]} r={0.015} rot={[Math.PI / 2, 0, 0]} />
        <Bolt material={material} p={[0.085, -0.1, -0.03]} r={0.015} rot={[Math.PI / 2, 0, 0]} />
      </group>
    ))}
    {/* injector bosses, angled on the intake side */}
    {cyls.map((x) => (
      <mesh key={`inj${x}`} material={material} position={[x, 0.05, 0.38]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.14, 12]} />
      </mesh>
    ))}
    {/* front VANOS housing bulge */}
    <RoundedBox material={material} args={[0.18, 0.42, 0.8]} radius={0.05} position={[-layout.blockHalfLen + 0.05, 0.05, 0]} />
  </group>
  )
}

/* ------------------------------- valve cover ------------------------------- */

const ValveCover: Builder = ({ material, layout }) => {
  const cyls = layout.cylX
  const blockW = layout.blockHalfLen * 2
  const shellGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(0.86, 0.3, 0.1), { depth: blockW - 0.06, bevelEnabled: false })
    g.rotateY(Math.PI / 2)
    g.translate(-(blockW - 0.06) / 2, 0.05, 0)
    return g
  }, [blockW])
  return (
    <group>
      <mesh material={material} geometry={shellGeo} />
      {/* plug tube recesses along the centerline */}
      {cyls.map((x) => (
        <mesh key={x} material={material} position={[x, 0.21, 0]}>
          <cylinderGeometry args={[0.062, 0.075, 0.05, 16]} />
        </mesh>
      ))}
      {/* longitudinal cast ribs */}
      {[0.26, -0.26].map((z) => (
        <mesh key={z} material={material} position={[0, 0.19, z]} rotation={[z > 0 ? -0.22 : 0.22, 0, 0]}>
          <boxGeometry args={[blockW - 0.3, 0.025, 0.1]} />
        </mesh>
      ))}
      {/* oil filler cap */}
      <group position={[-0.95, 0.225, 0.25]}>
        <mesh material={material}>
          <cylinderGeometry args={[0.08, 0.085, 0.05, 8]} />
        </mesh>
        <mesh material={material} position={[0, 0.03, 0]}>
          <boxGeometry args={[0.13, 0.02, 0.04]} />
        </mesh>
      </group>
      {/* badge plate */}
      <RoundedBox material={material} args={[0.5, 0.02, 0.18]} radius={0.01} position={[0.9, 0.21, 0]} />
      {/* perimeter bolts */}
      {cyls.map((x) => (
        <group key={x}>
          <Bolt material={material} p={[x, -0.07, 0.42]} r={0.018} rot={[0, 0, 0]} />
          <Bolt material={material} p={[x, -0.07, -0.42]} r={0.018} rot={[0, 0, 0]} />
        </group>
      ))}
      {/* PCV port */}
      <mesh material={material} position={[1.45, 0.15, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.12, 12]} />
      </mesh>
    </group>
  )
}

/* --------------------------------- camshaft --------------------------------- */

const Camshaft: Builder = ({ material, layout }) => (
  <group>
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.038, 0.038, layout.blockHalfLen * 2 - 0.2, 14]} />
    </mesh>
    {/* journals */}
    {Array.from({ length: layout.cylX.length + 1 }, (_, i) => -layout.blockHalfLen + (i * layout.blockHalfLen * 2) / layout.cylX.length).map((x) => (
      <mesh key={x} material={material} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.052, 0.052, 0.06, 16]} />
      </mesh>
    ))}
    {/* egg-profile lobes, phased per cylinder (firing order spread) */}
    {layout.cylX.map((x, i) => {
      const phase = (i * 240 * Math.PI) / 180
      return (
        <group key={x}>
          <mesh material={material} geometry={lobeGeo} position={[x - 0.1, 0, 0]} rotation={[0, Math.PI / 2, phase]} />
          <mesh material={material} geometry={lobeGeo} position={[x + 0.1, 0, 0]} rotation={[0, Math.PI / 2, phase]} />
        </group>
      )
    })}
    {/* front nose for the phaser */}
    <mesh material={material} position={[-layout.blockHalfLen + 0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 0.12, 12]} />
    </mesh>
    {/* rear HPFP drive cam */}
    <mesh material={material} geometry={lobeGeo} position={[layout.blockHalfLen - 0.13, 0, 0]} rotation={[0, Math.PI / 2, 1.1]} scale={1.2} />
  </group>
)

/* ---------------------------------- piston ---------------------------------- */

const Piston: Builder = ({ material }) => (
  <group>
    {/* crown */}
    <mesh material={material} position={[0, 0.28, 0]}>
      <cylinderGeometry args={[0.185, 0.185, 0.1, 28]} />
    </mesh>
    {/* ring grooves */}
    {[0.245, 0.215, 0.185].map((y) => (
      <mesh key={y} material={material} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.186, 0.007, 6, 28]} />
      </mesh>
    ))}
    {/* skirt panels */}
    <mesh material={material} position={[0, 0.13, 0]}>
      <cylinderGeometry args={[0.18, 0.175, 0.12, 28, 1, true]} />
    </mesh>
    {/* pin bosses + wrist pin */}
    <mesh material={material} position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.3, 14]} />
    </mesh>
    {/* small end */}
    <mesh material={material} position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.055, 0.022, 8, 18]} />
    </mesh>
    {/* I-beam rod: web + flanges */}
    <mesh material={material} position={[0, -0.11, 0]}>
      <boxGeometry args={[0.06, 0.42, 0.03]} />
    </mesh>
    <mesh material={material} position={[0, -0.11, 0.035]}>
      <boxGeometry args={[0.095, 0.4, 0.022]} />
    </mesh>
    <mesh material={material} position={[0, -0.11, -0.035]}>
      <boxGeometry args={[0.095, 0.4, 0.022]} />
    </mesh>
    {/* big end + cap */}
    <mesh material={material} position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.09, 20]} />
    </mesh>
    <mesh material={material} position={[0, -0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.1, 0.018, 8, 20]} />
    </mesh>
    {/* rod bolts */}
    <Bolt material={material} p={[-0.07, -0.45, 0]} r={0.016} rot={[Math.PI, 0, 0]} />
    <Bolt material={material} p={[0.07, -0.45, 0]} r={0.016} rot={[Math.PI, 0, 0]} />
  </group>
)

/* -------------------------------- crankshaft -------------------------------- */

const Crankshaft: Builder = ({ material, layout }) => {
  const journals = Array.from({ length: layout.cylX.length + 1 }, (_, i) => -layout.blockHalfLen + (i * layout.blockHalfLen * 2) / layout.cylX.length)
  return (
    <group>
      {journals.map((x) => (
        <mesh key={`m${x}`} material={material} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.105, 0.105, 0.13, 20]} />
        </mesh>
      ))}
      {layout.cylX.map((x, i) => {
        const ang = (layout.pinAnglesDeg[i] * Math.PI) / 180
        const py = Math.cos(ang) * layout.crankRScene
        const pz = Math.sin(ang) * layout.crankRScene
        return (
          <group key={`p${x}`}>
            {/* rod pin with fillets */}
            <mesh material={material} position={[x, py, pz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.085, 0.085, 0.12, 18]} />
            </mesh>
            {/* webs: counterweight wedges opposite the pin */}
            {[-0.095, 0.095].map((dx) => (
              <mesh
                key={dx}
                material={material}
                geometry={weightGeo}
                position={[x + dx, 0, 0]}
                rotation={[ang + Math.PI, Math.PI / 2, 0]}
              />
            ))}
            {/* web arms connecting journal to pin */}
            {[-0.095, 0.095].map((dx) => (
              <mesh
                key={`a${dx}`}
                material={material}
                position={[x + dx, py / 2, pz / 2]}
                rotation={[ang, 0, 0]}
              >
                <boxGeometry args={[0.055, 0.34, 0.2]} />
              </mesh>
            ))}
          </group>
        )
      })}
      {/* nose with drive sprocket */}
      <mesh material={material} position={[-layout.blockHalfLen - 0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.065, 0.32, 16]} />
      </mesh>
      <group position={[-layout.blockHalfLen + 0.03, 0, 0]}>
        <Sprocket material={material} r={0.1} w={0.05} teeth={12} />
      </group>
      {/* rear flange with bolt circle */}
      <mesh material={material} position={[layout.blockHalfLen + 0.01, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, 0.07, 28]} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <Bolt
            key={i}
            material={material}
            p={[layout.blockHalfLen + 0.05, Math.cos(a) * 0.11, Math.sin(a) * 0.11]}
            r={0.016}
            rot={[0, 0, Math.PI / 2]}
          />
        )
      })}
    </group>
  )
}

/* ------------------------------ harmonic damper ------------------------------ */

const Damper: Builder = ({ material }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    {/* hub */}
    <mesh material={material}>
      <cylinderGeometry args={[0.12, 0.12, 0.14, 24]} />
    </mesh>
    {/* elastomer ring */}
    <mesh material={material} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.21, 0.035, 10, 36]} />
    </mesh>
    {/* outer pulley with V-groove ribs */}
    {[-0.045, -0.015, 0.015, 0.045].map((y) => (
      <mesh key={y} material={material} position={[0, y, 0]}>
        <cylinderGeometry args={[0.285, 0.27, 0.022, 36]} />
      </mesh>
    ))}
    {/* face bolts + center bolt */}
    {Array.from({ length: 4 }).map((_, i) => {
      const a = (i / 4) * Math.PI * 2 + 0.4
      return <Bolt key={i} material={material} p={[Math.cos(a) * 0.07, -0.08, Math.sin(a) * 0.07]} r={0.018} />
    })}
    <Bolt material={material} p={[0, -0.09, 0]} r={0.035} h={0.04} />
  </group>
)

/* -------------------------------- timing parts -------------------------------- */

const TimingCover: Builder = ({ material }) => (
  <group>
    <RoundedBox material={material} args={[0.09, 1.85, 0.95]} radius={0.03} />
    <RoundedBox material={material} args={[0.09, 0.55, 0.72]} radius={0.03} position={[0, -1.0, 0]} />
    {/* front crank seal boss */}
    <mesh material={material} position={[-0.05, -0.74, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.16, 0.16, 0.05, 24]} />
    </mesh>
    <mesh material={material} position={[-0.07, -0.74, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.12, 0.015, 8, 24]} />
    </mesh>
    {/* perimeter bolts */}
    {[0.85, 0.5, 0.15, -0.2, -0.55].map((y) => (
      <group key={y}>
        <Bolt material={material} p={[-0.055, y, 0.4]} rot={[0, 0, Math.PI / 2]} r={0.018} />
        <Bolt material={material} p={[-0.055, y, -0.4]} rot={[0, 0, Math.PI / 2]} r={0.018} />
      </group>
    ))}
    {/* cast ribs */}
    <mesh material={material} position={[-0.05, 0.2, 0]} rotation={[0, 0, 0.2]}>
      <boxGeometry args={[0.02, 1.5, 0.06]} />
    </mesh>
    <mesh material={material} position={[-0.05, 0.1, 0.2]} rotation={[0.3, 0, -0.15]}>
      <boxGeometry args={[0.02, 1.4, 0.06]} />
    </mesh>
  </group>
)

const Vanos: Builder = ({ material }) => (
  <group>
    {[0.24, -0.24].map((z) => (
      <group key={z} position={[0, 0, z]}>
        <Sprocket material={material} r={0.14} w={0.07} teeth={16} />
        {/* phaser body */}
        <mesh material={material} position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 20]} />
        </mesh>
        {/* central valve bolt */}
        <Bolt material={material} p={[-0.09, 0, 0]} r={0.03} h={0.03} rot={[0, 0, Math.PI / 2]} />
      </group>
    ))}
    {/* solenoid bosses */}
    {[0.24, -0.24].map((z) => (
      <mesh key={`s${z}`} material={material} position={[-0.16, 0.12, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.1, 10]} />
      </mesh>
    ))}
  </group>
)

const TimingChain: Builder = ({ material }) => (
  <group>
    {/* duplex chain: two parallel splined loops crank → cam sprockets */}
    {[-0.03, 0.03].map((dx) => (
      <Tube
        key={dx}
        material={material}
        closed
        r={0.022}
        pts={[
          [dx, -0.72, 0.13],
          [dx, -0.2, 0.3],
          [dx, 0.45, 0.38],
          [dx, 0.72, 0.24],
          [dx, 0.78, 0],
          [dx, 0.72, -0.24],
          [dx, 0.45, -0.38],
          [dx, -0.2, -0.3],
          [dx, -0.72, -0.13],
          [dx, -0.85, 0],
        ]}
        seg={48}
      />
    ))}
    {/* crank sprocket */}
    <group position={[0, -0.72, 0]}>
      <Sprocket material={material} r={0.11} w={0.08} teeth={12} />
    </group>
    {/* guide rails: curved */}
    <Tube material={material} r={0.028} pts={[[0, -0.6, 0.22], [0, -0.1, 0.33], [0, 0.5, 0.4]]} seg={16} />
    <Tube material={material} r={0.028} pts={[[0, -0.6, -0.22], [0, -0.1, -0.33], [0, 0.5, -0.4]]} seg={16} />
    {/* hydraulic tensioner body */}
    <group position={[0.02, -0.15, -0.42]} rotation={[0.4, 0, 0]}>
      <mesh material={material}>
        <cylinderGeometry args={[0.045, 0.045, 0.2, 12]} />
      </mesh>
      <Bolt material={material} p={[0, -0.13, 0]} r={0.035} h={0.05} />
    </group>
  </group>
)

/* ---------------------------------- turbo ---------------------------------- */

const Turbo: Builder = ({ material }) => (
  <group>
    {/* turbine volute: spiral suggested by offset scaled torus */}
    <group position={[-0.14, 0, 0]}>
      <mesh material={material} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.15]}>
        <torusGeometry args={[0.115, 0.075, 14, 28]} />
      </mesh>
      {/* turbine inlet flange */}
      <RoundedBox material={material} args={[0.1, 0.16, 0.22]} radius={0.02} position={[0, -0.06, 0.16]} rotation={[0.5, 0, 0]} />
      {/* V-band ring */}
      <mesh material={material} position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.014, 8, 24]} />
      </mesh>
    </group>
    {/* CHRA center cartridge */}
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.075, 0.075, 0.26, 18]} />
    </mesh>
    {/* oil feed (top) and return (bottom) fittings */}
    <mesh material={material} position={[0, 0.09, 0]}>
      <cylinderGeometry args={[0.022, 0.022, 0.08, 8]} />
    </mesh>
    <mesh material={material} position={[0, -0.1, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
    </mesh>
    {/* compressor cover */}
    <group position={[0.16, 0, 0]}>
      <mesh material={material} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 1.25]}>
        <torusGeometry args={[0.125, 0.08, 14, 28]} />
      </mesh>
      {/* axial inlet */}
      <mesh material={material} position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.105, 0.12, 20]} />
      </mesh>
      {/* compressor outlet elbow */}
      <Tube material={material} r={0.055} pts={[[0, 0.1, -0.08], [0, 0.18, -0.16], [0.02, 0.22, -0.26]]} seg={12} />
    </group>
    {/* wastegate actuator: can + rod */}
    <group position={[-0.1, 0.16, 0.1]}>
      <mesh material={material} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.05, 16]} />
      </mesh>
      <mesh material={material} position={[-0.02, -0.07, 0.02]} rotation={[0.4, 0, 0.3]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
      </mesh>
    </group>
  </group>
)

/* ------------------------------ exhaust manifold ------------------------------ */

const ExhaustManifold: Builder = ({ material }) => (
  <group>
    {/* three splined runners from head flange down into the collector */}
    {[-0.5, 0, 0.5].map((x) => (
      <Tube
        key={x}
        material={material}
        r={0.062}
        pts={[
          [x, 0.18, 0.22],
          [x * 0.85, 0.12, 0.0],
          [x * 0.45, -0.05, -0.14],
          [x * 0.15, -0.12, -0.18],
        ]}
        seg={20}
      />
    ))}
    {/* port flanges with studs */}
    {[-0.5, 0, 0.5].map((x) => (
      <group key={`f${x}`} position={[x, 0.18, 0.26]}>
        <RoundedBox material={material} args={[0.22, 0.24, 0.04]} radius={0.02} />
        <Bolt material={material} p={[-0.085, 0.09, 0]} r={0.014} rot={[Math.PI / 2, 0, 0]} />
        <Bolt material={material} p={[0.085, -0.09, 0]} r={0.014} rot={[Math.PI / 2, 0, 0]} />
      </group>
    ))}
    {/* collector */}
    <mesh material={material} position={[0, -0.13, -0.2]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.095, 0.095, 0.5, 18]} />
    </mesh>
    {/* turbo flange */}
    <mesh material={material} position={[0, -0.13, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
    </mesh>
  </group>
)

/* ------------------------------- intake manifold ------------------------------- */

const IntakeManifold: Builder = ({ material, layout }) => (
  <group>
    {/* plenum: rounded casting with integrated charge cooler */}
    <CastBody material={material} w={layout.blockHalfLen * 2 - 0.3} h={0.46} d={0.5} r={0.14} position={[0, 0.02, 0.32]} />
    {/* charge cooler end tanks */}
    {[-layout.blockHalfLen + 0.1, layout.blockHalfLen - 0.1].map((x) => (
      <RoundedBox key={x} material={material} args={[0.16, 0.4, 0.44]} radius={0.05} position={[x, 0.02, 0.32]} />
    ))}
    {/* low-temp coolant fittings on the end tanks */}
    {[-layout.blockHalfLen + 0.03, layout.blockHalfLen - 0.03].map((x) => (
      <mesh key={`c${x}`} material={material} position={[x, 0.16, 0.32]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 10]} />
      </mesh>
    ))}
    {/* curved runners into the head flange */}
    {layout.cylX.map((x) => (
      <Tube
        key={x}
        material={material}
        r={0.075}
        pts={[
          [x, 0.05, 0.28],
          [x, 0.0, 0.1],
          [x, -0.08, -0.05],
          [x, -0.12, -0.16],
        ]}
        seg={14}
      />
    ))}
    {/* head flange strip with bolts */}
    <RoundedBox material={material} args={[layout.blockHalfLen * 2 - 0.2, 0.34, 0.05]} radius={0.02} position={[0, -0.1, -0.2]} />
    {Array.from({ length: layout.cylX.length + 1 }, (_, i) => -layout.blockHalfLen + (i * layout.blockHalfLen * 2) / layout.cylX.length).map((x) => (
      <Bolt key={x} material={material} p={[x, 0.08, -0.2]} r={0.016} rot={[Math.PI / 2, 0, 0]} />
    ))}
    {/* cast rib on the plenum face */}
    <mesh material={material} position={[0, 0.06, 0.58]}>
      <boxGeometry args={[layout.blockHalfLen * 2 - 0.7, 0.04, 0.02]} />
    </mesh>
    {/* MAP sensor boss */}
    <mesh material={material} position={[0.6, 0.26, 0.32]}>
      <cylinderGeometry args={[0.035, 0.035, 0.06, 10]} />
    </mesh>
  </group>
)

/* -------------------------------- throttle body -------------------------------- */

const ThrottleBody: Builder = ({ material }) => (
  <group rotation={[Math.PI / 2, 0, 0]}>
    {/* bore housing */}
    <mesh material={material}>
      <cylinderGeometry args={[0.13, 0.13, 0.2, 24]} />
    </mesh>
    {/* inlet/outlet flanges */}
    <mesh material={material} position={[0, 0.11, 0]}>
      <cylinderGeometry args={[0.155, 0.155, 0.025, 24]} />
    </mesh>
    <mesh material={material} position={[0, -0.11, 0]}>
      <cylinderGeometry args={[0.155, 0.155, 0.025, 24]} />
    </mesh>
    {/* butterfly shaft */}
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
    </mesh>
    {/* actuator motor housing */}
    <group position={[0.17, 0, 0.04]}>
      <RoundedBox material={material} args={[0.12, 0.18, 0.14]} radius={0.03} />
      <mesh material={material} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
      </mesh>
    </group>
    {/* flange bolts */}
    {Array.from({ length: 4 }).map((_, i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      return <Bolt key={i} material={material} p={[Math.cos(a) * 0.14, 0.12, Math.sin(a) * 0.14]} r={0.014} />
    })}
  </group>
)

/* ---------------------------------- fuel ---------------------------------- */

const FuelRail: Builder = ({ material, layout }) => (
  <group>
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.045, 0.045, layout.blockHalfLen * 2 - 0.6, 16]} />
    </mesh>
    {/* injector cups */}
    {layout.cylX.map((x) => (
      <mesh key={x} material={material} position={[x, -0.06, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 10]} />
      </mesh>
    ))}
    {/* supply union + pressure sensor */}
    <mesh material={material} position={[-layout.blockHalfLen + 0.27, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.055, 0.06, 6]} />
    </mesh>
    <mesh material={material} position={[layout.blockHalfLen - 0.45, 0.07, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.07, 6]} />
    </mesh>
    {/* mounting tabs */}
    {[-layout.blockHalfLen * 0.55, 0, layout.blockHalfLen * 0.55].map((x) => (
      <group key={x}>
        <RoundedBox material={material} args={[0.06, 0.02, 0.12]} radius={0.008} position={[x, 0, -0.08]} />
        <Bolt material={material} p={[x, 0.02, -0.13]} r={0.014} />
      </group>
    ))}
  </group>
)

const Injectors: Builder = ({ material, layout }) => (
  <group>
    {layout.cylX.map((x) => (
      <group key={x} position={[x, 0, 0]} rotation={[0.5, 0, 0]}>
        {/* connector head */}
        <RoundedBox material={material} args={[0.07, 0.06, 0.05]} radius={0.012} position={[0, 0.13, 0.03]} />
        {/* body */}
        <mesh material={material} position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.14, 12]} />
        </mesh>
        {/* nozzle taper + tip */}
        <mesh material={material} position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.032, 0.016, 0.1, 12]} />
        </mesh>
        <mesh material={material} position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.012, 0.01, 0.05, 8]} />
        </mesh>
      </group>
    ))}
  </group>
)

const Hpfp: Builder = ({ material }) => (
  <group>
    {/* pump body */}
    <mesh material={material}>
      <cylinderGeometry args={[0.09, 0.095, 0.22, 18]} />
    </mesh>
    {/* solenoid cap */}
    <mesh material={material} position={[0, 0.14, 0]}>
      <cylinderGeometry args={[0.06, 0.06, 0.07, 14]} />
    </mesh>
    {/* high-pressure union + line stub */}
    <mesh material={material} position={[0.1, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.035, 0.035, 0.07, 6]} />
    </mesh>
    <Tube material={material} r={0.012} pts={[[0.14, 0.05, 0], [0.2, 0.0, 0.06], [0.22, -0.08, 0.1]]} seg={10} />
    {/* tappet flange with bolts */}
    <RoundedBox material={material} args={[0.2, 0.03, 0.2]} radius={0.015} position={[0, -0.12, 0]} />
    <Bolt material={material} p={[-0.08, -0.1, 0.08]} r={0.015} />
    <Bolt material={material} p={[0.08, -0.1, -0.08]} r={0.015} />
  </group>
)

/* --------------------------------- cooling --------------------------------- */

const WaterPump: Builder = ({ material }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    {/* volute housing */}
    <mesh material={material} scale={[1, 0.55, 1]}>
      <sphereGeometry args={[0.19, 22, 16]} />
    </mesh>
    {/* mounting flange */}
    <mesh material={material} position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.035, 24]} />
    </mesh>
    {/* pulley face */}
    <mesh material={material} position={[0, -0.13, 0]}>
      <cylinderGeometry args={[0.13, 0.13, 0.05, 20]} />
    </mesh>
    {/* inlet neck */}
    <Tube material={material} r={0.045} pts={[[0.12, 0, 0.12], [0.2, 0, 0.2], [0.24, 0, 0.32]]} seg={10} />
    {/* flange bolts */}
    {Array.from({ length: 5 }).map((_, i) => {
      const a = (i / 5) * Math.PI * 2
      return <Bolt key={i} material={material} p={[Math.cos(a) * 0.18, 0.13, Math.sin(a) * 0.18]} r={0.016} />
    })}
  </group>
)

const Thermostat: Builder = ({ material }) => (
  <group>
    {/* housing dome */}
    <mesh material={material} scale={[1, 0.8, 1.1]}>
      <sphereGeometry args={[0.12, 18, 14]} />
    </mesh>
    {/* base flange */}
    <RoundedBox material={material} args={[0.24, 0.04, 0.26]} radius={0.015} position={[0, -0.09, 0]} />
    {/* hose necks */}
    <Tube material={material} r={0.04} pts={[[-0.08, 0.04, 0], [-0.16, 0.07, 0.02], [-0.22, 0.07, 0.06]]} seg={10} />
    <Tube material={material} r={0.035} pts={[[0.06, 0.06, 0.04], [0.1, 0.12, 0.1], [0.12, 0.14, 0.18]]} seg={10} />
    <Bolt material={material} p={[-0.09, -0.06, 0.1]} r={0.015} />
    <Bolt material={material} p={[0.09, -0.06, -0.1]} r={0.015} />
  </group>
)

/* -------------------------------- lubrication -------------------------------- */

const OilFilter: Builder = ({ material }) => (
  <group>
    {/* canister with vertical ribs */}
    <mesh material={material}>
      <cylinderGeometry args={[0.12, 0.125, 0.28, 22]} />
    </mesh>
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2
      return (
        <mesh key={i} material={material} position={[Math.cos(a) * 0.125, 0, Math.sin(a) * 0.125]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.015, 0.24, 0.025]} />
        </mesh>
      )
    })}
    {/* hex service cap */}
    <mesh material={material} position={[0, 0.18, 0]}>
      <cylinderGeometry args={[0.09, 0.11, 0.07, 6]} />
    </mesh>
    {/* base block with oil galleries */}
    <RoundedBox material={material} args={[0.26, 0.08, 0.22]} radius={0.02} position={[0, -0.18, 0]} />
    <Tube material={material} r={0.025} pts={[[0.1, -0.18, 0.08], [0.18, -0.22, 0.14]]} seg={6} />
  </group>
)

const OilPan: Builder = ({ material }) => (
  <group>
    {/* sealing flange with perimeter bolts */}
    <RoundedBox material={material} args={[3.24, 0.05, 0.92]} radius={0.02} position={[0, 0.18, 0]} />
    {[-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5].map((x) => (
      <group key={x}>
        <Bolt material={material} p={[x, 0.18, 0.43]} r={0.015} />
        <Bolt material={material} p={[x, 0.18, -0.43]} r={0.015} />
      </group>
    ))}
    {/* upper pan */}
    <CastBody material={material} w={3.15} h={0.22} d={0.82} r={0.05} position={[0, 0.05, 0]} />
    {/* deep sump with chamfered transition */}
    <CastBody material={material} w={1.7} h={0.34} d={0.68} r={0.07} position={[-0.65, -0.2, 0]} />
    <mesh material={material} position={[0.35, -0.1, 0]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[0.34, 0.2, 0.66]} />
    </mesh>
    {/* cooling fins on the sump */}
    {[-1.1, -0.85, -0.6, -0.35, -0.1].map((x) => (
      <mesh key={x} material={material} position={[x, -0.34, 0]}>
        <boxGeometry args={[0.03, 0.08, 0.6]} />
      </mesh>
    ))}
    {/* drain plug */}
    <Bolt material={material} p={[-0.65, -0.39, 0.12]} r={0.03} h={0.035} rot={[Math.PI, 0, 0]} />
    {/* oil level sensor boss */}
    <mesh material={material} position={[0.2, -0.13, 0.3]}>
      <cylinderGeometry args={[0.04, 0.04, 0.05, 10]} />
    </mesh>
  </group>
)

const OilPump: Builder = ({ material }) => (
  <group>
    {/* pump housing */}
    <RoundedBox material={material} args={[0.34, 0.2, 0.28]} radius={0.04} />
    {/* rotor cover */}
    <mesh material={material} position={[0.1, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
    </mesh>
    {/* drive sprocket */}
    <group position={[0.19, 0.04, 0]}>
      <Sprocket material={material} r={0.07} w={0.035} teeth={10} />
    </group>
    {/* pickup tube curving down to the screen */}
    <Tube material={material} r={0.028} pts={[[-0.15, -0.05, 0], [-0.3, -0.12, 0.04], [-0.42, -0.16, 0.06]]} seg={12} />
    {/* pickup screen */}
    <mesh material={material} position={[-0.46, -0.18, 0.06]}>
      <cylinderGeometry args={[0.09, 0.1, 0.04, 18]} />
    </mesh>
    {/* cover bolts */}
    <Bolt material={material} p={[0.04, 0.04, 0.16]} r={0.013} rot={[Math.PI / 2, 0, 0]} />
    <Bolt material={material} p={[0.16, -0.05, 0.16]} r={0.013} rot={[Math.PI / 2, 0, 0]} />
  </group>
)

const Valvetronic: Builder = ({ material, layout }) => (
  <group>
    {/* eccentric shaft */}
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.032, 0.032, layout.blockHalfLen * 2 - 0.4, 12]} />
    </mesh>
    {/* eccentric lobes + intermediate lever pairs per cylinder */}
    {layout.cylX.map((x, i) => (
      <group key={x}>
        <mesh material={material} position={[x, 0, 0]} rotation={[(i % 3) * 0.7, 0, Math.PI / 2]} scale={[1, 1, 1.35]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
        </mesh>
        <mesh material={material} position={[x, -0.07, -0.04]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.05, 0.12, 0.03]} />
        </mesh>
      </group>
    ))}
    {/* servo motor at the front */}
    <group position={[-layout.blockHalfLen + 0.03, -0.02, 0]}>
      <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 14]} />
      </mesh>
      <RoundedBox material={material} args={[0.1, 0.12, 0.12]} radius={0.02} position={[0.13, 0, 0]} />
    </group>
    {/* shaft position sensor */}
    <mesh material={material} position={[layout.blockHalfLen - 0.15, 0.05, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 0.06, 10]} />
    </mesh>
  </group>
)

const ElectricPump: Builder = ({ material }) => (
  <group>
    {/* pump body */}
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.09, 0.09, 0.2, 18]} />
    </mesh>
    {/* electronics end cap with connector */}
    <mesh material={material} position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.075, 0.09, 0.06, 18]} />
    </mesh>
    <RoundedBox material={material} args={[0.06, 0.05, 0.08]} radius={0.012} position={[0.15, 0.07, 0]} />
    {/* inlet / outlet stubs */}
    <Tube material={material} r={0.03} pts={[[-0.1, 0.04, 0.05], [-0.16, 0.1, 0.12], [-0.18, 0.12, 0.22]]} seg={8} />
    <Tube material={material} r={0.03} pts={[[-0.12, -0.02, 0.0], [-0.2, -0.04, 0.08], [-0.26, -0.04, 0.16]]} seg={8} />
    {/* mounting bracket */}
    <RoundedBox material={material} args={[0.16, 0.03, 0.1]} radius={0.01} position={[0, -0.1, 0]} />
  </group>
)

const OilNozzles: Builder = ({ material, layout }) => (
  <group>
    {layout.cylX.map((x) => (
      <group key={x} position={[x, 0, 0]}>
        {/* mounting boss with banjo bolt */}
        <mesh material={material}>
          <cylinderGeometry args={[0.035, 0.035, 0.05, 10]} />
        </mesh>
        <Bolt material={material} p={[0, 0.035, 0]} r={0.018} h={0.02} />
        {/* spray tube curving up toward the piston underside */}
        <Tube material={material} r={0.012} pts={[[0, 0.02, 0], [0.02, 0.08, -0.08], [0.03, 0.16, -0.14]]} seg={8} />
      </group>
    ))}
  </group>
)

export const BUILDERS: Record<string, Builder> = {
  block: Block,
  head: Head,
  valveCover: ValveCover,
  camshaft: Camshaft,
  piston: Piston,
  crankshaft: Crankshaft,
  damper: Damper,
  timingCover: TimingCover,
  vanos: Vanos,
  timingChain: TimingChain,
  turbo: Turbo,
  exhaustManifold: ExhaustManifold,
  intakeManifold: IntakeManifold,
  throttleBody: ThrottleBody,
  fuelRail: FuelRail,
  injectors: Injectors,
  hpfp: Hpfp,
  waterPump: WaterPump,
  thermostat: Thermostat,
  oilFilter: OilFilter,
  oilPan: OilPan,
  oilPump: OilPump,
  valvetronic: Valvetronic,
  electricPump: ElectricPump,
  oilNozzles: OilNozzles,
}
