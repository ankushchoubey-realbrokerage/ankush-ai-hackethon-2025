import { Weapon, WeaponType } from '../types';

export abstract class BaseWeapon implements Weapon {
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
  
  private lastFireTime: number = 0;

  constructor(config: Weapon) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.damage = config.damage;
    this.fireRate = config.fireRate;
    this.ammo = config.ammo;
    this.maxAmmo = config.maxAmmo;
    this.isUnlimited = config.isUnlimited;
    this.projectileSpeed = config.projectileSpeed;
    this.spread = config.spread;
    this.areaOfEffect = config.areaOfEffect;
  }

  public canFire(): boolean {
    const currentTime = Date.now();
    const timeSinceLastFire = currentTime - this.lastFireTime;
    const fireInterval = 1000 / this.fireRate; // Convert fire rate to milliseconds between shots

    return timeSinceLastFire >= fireInterval && (this.isUnlimited || this.ammo > 0);
  }

  public fire(): boolean {
    if (!this.canFire()) {
      return false;
    }

    if (!this.isUnlimited) {
      this.ammo--;
    }

    this.lastFireTime = Date.now();
    return true;
  }

  public reload(): void {
    if (!this.isUnlimited) {
      this.ammo = this.maxAmmo;
    }
  }

  public addAmmo(amount: number): void {
    if (!this.isUnlimited) {
      this.ammo = Math.min(this.ammo + amount, this.maxAmmo);
    }
  }

  public getAmmoPercentage(): number {
    if (this.isUnlimited) {
      return 100;
    }
    return (this.ammo / this.maxAmmo) * 100;
  }
}