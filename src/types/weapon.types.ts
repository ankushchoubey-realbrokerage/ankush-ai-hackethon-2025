export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  damage: number;
  fireRate: number;
  ammo: number;
  maxAmmo: number;
  isUnlimited: boolean;
  projectileSpeed: number;
  spread?: number;
  areaOfEffect?: number;
  
  // Methods
  fire?: () => boolean;
  reload?: () => void;
  canFire?: () => boolean;
  addAmmo?: (amount: number) => void;
  getAmmoPercentage?: () => number;
}

export type WeaponType = 'pistol' | 'machinegun' | 'shotgun' | 'rocketlauncher';

export interface Projectile {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  damage: number;
  ownerId: string;
  areaOfEffect?: number;
  lifetime: number;
}