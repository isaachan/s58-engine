import * as THREE from 'three'
import React from 'react'

/**
 * Procedural geometry builders. Each builder composes primitive meshes that
 * share a single material instance, so highlight states update the whole part.
 */
export interface BuilderProps {
  material: THREE.Material
}

type Builder = React.FC<BuilderProps>

const Block: Builder = ({ material }) => (
  <group>
    {/* main crankcase */}
    <mesh material={material} position={[0, 0.1, 0]}>
      <boxGeometry args={[3.3, 0.9, 1.0]} />
    </mesh>
    {/* lower crankcase / bedplate */}
    <mesh material={material} position={[0, -0.42, 0]}>
      <boxGeometry args={[3.3, 0.35, 0.8]} />
    </mesh>
    {/* cylinder bore deck bosses */}
    {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
      <mesh key={x} material={material} position={[x, 0.56, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.06, 24]} />
      </mesh>
    ))}
    {/* side ribs */}
    {[-1.0, 0, 1.0].map((x) => (
      <mesh key={x} material={material} position={[x, 0, 0.51]}>
        <boxGeometry args={[0.08, 0.85, 0.04]} />
      </mesh>
    ))}
    {/* engine mount bosses */}
    <mesh material={material} position={[-0.6, -0.1, -0.54]}>
      <boxGeometry args={[0.4, 0.3, 0.12]} />
    </mesh>
    <mesh material={material} position={[0.6, -0.1, -0.54]}>
      <boxGeometry args={[0.4, 0.3, 0.12]} />
    </mesh>
  </group>
)

const Head: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <boxGeometry args={[3.3, 0.42, 0.95]} />
    </mesh>
    {/* intake ports */}
    {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
      <mesh key={`i${x}`} material={material} position={[x, -0.02, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.1, 16]} />
      </mesh>
    ))}
    {/* exhaust ports */}
    {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
      <mesh key={`e${x}`} material={material} position={[x, -0.02, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
      </mesh>
    ))}
  </group>
)

const ValveCover: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <boxGeometry args={[3.3, 0.16, 0.9]} />
    </mesh>
    <mesh material={material} position={[0, 0.14, 0]}>
      <boxGeometry args={[3.1, 0.18, 0.74]} />
    </mesh>
    {/* plug tube caps along the centerline */}
    {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
      <mesh key={x} material={material} position={[x, 0.26, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
      </mesh>
    ))}
    {/* M-style longitudinal ribs */}
    <mesh material={material} position={[0, 0.24, 0.25]}>
      <boxGeometry args={[2.9, 0.05, 0.08]} />
    </mesh>
    <mesh material={material} position={[0, 0.24, -0.25]}>
      <boxGeometry args={[2.9, 0.05, 0.08]} />
    </mesh>
  </group>
)

const Camshaft: Builder = ({ material }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <mesh material={material}>
      <cylinderGeometry args={[0.045, 0.045, 3.1, 12]} />
    </mesh>
    {/* lobes: two per cylinder */}
    {[-1.35, -1.15, -0.85, -0.65, -0.35, -0.15, 0.15, 0.35, 0.65, 0.85, 1.15, 1.35].map((y, i) => (
      <mesh key={i} material={material} position={[0, y, 0]} scale={[1, 1, 1.5]} rotation={[0, (i % 3) * 0.8, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.07, 12]} />
      </mesh>
    ))}
  </group>
)

const Piston: Builder = ({ material }) => (
  <group>
    {/* crown + skirt */}
    <mesh material={material} position={[0, 0.22, 0]}>
      <cylinderGeometry args={[0.19, 0.19, 0.22, 24]} />
    </mesh>
    {/* ring grooves hint */}
    <mesh material={material} position={[0, 0.31, 0]}>
      <cylinderGeometry args={[0.195, 0.195, 0.015, 24]} />
    </mesh>
    {/* connecting rod */}
    <mesh material={material} position={[0, -0.1, 0]}>
      <boxGeometry args={[0.09, 0.45, 0.14]} />
    </mesh>
    {/* big end */}
    <mesh material={material} position={[0, -0.34, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.11, 0.11, 0.1, 16]} />
    </mesh>
  </group>
)

