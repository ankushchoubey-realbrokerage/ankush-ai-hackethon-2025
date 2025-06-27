# Step 34: Shotgun Weapon

## Objective
Implement a shotgun weapon with spread shot pattern and appropriate damage.

## Tasks
1. Create `Shotgun` class extending base `Weapon`
2. Implement spread shot pattern (5 projectiles)
3. Add pump-action reload delay
4. Create shotgun sound effect
5. Test shotgun damage and spread

## Implementation Details

### 1. Shotgun Class
Create `src/weapons/Shotgun.ts`:
```typescript
export class Shotgun extends Weapon {
  constructor() {
    super();
    this.id = 'shotgun';
    this.name = 'Shotgun';
    this.damage = 20; // Per pellet
    this.fireRate = 1.2; // Seconds between shots
    this.ammo = 8;
    this.maxAmmo = 8;
    this.projectileSpeed = 25;
    this.spread = 0.15; // Radians
    this.pelletsPerShot = 5;
  }

  fire(): boolean {
    // Fire multiple pellets with spread
    // Return true if fired successfully
  }
}
```

### 2. Spread Pattern
- Fire 5 projectiles in a cone pattern
- Center pellet goes straight
- 4 others spread in cross pattern (+X, -X, +Y, -Y directions)
- Each pellet does individual damage
- Spread increases with distance

### 3. Projectile Modification
In Player's fire method:
- Detect when shotgun is equipped
- Create multiple projectiles per shot
- Apply spread angle to each pellet

### 4. Visual/Audio
- Muzzle flash should be wider
- Louder, distinctive pump-action sound
- Shell ejection effect (optional)

## Merge Conflict Avoidance Tips
1. **Create NEW Shotgun.ts file** - Don't modify existing weapons
2. **Use weapon factory pattern** if it exists
3. **Coordinate Player.ts changes** carefully - Add shotgun handling at END of fire() method
4. **Add to weapon exports** last to minimize conflicts
5. **Don't modify type definitions yet** - Use 'as any' temporarily if needed

## Testing
- Verify 5 pellets fire per shot
- Test spread pattern at various distances
- Confirm each pellet does 20 damage
- Check ammo consumption (1 shell = 5 pellets)
- Test against groups of zombies

## Expected Deliverables
- `Shotgun.ts` weapon implementation
- Updated weapon exports
- Modified Player fire logic for multi-projectile
- Working shotgun with proper spread pattern
- Demonstration of crowd control effectiveness