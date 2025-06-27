import { LevelData } from '../../types/level.types';

// STEP 31: Updated to use LevelData with win conditions
export const levelConfigs: Map<number, LevelData> = new Map([
  [1, {
    id: 1,
    name: 'Simple Map',
    theme: 'simple-map',
    waves: [
      { zombieCount: 5, zombieTypes: [{ type: 'basic', percentage: 100 }], spawnDelay: 1 },
      { zombieCount: 5, zombieTypes: [{ type: 'basic', percentage: 100 }], spawnDelay: 2 }
    ],
    spawnPoints: [
      { x: 10, y: 0, z: 10 },
      { x: -10, y: 0, z: 10 },
      { x: 10, y: 0, z: -10 },
      { x: -10, y: 0, z: -10 }
    ],
    playerStartPosition: { x: 0, y: 0.5, z: 0 },
    winConditions: [{ type: 'kill_all' }],
    weaponPickups: [
      { weaponType: 'machinegun', position: { x: 5, y: 0, z: 5 } }
    ]
  }],
  [2, {
    id: 2,
    name: 'City Streets',
    theme: 'city-streets',
    waves: [
      { zombieCount: 5, zombieTypes: [{ type: 'basic', percentage: 100 }], spawnDelay: 1 },
      { zombieCount: 7, zombieTypes: [{ type: 'basic', percentage: 75 }, { type: 'fast', percentage: 25 }], spawnDelay: 2 },
      { zombieCount: 8, zombieTypes: [{ type: 'basic', percentage: 75 }, { type: 'fast', percentage: 25 }], spawnDelay: 2 }
    ],
    spawnPoints: [
      { x: 15, y: 0, z: 15 },
      { x: -15, y: 0, z: 15 },
      { x: 15, y: 0, z: -15 },
      { x: -15, y: 0, z: -15 }
    ],
    playerStartPosition: { x: 0, y: 0.5, z: 0 },
    winConditions: [{ type: 'kill_all' }],
    weaponPickups: [],
    obstacles: [
      { id: 'car1', type: 'car', position: { x: 8, y: 0, z: 5 }, rotation: { x: 0, y: 0.5, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'car2', type: 'car', position: { x: -6, y: 0, z: -8 }, rotation: { x: 0, y: -0.3, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
    ]
  }]
  // Additional levels will be added in later steps
]);