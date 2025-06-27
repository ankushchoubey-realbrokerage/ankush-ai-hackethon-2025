# Step 35: Level 3 - Volcano

## Objective
Create a volcano-themed environment with lava hazards and fire-resistant zombie variants.

## Tasks
1. Create volcano environment with lava pools
2. Implement visual heat/fire effects
3. Add lava pool hazards that damage players
4. Create fire-resistant zombie variant
5. Design level layout with strategic hazard placement

## Implementation Details

### 1. Volcano Environment
Create `src/levels/maps/VolcanoMap.ts`:
- Rocky, volcanic terrain texture
- Lava pools as environmental hazards
- Volcanic rocks as obstacles
- Red/orange lighting scheme
- Ash particle effects in background

### 2. Lava Hazard System
Create `src/levels/environments/LavaHazard.ts`:
```typescript
export class LavaHazard {
  bounds: BoundingBox;
  damagePerSecond: number = 20;
  
  checkCollision(entity: Entity): boolean {
    // Check if entity is in lava
  }
  
  applyDamage(entity: Entity, deltaTime: number): void {
    // Apply damage over time
  }
}
```

### 3. Environmental Hazard Manager
Create `src/levels/environments/EnvironmentalHazardManager.ts`:
- Manages all hazards in a level
- Checks collisions each frame
- Applies appropriate effects/damage
- Integrates with GameEngine

### 4. Fire-Resistant Zombies
- 50% damage reduction from fire/explosions
- Visual indicator (charred/blackened appearance)
- Immune to lava damage
- Regular damage from bullets

### 5. Level Configuration
```typescript
{
  id: 3,
  name: "Volcano",
  theme: "volcano",
  hazards: ["lava_pool_1", "lava_pool_2", ...],
  enemyTypes: { normal: 0.6, fireResistant: 0.4 }
}
```

## Merge Conflict Avoidance Tips
1. **Create NEW environment system** - Don't modify existing physics
2. **Use separate hazard manager** - Keep it modular
3. **Add GameEngine integration at END** of update loop
4. **Create new files** for lava hazards and fire zombies
5. **Coordinate with Dev A** on level config structure
6. **Use clear markers** like `// STEP 35: Environmental Hazards`

## Testing
- Player takes damage in lava (20 DPS)
- Fire-resistant zombies survive in lava
- Visual effects render properly
- Performance with particle effects
- Level is challenging but fair

## Expected Deliverables
- `VolcanoMap.ts` with lava pool placement
- `EnvironmentalHazardManager.ts` system
- `LavaHazard.ts` implementation
- Fire-resistant zombie variant
- Working volcano level with hazards