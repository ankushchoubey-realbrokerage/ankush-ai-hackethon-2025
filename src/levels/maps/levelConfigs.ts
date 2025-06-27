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
      { zombieCount: 7, zombieTypes: [{ type: 'basic', percentage: 71 }, { type: 'fast', percentage: 29 }], spawnDelay: 2 },
      { zombieCount: 8, zombieTypes: [{ type: 'basic', percentage: 63 }, { type: 'fast', percentage: 37 }], spawnDelay: 2 }
    ],
    spawnPoints: [
      // Street intersection spawn points
      { x: 20, y: 0, z: 20 },
      { x: -20, y: 0, z: 20 },
      { x: 20, y: 0, z: -20 },
      { x: -20, y: 0, z: -20 },
      { x: 0, y: 0, z: 25 },
      { x: 0, y: 0, z: -25 }
    ],
    playerStartPosition: { x: 0, y: 0, z: -20 },
    winConditions: [{ type: 'kill_all' }],
    weaponPickups: [
      { weaponType: 'machinegun', position: { x: 10, y: 0, z: -5 } }
    ],
    obstacles: [
      // Abandoned cars creating choke points
      { id: 'car1', type: 'car', position: { x: 8, y: 0, z: 5 }, rotation: { x: 0, y: 0.5, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'car2', type: 'car', position: { x: -6, y: 0, z: -8 }, rotation: { x: 0, y: -0.3, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'car3', type: 'car', position: { x: 15, y: 0, z: 0 }, rotation: { x: 0, y: 1.57, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'car4', type: 'car', position: { x: -15, y: 0, z: 8 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'car5', type: 'car', position: { x: 0, y: 0, z: 12 }, rotation: { x: 0, y: 0.8, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      { id: 'car6', type: 'car', position: { x: -10, y: 0, z: -15 }, rotation: { x: 0, y: -0.5, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      // Street debris
      { id: 'debris1', type: 'debris', position: { x: 5, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 0.5, y: 0.5, z: 0.5 } },
      { id: 'debris2', type: 'debris', position: { x: -8, y: 0, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 0.5, y: 0.5, z: 0.5 } }
    ]
  }],
  // STEP 35: Volcano level configuration
  [3, {
    id: 3,
    name: 'Volcano',
    theme: 'volcano',
    waves: [
      { 
        zombieCount: 6, 
        zombieTypes: [
          { type: 'basic', percentage: 60 }, 
          { type: 'fire-resistant', percentage: 40 }
        ], 
        spawnDelay: 1 
      },
      { 
        zombieCount: 8, 
        zombieTypes: [
          { type: 'basic', percentage: 50 }, 
          { type: 'fire-resistant', percentage: 50 }
        ], 
        spawnDelay: 2 
      },
      { 
        zombieCount: 10, 
        zombieTypes: [
          { type: 'basic', percentage: 40 }, 
          { type: 'fast', percentage: 20 },
          { type: 'fire-resistant', percentage: 40 }
        ], 
        spawnDelay: 2 
      }
    ],
    environmentalHazards: [
      { type: 'lava', position: { x: -10, y: 0, z: -10 }, dimensions: { x: 8, y: 0.5, z: 8 }, damage: 20 },
      { type: 'lava', position: { x: 10, y: 0, z: 10 }, dimensions: { x: 6, y: 0.5, z: 6 }, damage: 20 },
      { type: 'lava', position: { x: -5, y: 0, z: 8 }, dimensions: { x: 4, y: 0.5, z: 4 }, damage: 20 },
      { type: 'lava', position: { x: 12, y: 0, z: -8 }, dimensions: { x: 5, y: 0.5, z: 5 }, damage: 20 },
      { type: 'lava', position: { x: 0, y: 0, z: 0 }, dimensions: { x: 10, y: 0.5, z: 10 }, damage: 20 }
    ],
    spawnPoints: [
      { x: 20, y: 0, z: 20 },
      { x: -20, y: 0, z: 20 },
      { x: 20, y: 0, z: -20 },
      { x: -20, y: 0, z: -20 }
    ],
    playerStartPosition: { x: 0, y: 0.5, z: -15 },
    winConditions: [{ type: 'kill_all' }]
  }]
  // Additional levels will be added in later steps
]);