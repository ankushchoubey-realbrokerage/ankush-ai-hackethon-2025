import { Transform, BoundingBox } from './game.types';

export interface Entity {
  id: string;
  type: EntityType;
  transform: Transform;
  boundingBox: BoundingBox;
  active: boolean;
}

export type EntityType = 'player' | 'zombie' | 'projectile' | 'pickup' | 'obstacle';

export interface DamagableEntity extends Entity {
  health: number;
  maxHealth: number;
  isDead: boolean;
}

export interface MovableEntity extends Entity {
  velocity: { x: number; y: number; z: number };
  speed: number;
  direction: { x: number; y: number; z: number };
}