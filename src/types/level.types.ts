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

// STEP 31: Level System Architecture - Additional interfaces
export interface LevelData extends Level {
  weaponPickups?: WeaponPickup[];
  winConditions: WinCondition[];
  obstacles?: LevelObstacle[];
  ambientSound?: string;
  fogDensity?: number;
}

export interface WeaponPickup {
  weaponType: string; // Using string to avoid type conflicts
  position: Vector3;
  respawnTime?: number;
}

export interface WinCondition {
  type: 'kill_all' | 'survive_time' | 'kill_boss' | 'reach_exit';
  value?: number; // For survive_time (seconds) or kill count
}

export interface LevelObstacle {
  id: string;
  type: 'wall' | 'car' | 'rock' | 'building' | 'tree' | 'debris';
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  destructible?: boolean;
}

export interface LevelTransitionData {
  fromLevel: number;
  toLevel: number;
  playerHealth: number;
  playerWeapons: string[];
  playerAmmo: Map<string, number>;
  score: number;
  time: number;
}

export interface LevelLoadResult {
  success: boolean;
  level?: LevelData;
  error?: string;
}