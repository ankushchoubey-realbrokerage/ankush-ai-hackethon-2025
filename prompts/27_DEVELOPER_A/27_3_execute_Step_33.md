# Step 33: Fast Zombie Implementation

## Objective
Create a FastZombie subclass with increased movement speed and reduced health.

## Tasks
1. Create `FastZombie` class extending base `Zombie`
2. Implement 1.5x movement speed
3. Set health to 75 HP (vs 100 for normal)
4. Add visual distinction (different color/size)
5. Test mixed zombie type spawning

## Implementation Details

### 1. FastZombie Class
Create `src/entities/enemies/FastZombie.ts`:
```typescript
export class FastZombie extends Zombie {
  constructor(position: Vector3) {
    super(position);
    this.subType = 'fast';
    this.speed = 3; // 1.5x normal zombie speed (2)
    this.health = 75;
    this.maxHealth = 75;
    // Modify appearance
  }
}
```

### 2. Visual Distinction
- Use lighter/redder color for fast zombies
- Slightly smaller size (0.9x scale)
- Add speed lines or particle trail effect
- Different walking animation speed

### 3. Update ZombieManager
Modify spawning logic to handle zombie types:
```typescript
spawnZombie(position: Vector3, type: 'normal' | 'fast' = 'normal') {
  const zombie = type === 'fast' 
    ? new FastZombie(position)
    : new Zombie(position);
  // ... rest of spawn logic
}
```

### 4. Update Level Configs
Use the fast zombie type in city level waves from Step 32.

## Merge Conflict Avoidance Tips
1. **Create NEW FastZombie.ts file** - Don't modify base Zombie class
2. **Extend, don't modify** - Use inheritance to avoid changing shared code
3. **Add spawning overload** - Don't change existing spawn method signature
4. **Coordinate type additions** - If modifying enemy.types.ts, announce it
5. **Test independently** - FastZombie should work without other changes

## Testing
- Verify fast zombies move at 1.5x speed
- Confirm they have 75 HP
- Test mixed spawning (normal + fast)
- Ensure visual distinction is clear
- Check AI behavior consistency

## Expected Deliverables
- `FastZombie.ts` class implementation
- Updated `ZombieManager` with type-based spawning
- Visual distinction for fast zombies
- Working demonstration of mixed zombie types