const Crankshaft: Builder = ({ material }) => {
  const journals = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5]
  const pins = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]
  return (
    <group>
      {/* main journals along the axis */}
      {journals.map((x) => (
        <mesh key={`m${x}`} material={material} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.11, 0.11, 0.14, 16]} />
        </mesh>
      ))}
      {/* rod pins, offset alternately like a real I6 (120° pairs simplified to up/down) */}
      {pins.map((x, i) => {
        const ang = (i % 3) * ((Math.PI * 2) / 3)
        const py = Math.cos(ang) * 0.14
        const pz = Math.sin(ang) * 0.14
        return (
          <group key={`p${x}`}>
            <mesh material={material} position={[x, py, pz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
            </mesh>
            {/* webs */}
            <mesh material={material} position={[x - 0.09, py / 2, pz / 2]} rotation={[Math.atan2(pz, py), 0, 0]}>
              <boxGeometry args={[0.06, 0.42, 0.22]} />
            </mesh>
            <mesh material={material} position={[x + 0.09, py / 2, pz / 2]} rotation={[Math.atan2(pz, py), 0, 0]}>
              <boxGeometry args={[0.06, 0.42, 0.22]} />
            </mesh>
          </group>
        )
      })}
      {/* nose + flywheel flange */}
      <mesh material={material} position={[-1.72, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
      </mesh>
      <mesh material={material} position={[1.66, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 24]} />
      </mesh>
    </group>
  )
}

const Damper: Builder = ({ material }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <mesh material={material}>
      <cylinderGeometry args={[0.26, 0.26, 0.12, 32]} />
    </mesh>
    <mesh material={material} position={[-0.05, 0, 0]}>
      <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
    </mesh>
  </group>
)

const TimingCover: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <boxGeometry args={[0.1, 1.9, 0.95]} />
    </mesh>
    <mesh material={material} position={[0, -0.75, 0]}>
      <boxGeometry args={[0.1, 0.5, 0.7]} />
    </mesh>
  </group>
)

const Vanos: Builder = ({ material }) => (
  <group>
    <mesh material={material} position={[0, 0, 0.24]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.16, 0.16, 0.12, 24]} />
    </mesh>
    <mesh material={material} position={[0, 0, -0.24]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.16, 0.16, 0.12, 24]} />
    </mesh>
  </group>
)

const TimingChain: Builder = ({ material }) => (
  <group>
    {/* chain loop: stretched torus in the YZ plane */}
    <mesh material={material} position={[0, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 2.2, 1]}>
      <torusGeometry args={[0.34, 0.035, 8, 40]} />
    </mesh>
    {/* guide rails */}
    <mesh material={material} position={[0, 0, 0.4]} rotation={[0.08, 0, 0]}>
      <boxGeometry args={[0.06, 1.45, 0.05]} />
    </mesh>
    <mesh material={material} position={[0, 0, -0.4]} rotation={[-0.08, 0, 0]}>
      <boxGeometry args={[0.06, 1.45, 0.05]} />
    </mesh>
    {/* crank sprocket */}
    <mesh material={material} position={[0, -0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.13, 0.13, 0.08, 20]} />
    </mesh>
  </group>
)

const Turbo: Builder = ({ material }) => (
  <group>
    {/* turbine volute */}
    <mesh material={material} position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.13, 0.07, 12, 24]} />
    </mesh>
    {/* compressor volute */}
    <mesh material={material} position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={1.15}>
      <torusGeometry args={[0.13, 0.07, 12, 24]} />
    </mesh>
    {/* center cartridge */}
    <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
    </mesh>
    {/* outlet */}
    <mesh material={material} position={[0, -0.16, -0.06]} rotation={[Math.PI / 2.4, 0, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.2, 12]} />
    </mesh>
  </group>
)

const ExhaustManifold: Builder = ({ material }) => (
  <group>
    {/* three runners curving down from the head */}
    {[-0.5, 0, 0.5].map((x) => (
      <mesh key={x} material={material} position={[x, 0.05, 0.05]} rotation={[Math.PI / 2.6, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.42, 12]} />
      </mesh>
    ))}
    {/* collector */}
    <mesh material={material} position={[0, -0.12, -0.18]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.1, 0.1, 1.1, 12]} />
    </mesh>
  </group>
)

