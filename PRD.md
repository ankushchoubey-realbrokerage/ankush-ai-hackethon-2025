# Product Requirements Document (PRD)
## Isometric Zombie Survival Game

### 1. Executive Summary

**Project Name:** Zombie Apocalypse: Isometric Survival  
**Date:** January 2025  
**Version:** 1.0  
**Platform:** Web Browser  
**Genre:** Isometric Action/Survival

**Vision Statement:**  
Create an engaging web-based isometric zombie survival game that progressively challenges players through 10 unique levels with diverse environments, weapons, and boss battles.

**Mission Statement:**  
Deliver a highly modular, extensible game architecture that supports single-player gameplay initially, with the foundation for multiplayer capabilities, featuring immersive audio, varied weapons, and progressively challenging gameplay across distinct environmental themes.

### 2. Game Overview

#### Core Concept
- **Genre:** Isometric 3D Action/Survival
- **Perspective:** Isometric view (2.5D)
- **Platform:** Web browser (HTML5/WebGL)
- **Target Audience:** Casual to mid-core gamers, ages 13+

#### Gameplay Loop
1. Player spawns in level with starting weapon
2. Navigate isometric environment 
3. Eliminate zombies using various weapons
4. Collect power-ups/new weapons
5. Survive waves of increasing difficulty
6. Defeat boss (levels 5 & 10)
7. Progress to next level

### 3. Technical Architecture

#### Technology Stack
- **Frontend Framework:** React + TypeScript + Vite
- **Game Engine:** Three.js or Babylon.js for 3D isometric rendering
- **Physics:** Matter.js or built-in engine physics
- **Audio:** Web Audio API with Howler.js
- **State Management:** Redux or Zustand for game state
- **Multiplayer (Future):** WebRTC or Socket.io

#### Modular Architecture Design
```
src/
├── core/
│   ├── engine/         # Game loop, rendering
│   ├── physics/        # Collision detection
│   ├── audio/          # Sound management
│   └── networking/     # Multiplayer foundation
├── entities/
│   ├── player/         # Player controller
│   ├── enemies/        # Zombie types
│   ├── weapons/        # Weapon system
│   └── projectiles/    # Bullets, rockets
├── levels/
│   ├── level-system/   # Level loading/management
│   ├── maps/          # Map data and generation
│   └── environments/   # Environmental themes
├── ui/
│   ├── menu/          # Main menu system
│   ├── hud/           # In-game UI
│   └── settings/      # Game settings
└── assets/
    ├── models/        # 3D models
    ├── textures/      # Textures/sprites
    └── audio/         # Sound effects/music
```

### 4. Game Features

#### Core Features (MVP)
1. **Isometric Camera System**
   - Fixed angle isometric view
   - Smooth camera follow player
   - Screen boundaries

2. **Player Character**
   - 8-directional movement (WASD keys)
   - Mouse pointer for aiming
   - Health system
   - Weapon switching (number keys or scroll wheel)
   - Auto-pickup items on collision
   - Death/respawn mechanics

3. **Control Scheme**
   | Action | Control |
   |--------|---------|
   | Movement | W (up), A (left), S (down), D (right) |
   | Aim | Mouse pointer |
   | Fire | Spacebar |
   | Pick up items | Automatic on collision |
   | Switch weapons | Number keys (1-4) or scroll wheel |
   | Pause | ESC |

4. **Weapon System**
   | Weapon | Damage | Fire Rate | Ammo | Special |
   |--------|--------|-----------|------|---------|
   | Pistol | Low | Medium | Unlimited | Starting weapon |
   | Machine Gun | Medium | High | Limited | Rapid fire |
   | Shotgun | High | Low | Limited | Spread shot |
   | Rocket Launcher | Very High | Very Low | Limited | Area damage |

5. **Enemy System**
   - Basic zombie AI (pathfinding to player)
   - Different zombie types per level
   - Wave spawning system
   - Boss zombies (levels 5 & 10)

6. **Detailed Level Progression**

   | Level | Theme | Zombies | Waves | Special Enemies | Environmental Features | Weapons Available | Boss |
   |-------|-------|---------|-------|-----------------|----------------------|-------------------|------|
   | 1 | Simple Map | 10 | 2 (5 each) | Basic only | Open area, barriers | Pistol | None |
   | 2 | City Streets | 20 | 3 (5, 7, 8) | Fast zombies (25%) | Cars as cover, narrow alleys | + Machine Gun | None |
   | 3 | Volcano | 35 | 4 (5, 8, 10, 12) | Fire-resistant (30%) | Lava pools (damage), smoke areas | + Shotgun | None |
   | 4 | Forest | 50 | 4 (10, 12, 13, 15) | Camouflaged (40%) | Dense trees, fog, limited vision | Same as 3 | None |
   | 5 | Industrial | 60 | 5 (10, 10, 15, 15, 10) | Armored zombies | Machinery, conveyor belts | + Rocket Launcher | Tank Zombie (500 HP) |
   | 6 | Arctic | 75 | 5 (12, 13, 15, 17, 18) | Ice zombies (slow player) | Ice patches, blizzards | All weapons | None |
   | 7 | Desert | 90 | 6 (10, 12, 15, 18, 20, 15) | Sand burrowers | Sandstorms, quicksand | All weapons | None |
   | 8 | Underwater | 110 | 6 (15, 15, 20, 20, 20, 20) | Aquatic zombies | Oxygen timer, water currents | All weapons | None |
   | 9 | Space Station | 130 | 7 (15, 15, 20, 20, 20, 20, 20) | Zero-G zombies | Low gravity, airlocks | All weapons | None |
   | 10 | Hell | 150 | 8 (10, 15, 20, 20, 25, 25, 25, 10) | Demon zombies | Fire pits, teleporters | All weapons | Hell Lord (1000 HP) |

   **Zombie Types:**
   - **Basic Zombie:** Standard speed, 100 HP
   - **Fast Zombie:** 1.5x speed, 75 HP
   - **Armored Zombie:** 0.75x speed, 200 HP
   - **Fire-resistant:** Immune to fire damage, 100 HP
   - **Ice Zombie:** Slows player on hit, 100 HP
   - **Sand Burrower:** Can disappear/reappear, 100 HP
   - **Aquatic Zombie:** Faster in water areas, 125 HP
   - **Zero-G Zombie:** Floats and attacks from above, 100 HP
   - **Demon Zombie:** Teleports short distances, 150 HP
   
   **Boss Details:**
   - **Tank Zombie (Level 5):** 500 HP, charges at player, drops heavy armor
   - **Hell Lord (Level 10):** 1000 HP, three phases, summons minions, fire attacks

