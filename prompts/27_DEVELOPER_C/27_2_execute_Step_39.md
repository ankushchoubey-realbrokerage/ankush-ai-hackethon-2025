# Step 39: Level 5 - Industrial

## Objective
Create an industrial facility environment with conveyor belt mechanics and prepare for the Tank Zombie boss encounter.

## Tasks
1. Create industrial environment with factory elements
2. Implement conveyor belt movement mechanics
3. Design level with industrial hazards
4. Set up boss arena for Tank Zombie
5. Create industrial atmosphere and sounds

## Implementation Details

### 1. Industrial Environment
Create `src/levels/maps/IndustrialMap.ts`:
- Factory floor with machinery
- Conveyor belts as movement elements
- Steam pipes and vents
- Catwalks and elevated platforms
- Large boss arena area

### 2. Conveyor Belt System
Create `src/levels/mechanics/ConveyorBelt.ts`:
```typescript
export class ConveyorBelt {
  bounds: BoundingBox;
  direction: Vector3;
  speed: number = 3;
  
  applyMovement(entity: Entity, deltaTime: number): void {
    if (this.isEntityOn(entity)) {
      entity.position.x += this.direction.x * this.speed * deltaTime;
      entity.position.z += this.direction.z * this.speed * deltaTime;
    }
  }
}
```

### 3. Industrial Hazards
- Steam vents (periodic damage bursts)
- Crusher traps (instant death)
- Electrical hazards (stun + damage)
- Moving machinery obstacles
- Toxic waste pools

### 4. Boss Arena Setup
- Large open area for boss fight
- Destructible cover elements
- Health/ammo pickups on edges
- Environmental hazards player can use
- Multiple entry/exit points

### 5. Level Flow Design
```typescript
{
  id: 5,
  name: "Industrial Complex",
  theme: "industrial",
  phases: [
    { type: "exploration", enemies: 15 },
    { type: "arena_prep", enemies: 10 },
    { type: "boss_fight", boss: "tank_zombie" }
  ],
  mechanics: ["conveyor_belts", "steam_vents"]
}
```

## Merge Conflict Avoidance Tips
1. **Create NEW mechanics system** for conveyors
2. **Separate industrial hazards** from Dev B's hazard system
3. **Prepare boss arena** but don't implement boss yet (Step 40)
4. **Use phase system** for level progression
5. **Add industrial theme** without modifying theme enum yet
6. **Keep conveyor logic modular** and separate

## Testing
- Test conveyor belt physics edge cases
- Verify entity movement on belts
- Check hazard timing and patterns
- Ensure arena is suitable for boss fight
- Test performance with all mechanics active

## Expected Deliverables
- `IndustrialMap.ts` with full layout
- `ConveyorBelt.ts` movement mechanic
- Industrial hazard implementations
- Boss arena properly set up
- Level progression with phases
- Atmospheric industrial effects