export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameOver' | 'levelComplete';

export interface GameStats {
  score: number;
  zombiesKilled: number;
  waveNumber: number;
  level: number;
  time: number;
}