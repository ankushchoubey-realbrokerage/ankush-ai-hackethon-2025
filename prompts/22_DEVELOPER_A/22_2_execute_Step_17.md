# Step 17: Zombie-Player Collision

## Overview
Implement collision detection between zombies and the player, including a damage system when zombies touch the player.

## Task Details
From EXECUTION_PLAN.md Step 17:
- Detect collision between zombie and player
- Implement damage to player on collision
- Update player health in HUD
- Test damage system

## Implementation Requirements

### 1. Update Zombie Entity
In `src/entities/enemies/Zombie.ts`:
- Use the existing `isInAttackRange()` method to detect proximity
- Implement attack cooldown using `canAttack()` and `attack()` methods
- The zombie already has `damage: 10` and `attackCooldown: 1` second defined

### 2. Update Player Entity
In `src/entities/player/Player.ts`:
- Add a `takeDamage(amount: number)` method
- Implement damage cooldown/invulnerability frames (e.g., 1 second)
- Update the player's health property
- Ensure health doesn't go below 0

### 3. Update GameEngine
In `src/core/engine/GameEngine.ts`:
- Add collision detection between zombies and player in the update loop
- Check each zombie's attack range against player position
- Apply damage when zombie is in range and can attack
- Update the game store with new player health

### 4. Update Game Store
In `src/store/gameStore.ts`:
- Ensure player health updates trigger HUD re-renders
- Handle player death when health reaches 0
- Trigger game over state appropriately

## Merge Conflict Prevention Tips
1. **DO NOT modify**:
   - Audio files (wait for Developer B)
   - Particle/effect files (Developer C's domain)
   - UI styling or menu components

2. **Focus your changes on**:
   - Collision detection logic
   - Damage calculation
   - Player health management
   - Add comments like `// STEP 17: Zombie-Player Collision`

3. **GameEngine.ts coordination**:
   - Add your collision check method in a clearly marked section
   - Name it something specific like `checkZombiePlayerCollisions()`
   - Keep it separate from future particle system code

## Testing Requirements
1. Let a zombie reach the player and verify damage is applied
2. Check that damage respects the attack cooldown (1 damage per second)
3. Verify player health updates in the HUD
4. Test with multiple zombies attacking simultaneously
5. Ensure player can't take damage during invulnerability period
6. Verify game over triggers when health reaches 0

## Expected Behavior
- Zombies deal 10 damage when they touch the player
- Damage is applied maximum once per second per zombie
- Player has brief invulnerability after taking damage
- Health bar in HUD updates immediately
- Game over screen appears when player dies 

Remember: This makes the zombies actually dangerous! The damage system is crucial for gameplay tension.