# Step 27: Weapon Sound Effects

## Overview
Add sound effects for weapon firing, making combat feel more impactful and responsive.

## Task Details
From EXECUTION_PLAN.md Step 27:
- Add pistol firing sound
- Add machine gun firing sound
- Implement sound pooling for performance
- Test audio synchronization

## Implementation Requirements

### 1. Obtain Sound Assets
- Find or create weapon sound effects:
  - Pistol fire (single shot, punchy)
  - Machine gun fire (rapid, automatic)
- Use free resources like freesound.org or opengameart.org
- Keep files small (OGG or MP3 format)

### 2. Update AudioManager
In `src/core/audio/AudioManager.ts`:
- Add specific methods for weapon sounds
- Implement sound pooling for rapid-fire weapons
- Ensure proper cleanup of finished sounds

### 3. Update Weapon Classes
In `src/weapons/Pistol.ts`:
- Add sound trigger in the `fire()` method
- Pass AudioManager reference or use a global instance

In `src/weapons/BaseWeapon.ts`:
- Add abstract method or property for weapon sound
- Ensure all weapons can have associated sounds

For Machine Gun (if it exists):
- Implement rapid-fire sound handling
- Avoid audio overlap issues

### 4. Update GameEngine
In `src/core/engine/GameEngine.ts`:
- Initialize weapon sounds on game start
- Pass AudioManager to weapon system
- **Important**: Wait for Developer A's Step 16-18 commits before modifying this file

## Merge Conflict Prevention Tips
1. **Wait for Developer A**:
   - They need to complete combat logic first
   - Then you add sound triggers to their code
   - Rebase your branch on their changes

2. **Minimal modifications**:
   - Only add sound trigger lines
   - Don't change weapon mechanics
   - Add comments like `// STEP 27: Weapon sound trigger`

3. **Coordination points**:
   - In weapon files: Add one line for sound playback
   - In GameEngine: Only initialize sounds
   - Don't modify combat logic

## Testing Requirements
1. Fire pistol and verify sound plays
2. Test rapid fire doesn't cause audio issues
3. Verify sounds sync with visual muzzle flash
4. Check performance with many sounds
5. Test volume controls affect weapon sounds
6. Ensure no sound delays or glitches

## Expected Behavior
- Pistol makes single shot sound per trigger
- Machine gun sounds continuous when held
- No audio crackling or distortion
- Sounds play immediately on fire
- Multiple weapons can fire simultaneously
- Sound pooling prevents audio overflow

## Integration Example
```typescript
// In Pistol.fire() method
fire(origin: Vector3, direction: Vector3): void {
  // Existing projectile logic...
  
  // STEP 27: Weapon sound trigger
  this.audioManager.playSound('pistol_fire', 0.5);
}
```

Remember: Good weapon sounds make combat feel satisfying. Keep them punchy and responsive!