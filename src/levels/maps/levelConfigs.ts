import { Level } from '../../types';
import { forestLevelConfig } from './ForestMap';
import { industrialLevelConfig } from './IndustrialMap';

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
  [4, forestLevelConfig],
  [5, industrialLevelConfig]
  // Additional levels will be added in later steps
]);