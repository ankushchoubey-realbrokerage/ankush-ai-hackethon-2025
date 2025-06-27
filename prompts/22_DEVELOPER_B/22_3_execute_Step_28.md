# Step 28: Zombie Sound Effects

## Overview
Add zombie sound effects including groans and death sounds, with 3D spatial audio for immersion.

## Task Details
From EXECUTION_PLAN.md Step 28:
- Add zombie groan sounds
- Add zombie death sounds
- Implement 3D spatial audio
- Test audio distance falloff

## Implementation Requirements

### 1. Obtain Sound Assets
- Find or create zombie sounds:
  - Zombie groans/moans (2-3 variations)
  - Zombie death sounds (2-3 variations)
  - Zombie attack/bite sound
- Keep them creepy but not too disturbing
- Use OGG or MP3 format for compatibility

### 2. Enhance AudioManager
In `src/core/audio/AudioManager.ts`:
- Add 3D spatial audio support using Howler's positional audio
- Implement distance-based volume falloff
- Add method to play random sound from a group

### 3. Update Zombie Entity
In `src/entities/enemies/Zombie.ts`:
- **Important**: Wait for Developer A to complete Steps 16-18
- Add sound triggers for:
  - Periodic groans (every 3-5 seconds)
  - Attack sound when damaging player
  - Death sound when zombie dies
- Include position for 3D audio

### 4. Update ZombieManager
In `src/entities/enemies/ZombieManager.ts`:
- Manage ambient zombie sounds
- Prevent too many simultaneous sounds
- Update 3D positions as zombies move

## Merge Conflict Prevention Tips
1. **Critical**: Wait for Developer A's combat implementation
   - They're modifying Zombie.ts for AI (Step 16)
   - They're adding attack logic (Step 17)
   - They're implementing death logic (Step 18)

2. **After Developer A commits**:
   - Rebase your branch on their changes
   - Add sound triggers without modifying logic
   - Use comments like `// STEP 28: Zombie sound effects`

3. **Minimal changes**:
   - Only add audio-related code
   - Don't modify AI or combat behavior
   - Keep sound triggers separate from game logic

## Testing Requirements
1. Verify zombies make periodic groan sounds
2. Test 3D audio - sounds from left/right
3. Check volume decreases with distance
4. Verify death sounds play when zombies die
5. Test with multiple zombies for audio balance
6. Ensure performance with many zombie sounds

## Expected Behavior
- Zombies groan periodically creating atmosphere
- Sounds come from zombie positions (3D)
- Volume fades with distance
- Death sounds play once when zombie dies
- Attack sounds when zombie hits player
- No audio overflow with many zombies

## Integration Example
```typescript
// In Zombie class
private groanTimer: number = 0;
private groanInterval: number = 3 + Math.random() * 2; // 3-5 seconds

update(deltaTime: number): void {
  // Existing movement logic...
  
  // STEP 28: Zombie groan sounds
  this.groanTimer += deltaTime;
  if (this.groanTimer >= this.groanInterval) {
    this.audioManager.playSound3D('zombie_groan', this.transform.position, 0.3);
    this.groanTimer = 0;
    this.groanInterval = 3 + Math.random() * 2;
  }
}

takeDamage(damage: number): void {
  // Existing damage logic...
  
  if (this.isDead) {
    // STEP 28: Death sound
    this.audioManager.playSound3D('zombie_death', this.transform.position, 0.5);
  }
}
```

Remember: Zombie sounds create the horror atmosphere. Make them unsettling but not overwhelming!