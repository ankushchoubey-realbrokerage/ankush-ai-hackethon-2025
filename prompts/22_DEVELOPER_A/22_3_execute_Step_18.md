# Step 18: Projectile-Zombie Collision

## Overview
Implement collision detection between player projectiles and zombies, allowing the player to defeat zombies by shooting them.

## Task Details
From EXECUTION_PLAN.md Step 18:
- Detect collision between projectiles and zombies
- Implement damage to zombies
- Remove zombie when health reaches 0
- Add score for zombie kills

## Implementation Requirements

### 1. Update ProjectileManager
In `src/entities/projectiles/ProjectileManager.ts`:
- Add collision detection against all active zombies
- Check each projectile against each zombie's bounding box
- Remove projectiles that hit zombies
- Return information about which zombies were hit

### 2. Update Zombie Entity
In `src/entities/enemies/Zombie.ts`:
- The `takeDamage()` method already exists
- When health reaches 0, zombie is marked as `isDead` and `active = false`
- Ensure the zombie mesh is properly removed from scene

### 3. Update ZombieManager
In `src/entities/enemies/ZombieManager.ts`:
- Add method to get all active zombies for collision checking
- Remove dead zombies from the scene and zombie array
- Track zombie kills for scoring

### 4. Update GameEngine
In `src/core/engine/GameEngine.ts`:
- Connect projectile manager with zombie manager for collision checks
- The `checkProjectileCollisions()` method already exists but needs implementation
- Update score when zombies are killed
- Remove the temporary fix in the uncommitted changes

### 5. Update Game Store
In `src/store/gameStore.ts`:
- Add score/kill count tracking
- Update score when zombies are defeated

## Merge Conflict Prevention Tips
1. **DO NOT modify**:
   - Audio trigger code (Developer B will add shooting sounds)
   - Particle effects (Developer C will add hit effects)
   - UI components beyond score display

2. **Focus your changes on**:
   - Collision detection algorithms
   - Damage dealing logic
   - Score tracking
   - Add comments like `// STEP 18: Projectile-Zombie Collision`

3. **GameEngine.ts coordination**:
   - Implement the existing `checkProjectileCollisions()` method
   - Don't add new collision methods that might conflict
   - Keep collision logic focused and clean

## Testing Requirements
1. Shoot a zombie and verify it takes damage
2. Verify zombie dies when health reaches 0
3. Check that dead zombies are removed from scene
4. Verify projectiles disappear on hit
5. Test hitting multiple zombies with rapid fire
6. Confirm score increases with each kill
7. Ensure no memory leaks from dead zombies

## Expected Behavior
- Projectiles deal damage based on weapon stats
- Zombies die when health reaches 0
- Dead zombies disappear from the game
- Score increases by 10 points per zombie kill
- Projectiles are consumed on hit
- Multiple projectiles can hit different zombies

Remember: This completes the core combat loop! Players can now defend themselves against the zombie threat.