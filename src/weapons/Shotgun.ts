import { BaseWeapon } from './BaseWeapon';

/**
 * Shotgun - A powerful close-range weapon with spread shot pattern
 * - Fires 5 pellets in a cone pattern
 * - Each pellet does individual damage
 * - Effective for crowd control
 * - Pump-action with slower fire rate
 */
export class Shotgun extends BaseWeapon {
  public pelletsPerShot: number = 5;
  
  constructor() {
    super({
      id: 'shotgun',
      name: 'Shotgun',
      type: 'shotgun',
      damage: 20, // Damage per pellet (5 pellets = 100 total damage)
      fireRate: 0.833, // ~1.2 seconds between shots (pump-action)
      ammo: 8,
      maxAmmo: 8,
      isUnlimited: false,
      projectileSpeed: 25,
      spread: 0.15, // 0.15 radians (~8.6 degrees) spread angle
    });
  }
  
  /**
   * Override fire to indicate shotgun was fired
   * The actual multi-pellet logic is handled in Player.ts
   */
  public fire(): boolean {
    if (!this.canFire()) {
      return false;
    }
    
    if (!this.isUnlimited && this.ammo > 0) {
      this.ammo--;
    }
    
    this.lastFireTime = Date.now();
    return true;
  }
}