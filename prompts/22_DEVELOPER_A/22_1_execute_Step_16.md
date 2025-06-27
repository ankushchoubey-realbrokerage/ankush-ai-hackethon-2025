# Step 16: Zombie AI - Basic Movement

## Overview
Implement zombie movement AI that makes zombies move toward the player. This is a core combat mechanic that will make the game challenging.

## Task Details
From EXECUTION_PLAN.md Step 16:
- Implement zombie movement toward player
- Add zombie rotation to face player
- Set zombie movement speed
- Test zombie following behavior

## Implementation Requirements

### 1. Update Zombie Entity
In `src/entities/enemies/Zombie.ts`:
- The `update()` method already has basic movement logic - enhance it if needed
- Ensure smooth movement toward player position
- Implement proper rotation to face the player
- Movement speed is already set to 2 units/second

### 2. Update ZombieManager
In `src/entities/enemies/ZombieManager.ts`:
- Ensure all zombies receive player position in their update calls
- Handle multiple zombies without performance issues
- Consider adding slight randomization to prevent zombies from stacking

### 3. Integration with GameEngine
In `src/core/engine/GameEngine.ts`:
- Ensure zombie manager is properly updating with player position
- Verify zombies are moving smoothly in the game loop

## Merge Conflict Prevention Tips
1. **DO NOT modify**: 
   - Audio-related files (AudioManager.ts)
   - UI components (MainMenu.tsx, other UI files)
   - Particle system files (if they exist)

2. **Focus your changes on**:
   - Zombie AI logic only
   - Movement and rotation code
   - Keep GameEngine.ts modifications minimal and clearly commented

3. **Before committing**:
   - Add clear comments like `// STEP 16: Zombie AI Movement`
   - Keep imports alphabetically ordered
   - Don't add any audio triggers yet (that's Developer B's job)

## Testing Requirements
1. Spawn a single zombie and verify it follows the player
2. Test with multiple zombies (5-10) to ensure performance
3. Verify zombies rotate to face player correctly
4. Check that zombies don't overlap/stack on each other
5. Ensure zombies stop at appropriate distance from player

## Expected Behavior
- Zombies should smoothly move toward the player
- Zombies should rotate to always face the player
- Movement should feel threatening but not too fast
- Multiple zombies should spread out slightly, not stack

Remember: This is part of the core combat system. Focus on making the movement feel good and threatening!