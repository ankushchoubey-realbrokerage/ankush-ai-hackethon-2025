import { DamagableEntity, MovableEntity } from './entity.types';

export interface Zombie extends DamagableEntity, MovableEntity {
  type: 'zombie';
  zombieType: ZombieType;
  damage: number;
  attackCooldown: number;
  lastAttackTime: number;
  specialAbilities?: string[];
}

export type ZombieType = 
  | 'basic'
  | 'fast'
  | 'armored'
  | 'fire-resistant'
  | 'ice'
  | 'sand-burrower'
  | 'aquatic'
  | 'zero-g'
  | 'demon'
  | 'tank-boss'
  | 'hell-lord-boss';

export interface ZombieStats {
  health: number;
  speed: number;
  damage: number;
  attackRate: number;
}