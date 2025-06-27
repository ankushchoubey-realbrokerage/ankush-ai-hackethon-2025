# Step 36: Environmental Hazards

## Objective
Create a comprehensive hazard system that can be reused across different levels for various environmental dangers.

## Tasks
1. Design generic hazard system architecture
2. Implement different hazard types (damage zones, instant death, slowing)
3. Add visual warnings for hazards
4. Create hazard interaction effects
5. Test player hazard interactions

## Implementation Details

### 1. Hazard System Architecture
Extend the system from Step 35:

```typescript
// Base hazard interface
interface IHazard {
  type: 'damage' | 'instant_death' | 'slow' | 'push';
  bounds: BoundingBox;
  active: boolean;
  
  onEnter?(entity: Entity): void;
  onStay?(entity: Entity, deltaTime: number): void;
  onExit?(entity: Entity): void;
}

class HazardZone implements IHazard {
  // Generic hazard implementation
}
```

### 2. Hazard Types
- **Damage Zones**: Continuous damage (lava, acid)
- **Instant Death**: Bottomless pits, crushers
- **Slowing Zones**: Mud, tar, ice
- **Push Zones**: Wind, geysers

### 3. Visual Indicators
- Warning signs near hazards
- Glowing outlines for danger zones
- Particle effects (steam, bubbles)
- Color coding (red=damage, blue=slow, etc.)

### 4. Hazard Effects
- Screen shake when damaged
- Color overlay for status effects
- Sound cues for hazard proximity
- Visual feedback on entity (fire, frost, etc.)

### 5. Integration
Update `EnvironmentalHazardManager.ts`:
- Register multiple hazard types
- Priority system for overlapping hazards
- Performance optimization for many hazards

## Merge Conflict Avoidance Tips
1. **Extend existing hazard system** from Step 35
2. **Keep hazards modular** - Each type in separate file
3. **Use hazard factory pattern** to avoid type conflicts
4. **Don't modify Entity base class** - Use external tracking
5. **Add to GameEngine carefully** - Single integration point

## Testing
- Test each hazard type individually
- Verify visual warnings display correctly
- Check hazard priority/overlap behavior
- Test performance with 20+ hazard zones
- Ensure save/load compatibility

## Expected Deliverables
- Extended hazard system with multiple types
- Visual warning system implementation
- At least 4 different hazard types
- Hazard effects and feedback system
- Demo level showcasing all hazard types

Implement all tasks listed here. Don't just analyze. Don't do npm run test or npm lint or run dev.