import { BaseWeapon } from './BaseWeapon';

export class Pistol extends BaseWeapon {
  constructor() {
    super({
      id: 'pistol',
      name: 'Pistol',
      type: 'pistol',
      damage: 25,
      fireRate: 2, // 2 shots per second
      ammo: -1,
      maxAmmo: -1,
      isUnlimited: true,
      projectileSpeed: 20,
      spread: 0.05 // Small spread for slight inaccuracy
    });
  }
}