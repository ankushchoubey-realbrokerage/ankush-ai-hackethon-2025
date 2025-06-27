# Step 40: Boss Battle System

## Objective
Implement the Tank Zombie boss with AI patterns, special attacks, and a complete boss battle experience.

## Tasks
1. Create boss battle system architecture
2. Implement Tank Zombie with 1000 HP
3. Design multiple attack patterns
4. Create boss health bar UI
5. Implement boss defeat sequence

## Implementation Details

### 1. Boss System Architecture
Create `src/entities/bosses/BossSystem.ts`:
```typescript
export interface IBoss {
  name: string;
  health: number;
  maxHealth: number;
  phase: number; // Combat phase
  
  enterPhase(phase: number): void;
  specialAttack(): void;
  onDefeat(): void;
}

export class BossManager {
  currentBoss: IBoss | null = null;
  
  startBossFight(boss: IBoss): void {
    // Initialize boss battle
    // Show boss intro
    // Display boss health bar
  }
}
```

### 2. Tank Zombie Implementation
Create `src/entities/bosses/TankZombie.ts`:
```typescript
export class TankZombie extends Zombie implements IBoss {
  constructor(position: Vector3) {
    super(position);
    this.health = 1000;
    this.maxHealth = 1000;
    this.speed = 1.5; // Slower than normal
    this.damage = 50; // High damage
    this.scale = 2.0; // Twice normal size
  }
  
  // Attack patterns based on health
  // Phase 1 (100-66%): Basic charge attacks
  // Phase 2 (66-33%): Add ground slam AOE
  // Phase 3 (33-0%): Rage mode, faster attacks
}
```

### 3. Attack Patterns
- **Charge Attack**: Rushes toward player
- **Ground Slam**: AOE damage around boss
- **Zombie Summon**: Calls 3-5 regular zombies
- **Rage Mode**: Increased speed and damage
- **Projectile Throw**: Throws debris at player

### 4. Boss Health UI
Create `src/ui/components/BossHealthBar.tsx`:
- Large health bar at top of screen
- Boss name display
- Phase indicators
- Animated damage numbers
- Special attack warnings

### 5. Boss Battle Flow
```typescript
// GameEngine integration
if (boss.health <= 0) {
  boss.onDefeat();
  // Play defeat animation
  // Drop special rewards
  // Trigger level completion
  // Show victory screen
}
```

### 6. Special Boss Features
- Immune to knockback
- Reduced damage from explosions
- Custom death animation
- Screen shake on attacks
- Battle music system

## Merge Conflict Avoidance Tips
1. **Create separate boss system** - New folder structure
2. **Extend Zombie carefully** - Don't modify base class
3. **New UI component** for boss health bar
4. **Add boss manager** to GameEngine at END
5. **Use boss-specific interfaces** to avoid type conflicts
6. **Coordinate with Dev B** on explosion immunity

## Testing
- Test all attack patterns individually
- Verify phase transitions at correct health
- Ensure boss is challenging but fair
- Test performance during summons
- Verify defeat sequence works properly
- Check UI updates correctly

## Expected Deliverables
- Complete boss system architecture
- `TankZombie.ts` with all attack patterns
- `BossHealthBar.tsx` UI component
- `BossManager.ts` for battle orchestration
- Working boss fight in industrial level
- Polished battle experience with all phases

Implement all tasks listed here. Don't just analyze. Don't do npm run test or npm lint or run dev.