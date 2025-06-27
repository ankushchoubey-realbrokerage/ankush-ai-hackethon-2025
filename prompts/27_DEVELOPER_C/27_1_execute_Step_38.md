# Step 38: Level 4 - Forest

## Objective
Create a forest environment with fog effects and limited visibility mechanics, featuring camouflaged zombies.

## Tasks
1. Create forest environment with trees and vegetation
2. Implement fog effect reducing visibility
3. Add camouflaged zombie variant
4. Design level layout leveraging limited visibility
5. Create atmospheric lighting and sounds

## Implementation Details

### 1. Forest Environment
Create `src/levels/maps/ForestMap.ts`:
- Dense tree placement creating natural paths
- Undergrowth and bushes as obstacles
- Fallen logs and rocks for cover
- Natural clearings for combat areas
- Dark, moody atmosphere

### 2. Fog System
Create `src/effects/FogSystem.ts`:
```typescript
export class FogSystem {
  density: number = 0.02;
  color: THREE.Color = new THREE.Color(0x4a5c4a);
  
  applyToScene(scene: THREE.Scene): void {
    scene.fog = new THREE.FogExp2(this.color, this.density);
  }
  
  setVisibilityRange(near: number, far: number): void {
    // Adjust fog density based on desired visibility
  }
}
```

### 3. Limited Visibility Mechanics
- Reduce view distance to 10-15 units
- Zombies appear/disappear with fog
- Sound becomes more important
- Minimap disabled or limited
- Flashlight/torch pickup for better visibility

### 4. Camouflaged Zombies
Create `src/entities/enemies/CamoZombie.ts`:
- Green/brown coloring matching environment
- Partially transparent until close
- Make noise only when very close
- Higher health (125 HP) to compensate
- Become visible when damaged

### 5. Atmospheric Elements
- Ambient forest sounds (birds, rustling)
- Fog particles drifting across screen
- Occasional lightning flashes revealing more
- Creepy music/ambience
- Footstep sounds more prominent

## Merge Conflict Avoidance Tips
1. **Create NEW fog system** - Don't modify existing renderer
2. **New zombie variant file** - Extend base Zombie class
3. **Separate forest map file** - Don't modify other maps
4. **Add fog toggle** to GameEngine, don't change core render
5. **Use scene.fog property** - Three.js built-in, minimal changes
6. **Coordinate with other devs** on zombie type additions

## Testing
- Verify fog limits visibility appropriately
- Test camouflaged zombies reveal mechanic
- Ensure atmosphere is creepy but playable
- Check performance with fog enabled
- Test different fog densities

## Expected Deliverables
- `ForestMap.ts` with tree/vegetation layout
- `FogSystem.ts` for visibility limitation
- `CamoZombie.ts` enemy variant
- Atmospheric audio integration
- Working forest level with fog mechanics
- Demonstration of surprise zombie encounters