const IntakeManifold: Builder = ({ material }) => (
  <group>
    {/* plenum with integrated charge cooler */}
    <mesh material={material} position={[0, 0, 0.3]}>
      <boxGeometry args={[3.0, 0.5, 0.55]} />
    </mesh>
    {/* runners to the head */}
    {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
      <mesh key={x} material={material} position={[x, -0.05, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.35, 14]} />
      </mesh>
    ))}
    {/* charge cooler coolant fittings */}
    <mesh material={material} position={[-1.45, 0.1, 0.35]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 0.15, 10]} />
    </mesh>
    <mesh material={material} position={[1.45, 0.1, 0.35]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 0.15, 10]} />
    </mesh>
  </group>
)

const ThrottleBody: Builder = ({ material }) => (
  <group rotation={[Math.PI / 2, 0, 0]}>
    <mesh material={material}>
      <cylinderGeometry args={[0.14, 0.14, 0.22, 20]} />
    </mesh>
    <mesh material={material} position={[0.12, 0.0, 0.1]}>
      <boxGeometry args={[0.14, 0.16, 0.1]} />
    </mesh>
  </group>
)

const FuelRail: Builder = ({ material }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <mesh material={material}>
      <cylinderGeometry args={[0.05, 0.05, 2.7, 12]} />
    </mesh>
  </group>
)

const Injectors: Builder = ({ material }) => (
  <group>
    {[-1.25, -0.75, -0.25, 0.25, 0.75, 1.25].map((x) => (
      <mesh key={x} material={material} position={[x, 0, 0]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.025, 0.3, 10]} />
      </mesh>
    ))}
  </group>
)

const Hpfp: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <cylinderGeometry args={[0.1, 0.1, 0.26, 16]} />
    </mesh>
    <mesh material={material} position={[0, -0.16, 0]}>
      <boxGeometry args={[0.16, 0.1, 0.16]} />
    </mesh>
  </group>
)

const WaterPump: Builder = ({ material }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <mesh material={material}>
      <cylinderGeometry args={[0.17, 0.17, 0.18, 20]} />
    </mesh>
    <mesh material={material} position={[0, 0.12, 0]}>
      <cylinderGeometry args={[0.21, 0.21, 0.05, 20]} />
    </mesh>
  </group>
)

const Thermostat: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <boxGeometry args={[0.2, 0.22, 0.24]} />
    </mesh>
    <mesh material={material} position={[-0.12, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.06, 0.14, 10]} />
    </mesh>
  </group>
)

const OilFilter: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <cylinderGeometry args={[0.13, 0.13, 0.3, 20]} />
    </mesh>
    <mesh material={material} position={[0, 0.18, 0]}>
      <cylinderGeometry args={[0.1, 0.13, 0.08, 20]} />
    </mesh>
  </group>
)

const OilPan: Builder = ({ material }) => (
  <group>
    <mesh material={material} position={[0, 0.08, 0]}>
      <boxGeometry args={[3.2, 0.2, 0.85]} />
    </mesh>
    {/* deep sump section */}
    <mesh material={material} position={[-0.7, -0.18, 0]}>
      <boxGeometry args={[1.6, 0.35, 0.7]} />
    </mesh>
    {/* drain plug */}
    <mesh material={material} position={[-0.7, -0.37, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.04, 8]} />
    </mesh>
  </group>
)

const OilPump: Builder = ({ material }) => (
  <group>
    <mesh material={material}>
      <boxGeometry args={[0.36, 0.2, 0.3]} />
    </mesh>
    {/* pickup tube + screen */}
    <mesh material={material} position={[-0.3, -0.08, 0]} rotation={[0, 0, 0.5]}>
      <cylinderGeometry args={[0.035, 0.035, 0.35, 8]} />
    </mesh>
    <mesh material={material} position={[-0.48, -0.16, 0]}>
      <cylinderGeometry args={[0.09, 0.09, 0.05, 12]} />
    </mesh>
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
}
