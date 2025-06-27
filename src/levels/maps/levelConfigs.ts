import { Level } from '../../types';

export const levelConfigs: Map<number, Level> = new Map([
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
    playerStartPosition: { x: 0, y: 0.5, z: 0 }
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
    playerStartPosition: { x: 0, y: 0.5, z: 0 }
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
    playerStartPosition: { x: 0, y: 0.5, z: -15 }
  }]
  // Additional levels will be added in later steps
]);