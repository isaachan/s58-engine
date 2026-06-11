import type { SystemId, SystemInfo } from '../types'

export const SYSTEMS: Record<SystemId, SystemInfo> = {
  block: { id: 'block', name: 'Cylinder Block & Crankcase', color: '#9aa3ad', explodeDir: [0, 0, 0] },
  head: { id: 'head', name: 'Cylinder Head & Valvetrain', color: '#b8c0c8', explodeDir: [0, 1, 0] },
  rotating: { id: 'rotating', name: 'Crankshaft, Pistons & Rods', color: '#c8923a', explodeDir: [0, -1, 0] },
  timing: { id: 'timing', name: 'Timing System', color: '#7a86d8', explodeDir: [-1, 0, 0] },
  turbo: { id: 'turbo', name: 'Turbocharging System', color: '#d86a5a', explodeDir: [0, 0, -1] },
  intake: { id: 'intake', name: 'Intake System', color: '#5ab0d8', explodeDir: [0, 0, 1] },
  exhaust: { id: 'exhaust', name: 'Exhaust System', color: '#a05a48', explodeDir: [0, 0, -1] },
  cooling: { id: 'cooling', name: 'Cooling System', color: '#48b89a', explodeDir: [-1, 0, 0] },
  lubrication: { id: 'lubrication', name: 'Lubrication System', color: '#d8b03a', explodeDir: [0, -1, 0] },
  fuel: { id: 'fuel', name: 'Fuel Injection System', color: '#9a6ad8', explodeDir: [0, 1, 0] },
}

export const SYSTEM_ORDER: SystemId[] = [
  'block', 'head', 'rotating', 'timing', 'turbo', 'intake', 'exhaust', 'cooling', 'lubrication', 'fuel',
]
