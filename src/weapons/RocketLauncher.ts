import { BaseWeapon } from './BaseWeapon';
import { Weapon } from '../types';

// STEP 37: Rocket Launcher Implementation

export class RocketLauncher extends BaseWeapon {
  public explosionRadius: number;
  public splashDamage: number;
  
  constructor() {
    const config: Weapon = {
      id: 'rocketlauncher',
      name: 'Rocket Launcher',
      type: 'rocketlauncher',
      damage: 150, // Direct hit damage
      fireRate: 0.5, // 0.5 shots per second (2 seconds between shots)
      ammo: 5,
      maxAmmo: 5,
      isUnlimited: false,
      projectileSpeed: 15, // Slower than bullets
      areaOfEffect: 5 // Explosion radius
    };
    
    super(config);
    
    // Additional rocket launcher specific properties
    this.explosionRadius = 5;
    this.splashDamage = 75; // Area damage
  }
  
  // Override fire method to create rocket projectiles
  public fire(): boolean {
    const fired = super.fire();
    if (fired) {
      // Rocket launcher specific firing logic will be handled by Player
      console.log('Rocket Launcher fired!');
    }
    return fired;
  }
  
  // Get explosion damage based on distance from center
  public getExplosionDamage(distance: number): number {
    if (distance <= 0) {
      return this.damage; // Direct hit
    }
    
    if (distance > this.explosionRadius) {
      return 0; // Outside explosion radius
    }
    
    // Linear falloff from center to edge
    const falloff = 1 - (distance / this.explosionRadius);
    const minDamagePercent = 0.5; // Minimum 50% damage at edge
    const damagePercent = minDamagePercent + (1 - minDamagePercent) * falloff;
    
    return Math.floor(this.splashDamage * damagePercent);
  }
}