7. **Audio System**
   - Level-specific background music
   - Weapon sound effects
   - Zombie sounds
   - Footstep sounds
   - Environmental audio

8. **Main Menu**
   - Start Game
   - Settings (Volume, Controls)
   - High Scores
   - Credits

### 5. Development Phases

#### Phase 1: Foundation (Week 1)
**Single Agent Tasks:**
1. Set up project structure
2. Implement isometric camera system
3. Create basic player movement
4. Build level loading system
5. Implement basic zombie AI
6. Add collision detection

#### Phase 2: Core Gameplay (Week 2)
**Parallel Agent Tasks:**
- **Agent A: Combat System**
  - Weapon switching mechanics
  - Projectile system
  - Damage calculation
  - Health/death system

- **Agent B: Audio System**
  - Audio manager setup
  - Weapon sounds integration
  - Footstep system
  - Background music player

- **Agent C: UI Development**
  - Main menu implementation
  - HUD design (health, ammo, score)
  - Settings screen
  - Game over screen

#### Phase 3: Content Creation (Week 3)
**Parallel Agent Tasks:**
- **Agent A: Level Design**
  - Create 10 unique maps
  - Implement environmental hazards
  - Place spawn points
  - Balance difficulty curve

- **Agent B: Enemy Variety**
  - Create zombie variants
  - Implement boss behaviors
  - Add special zombie abilities
  - Balance enemy stats

- **Agent C: Weapon Expansion**
  - Add all weapon types
  - Implement ammo system
  - Create weapon pickups
  - Balance weapon stats

#### Phase 4: Polish & Optimization (Week 4)
**Parallel Agent Tasks:**
- **Agent A: Performance**
  - Optimize rendering
  - Implement object pooling
  - Reduce draw calls
  - Memory management

- **Agent B: Visual Effects**
  - Particle systems
  - Explosion effects
  - Muzzle flashes
  - Environmental effects

- **Agent C: Multiplayer Foundation**
  - Network architecture setup
  - State synchronization design
  - Player lobby system
  - Latency compensation planning

### 6. Technical Requirements

#### Performance Targets
- 60 FPS on Chrome (latest version)
- Load time < 5 seconds
- Memory usage < 500MB
- Chrome-only optimization

#### Browser Support
- **Supported Browser:** Chrome only (latest version)
- **Required APIs:**
  - WebGL 2.0
  - Web Audio API
  - Pointer Lock API (for mouse control)
  - Local Storage (save progress)

### 7. Art Direction

#### Visual Style
- Semi-realistic 3D models
- Vibrant color palette per level theme
- Clear visual hierarchy
- Distinct silhouettes for enemies

#### Asset Requirements
- Player model + animations
- 5+ zombie models + variants
- 10 unique level environments
- Weapon models
- Particle effects
- UI elements

### 8. Audio Design

#### Sound Categories
1. **Music**
   - Main menu theme
   - 10 unique level tracks
   - Boss battle themes
   - Victory/defeat stingers

2. **Sound Effects**
   - Weapon sounds (per weapon type)
   - Zombie sounds (groans, attacks)
   - Footsteps (player + enemies)
   - Environmental sounds
   - UI feedback sounds

### 9. Multiplayer Considerations

#### Architecture Preparation
- Separate game logic from rendering
- Implement deterministic physics
- Design state synchronization
- Plan for client-server architecture

#### Future Features
- Co-op survival mode (2-4 players)
- Competitive modes
- Leaderboards
- Friend system

### 10. Success Metrics

- Player retention: 60% complete level 1
- Progression: 30% reach level 5
- Engagement: Average session > 15 minutes
- Performance: Consistent 60 FPS

### 11. Risk Mitigation

| Risk | Mitigation Strategy |
|------|-------------------|
| Performance issues with many zombies | Implement LOD system and object pooling |
| Complex multiplayer implementation | Build modular from start, add multiplayer later |
| Asset creation time | Use asset packs, focus on gameplay |
| Browser compatibility | Test early and often, use polyfills |

### 12. Development Tools

- **Version Control:** Git
- **Build System:** Vite
- **Testing:** Jest + React Testing Library
- **CI/CD:** GitHub Actions
- **Asset Pipeline:** Blender → glTF
- **Audio Editing:** Audacity

### 13. Deliverables

1. **Week 1:** Playable prototype (1 level, basic combat)
2. **Week 2:** Core game loop complete (3 levels)
3. **Week 3:** Full content (all 10 levels)
4. **Week 4:** Polished game ready for release

### 14. Post-Launch Roadmap

1. **Month 1:** Bug fixes and balancing
2. **Month 2:** Additional weapons and enemy types
3. **Month 3:** Multiplayer beta
4. **Month 4:** New game modes
5. **Month 5+:** Season content updates

---

**Document Status:** Final  
**Last Updated:** January 2025  
**Game Design Lead:** [Name]  
**Technical Lead:** [Name]