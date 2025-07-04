import { BaseWeapon } from './BaseWeapon';

export class Pistol extends BaseWeapon {
  constructor() {
    super({
      id: 'pistol',
      name: 'Pistol',
      type: 'pistol',
      damage: 25,
      fireRate: 4, // 4 shots per second for better testing
      ammo: -1,
      maxAmmo: -1,
      isUnlimited: true,
      projectileSpeed: 40, // Increased from 20 for better range
      spread: 0.05 // Small spread for slight inaccuracy
    });
  }
}