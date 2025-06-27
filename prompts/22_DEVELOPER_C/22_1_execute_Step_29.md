# Step 29: Basic Particle Effects

## Overview
Create a particle system for visual effects like muzzle flashes and blood splatters to enhance combat feedback.

## Task Details
From EXECUTION_PLAN.md Step 29:
- Create particle system for muzzle flash
- Add blood splatter effect on hit
- Implement particle pooling
- Test performance with particles

## Implementation Requirements

### 1. Create Particle System
Create new file `src/effects/ParticleSystem.ts`:
- Implement a basic particle emitter using Three.js
- Support different particle types (muzzle flash, blood, etc.)
- Use Three.js Points or Sprites for performance
- Implement particle lifecycle (spawn, update, die)

### 2. Implement Particle Pooling
- Pre-allocate particle objects to avoid garbage collection
- Reuse dead particles instead of creating new ones
- Track active vs inactive particles
- Limit maximum particles for performance

### 3. Create Muzzle Flash Effect
- Bright, quick flash at weapon barrel
- Duration: 50-100ms
- Color: Yellow-white gradient
- Size: Start large, shrink quickly

### 4. Create Blood Splatter Effect
- Red particles that spray outward
- Affected by gravity (fall down)
- Duration: 1-2 seconds
- Leave temporary blood decals (optional)

### 5. Update GameEngine
In `src/core/engine/GameEngine.ts`:
- Initialize particle system
- Update particles each frame
- Clean up dead particles
- **Important**: Add in a clearly marked section to avoid conflicts

## Merge Conflict Prevention Tips
1. **New files are safe**:
   - You're creating new effect files
   - No conflicts with existing code
   - Keep effects isolated in their own module

2. **GameEngine.ts coordination**:
   - Wait for Developer A's commits if possible
   - Add particle system in a new section
   - Use comments like `// STEP 29: Particle System`
   - Keep initialization separate from combat logic

3. **Integration points**:
   - Don't modify weapon or zombie files yet
   - Create the system first, integrate later
   - Provide simple API for other systems to use

## Testing Requirements
1. Create test particles manually
2. Verify particle pooling works (no memory leaks)
3. Test performance with 100+ particles
4. Check particles die and get recycled
5. Verify visual quality of effects
6. Monitor frame rate impact

## Expected Behavior
- Particles spawn and animate smoothly
- No frame drops with reasonable particle counts
- Particles disappear after their lifetime
- Pool recycles particles efficiently
- Effects look visually appealing
- System is easy to extend with new effects

## Code Structure Example
```typescript
interface ParticleConfig {
  position: Vector3;
  velocity?: Vector3;
  color: THREE.Color;
  size: number;
  lifetime: number;
  gravity?: boolean;
}

class ParticleSystem {
  private particlePool: Particle[];
  private activeParticles: Set<Particle>;
  
  emit(type: 'muzzleFlash' | 'blood', config: ParticleConfig): void
  update(deltaTime: number): void
  clear(): void
}
```

## Visual Guidelines
- Muzzle Flash: Bright, quick, impactful
- Blood: Dark red, physics-based movement
- Keep effects visible but not overwhelming
- Consider game's isometric view angle

Remember: Good particle effects make combat feel visceral and satisfying. Performance is crucial!