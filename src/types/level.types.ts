import { Vector3 } from './game.types';
import { ZombieType } from './enemy.types';

export interface Level {
  id: number;
  name: string;
  theme: LevelTheme;
  waves: Wave[];
  environmentalHazards?: EnvironmentalHazard[];
  spawnPoints: Vector3[];
  playerStartPosition: Vector3;
  boss?: ZombieType;
}

export type LevelTheme = 
  | 'simple-map'
  | 'city-streets'
  | 'volcano'
  | 'forest'
  | 'industrial'
  | 'arctic'
  | 'desert'
  | 'underwater'
  | 'space-station'
  | 'hell';

export interface Wave {
  zombieCount: number;
  zombieTypes: { type: ZombieType; percentage: number }[];
  spawnDelay: number;
}

export interface EnvironmentalHazard {
  type: 'lava' | 'ice' | 'quicksand' | 'low-gravity' | 'fire-pit' | 'teleporter';
  position: Vector3;
  dimensions: Vector3;
  damage?: number;
}