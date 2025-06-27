# Step 32: Level 2 - City Streets

## Objective
Create the City Streets environment with urban obstacles and implement the second level of the game.

## Tasks
1. Create city street environment assets
2. Add car obstacles to the level
3. Implement 20 zombies spawning in 3 waves
4. Configure 25% of zombies to be fast variants (preparation for Step 33)

## Implementation Details

### 1. City Environment
- Create `src/levels/maps/CityStreetsMap.ts`
- Design urban layout with:
  - Street grid pattern
  - Abandoned cars as obstacles
  - Building facades as boundaries
  - Street lights and debris for atmosphere

### 2. Car Obstacles
- Add car models/sprites to obstacles
- Configure collision boxes for vehicles
- Make some cars destructible (optional enhancement)
- Position strategically to create choke points

### 3. Wave Configuration
- Wave 1: 5 zombies (all normal)
- Wave 2: 7 zombies (2 fast, 5 normal) 
- Wave 3: 8 zombies (3 fast, 5 normal)
- Spawn points at street intersections

### 4. Level Config
Add to `levelConfigs.ts`:
```typescript
{
  id: 2,
  name: "City Streets",
  theme: "city-streets",
  waves: [...],
  weaponPickups: ["machinegun"],
  startingPosition: { x: 0, y: 0, z: -20 }
}
```

## Merge Conflict Avoidance Tips
1. **Create new map file** - Don't modify existing maps
2. **Add to END of levelConfigs Map** to avoid conflicts
3. **Use placeholder for fast zombies** - Just mark them in config, implementation comes in Step 33
4. **Coordinate with Developer B** if they're adding volcano level to configs
5. **Test with existing zombie types** first

## Testing
- Verify all 3 waves spawn correctly
- Test car collision detection
- Ensure level is completable
- Check performance with 20 zombies

## Expected Deliverables
- `CityStreetsMap.ts` implementation
- Updated `levelConfigs.ts` with city level
- Working city level with proper wave spawning
- Car obstacles with correct collisions