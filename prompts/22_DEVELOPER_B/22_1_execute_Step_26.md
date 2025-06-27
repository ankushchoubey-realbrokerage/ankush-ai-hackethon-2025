# Step 26: Audio Manager

## Overview
Set up a proper audio system using Howler.js to handle all game sounds efficiently. This will be the foundation for all audio in the game.

## Task Details
From EXECUTION_PLAN.md Step 26:
- Set up Howler.js audio system
- Create audio manager class
- Load and play test sounds
- Implement volume controls

## Implementation Requirements

### 1. Install Howler.js
```bash
npm install howler @types/howler
```

### 2. Enhance AudioManager
In `src/core/audio/AudioManager.ts`:
- Replace the current Web Audio API implementation with Howler.js
- Implement sound loading and caching
- Add support for:
  - Playing one-shot sounds
  - Looping sounds (for ambient audio)
  - 3D spatial audio
  - Sound pooling for frequently used sounds
- Implement master volume control
- Add individual sound volume control

### 3. Create Sound Categories
Structure sounds by type:
- Weapon sounds
- Zombie sounds  
- UI sounds
- Ambient sounds
- Music

### 4. Test Implementation
- Create a test sound file (can use free sound from freesound.org)
- Load it in the AudioManager
- Play it when the game starts to verify audio works

## Merge Conflict Prevention Tips
1. **DO NOT modify**:
   - Combat logic files (Developer A's domain)
   - Particle system files (Developer C's domain)
   - Game mechanics or AI

2. **Focus your changes on**:
   - AudioManager.ts only for this step
   - Don't add sound triggers to other files yet
   - Add comments like `// STEP 26: Audio Manager Setup`

3. **File coordination**:
   - You're completely replacing AudioManager.ts implementation
   - This shouldn't conflict with other developers
   - Keep the same public interface if possible

## Testing Requirements
1. Verify Howler.js is properly initialized
2. Test loading a sound file
3. Test playing sounds
4. Verify volume controls work
5. Check that sounds can be stopped/paused
6. Test sound pooling with rapid playback

## Expected Behavior
- Audio system initializes without errors
- Sounds load and cache properly
- Master volume affects all sounds
- Individual sound volumes work
- No audio glitches or delays
- Handles multiple simultaneous sounds

## Sample Code Structure
```typescript
interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
  pool?: number;
}

class AudioManager {
  private sounds: Map<string, Howl>;
  private masterVolume: number = 1.0;
  
  loadSound(name: string, config: SoundConfig): void
  playSound(name: string, volume?: number): number
  stopSound(name: string, id?: number): void
  setMasterVolume(volume: number): void
}
```

Remember: This is the foundation for all game audio. Make it robust and efficient!