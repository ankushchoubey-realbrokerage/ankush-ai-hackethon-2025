# Step 37: Rocket Launcher

## Objective
Create a powerful rocket launcher weapon with explosive area-of-effect damage.

## Tasks
1. Create `RocketLauncher` class with projectile system
2. Implement area damage explosion on impact
3. Add explosion visual effects
4. Create rocket projectile with visible trail
5. Balance weapon for gameplay

## Implementation Details

### 1. RocketLauncher Class
Create `src/weapons/RocketLauncher.ts`:
```typescript
export class RocketLauncher extends Weapon {
  constructor() {
    super();
    this.id = 'rocketlauncher';
    this.name = 'Rocket Launcher';
    this.damage = 150; // Direct hit damage
    this.fireRate = 2.0; // Slow fire rate
    this.ammo = 5;
    this.maxAmmo = 5;
    this.projectileSpeed = 15; // Slower than bullets
    this.explosionRadius = 5; // Area of effect
    this.splashDamage = 75; // Area damage
  }
}
```

### 2. Rocket Projectile
Create `src/entities/projectiles/Rocket.ts`:
- Visible rocket model/sprite
- Smoke trail particle effect
- Different physics (affected by gravity slightly)
- Explodes on ANY collision

### 3. Explosion System
Create `src/effects/Explosion.ts`:
```typescript
export class Explosion {
  static create(position: Vector3, radius: number, damage: number) {
    // Visual explosion effect
    // Damage all entities in radius
    // Knockback effect
    // Screen shake if near player
  }
}
```

### 4. Area Damage Logic
- Find all entities within explosion radius
- Apply damage based on distance (falloff)
- Direct hit = full damage
- Edge of radius = 50% damage
- Can damage multiple zombies at once

### 5. Visual/Audio Effects
- Large explosion sprite/particles
- Smoke cloud that lingers
- Loud explosion sound
- Screen shake based on distance
- Light flash effect

## Merge Conflict Avoidance Tips
1. **Create NEW weapon file** - Don't modify existing weapons
2. **Separate explosion system** - Keep it reusable
3. **Extend projectile system** carefully - Add rocket type
4. **Coordinate with Dev A** on weapon type additions
5. **Use weapon ID strings** to avoid enum conflicts
6. **Add particle effects** without modifying particle system

## Testing
- Verify explosion damages multiple enemies
- Test damage falloff with distance
- Ensure player can damage themselves
- Check performance with multiple explosions
- Balance testing (not too OP)

## Expected Deliverables
- `RocketLauncher.ts` weapon implementation
- `Rocket.ts` projectile with trail
- `Explosion.ts` reusable explosion system
- Area damage implementation
- Visual and audio effects
- Balanced gameplay demonstration