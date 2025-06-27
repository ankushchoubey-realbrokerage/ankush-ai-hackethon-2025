import { DamagableEntity, MovableEntity } from './entity.types';
import { Weapon } from './weapon.types';

export interface Player extends DamagableEntity, MovableEntity {
  type: 'player';
  weapons: Weapon[];
  currentWeaponIndex: number;
  score: number;
}

export interface PlayerInput {
  movement: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  mousePosition: { x: number; y: number };
  isFiring: boolean;
  weaponSwitch?: number;
  debugCollisions?: boolean;
  pauseToggled?: boolean;
}