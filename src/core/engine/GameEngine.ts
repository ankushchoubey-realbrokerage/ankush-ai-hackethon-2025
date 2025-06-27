import * as THREE from 'three';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { AudioManager } from '../audio/AudioManager';
import { Player } from '../../entities/player/Player';
import { ZombieManager } from '../../entities/enemies/ZombieManager';
import { ProjectileManager } from '../../entities/projectiles/ProjectileManager';
import { LevelManager } from '../../levels/level-system/LevelManager';
import { LevelLoader } from '../../levels/level-system/LevelLoader';
import { GameStats, Entity, Vector3 } from '../../types';
import { LevelTransitionData } from '../../types/level.types';
import { PerformanceMonitor } from '../../utils/PerformanceMonitor';
import { CollisionDebugger } from '../../utils/CollisionDebugger';
import { useGameStore } from '../../store/gameStore';
import { useWeaponStore } from '../../store/weaponStore';
import { ParticleSystem } from '../../effects/ParticleSystem';
import { EnvironmentalHazardManager } from '../../levels/environments/EnvironmentalHazardManager';
import { Explosion } from '../../effects/Explosion';
import { FogSystem } from '../../effects/FogSystem';
import { BossManager } from '../../entities/bosses/BossSystem';
import { TankZombie } from '../../entities/bosses/TankZombie';
import { useBossStore } from '../../store/bossStore';

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private clock: THREE.Clock;
  private container: HTMLElement;
  
  private isRunning: boolean = false;
  
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private physicsEngine: PhysicsEngine;
  private audioManager: AudioManager;
  private levelManager: LevelManager;
  
  private player: Player;
  private zombieManager: ZombieManager;
  private projectileManager: ProjectileManager;
  
  // Store reference - we'll get fresh state on each access
  
  private performanceMonitor: PerformanceMonitor;
  private collisionDebugger: CollisionDebugger;
  private onGameOver: () => void;
  
  // STEP 29: Particle System
  private particleSystem: ParticleSystem;
  
  // STEP 31: Level System Architecture
  private levelLoader: LevelLoader;
  private isTransitioning: boolean = false;
  private transitionData: LevelTransitionData | null = null;
  
  // STEP 35: Environmental Hazard Manager
  private environmentalHazardManager: EnvironmentalHazardManager;
  
  // STEP 37: Screen shake for explosions
  private screenShakeIntensity: number = 0;
  private originalCameraPosition: THREE.Vector3 | null = null;
  
  // STEP 38: Fog System
  private fogSystem: FogSystem;
  // STEP 40: Boss System
  private bossManager: BossManager;

  constructor(container: HTMLElement, onGameOver: () => void) {
    this.container = container;
    this.onGameOver = onGameOver;
    this.clock = new THREE.Clock();
    
    // Initialize Three.js components with Chrome optimizations
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
      logarithmicDepthBuffer: true // Helps prevent z-fighting
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = true; // Auto update to prevent flickering
    
    // Chrome-specific optimizations
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    container.appendChild(this.renderer.domElement);
    
    this.scene = new THREE.Scene();
    
    // Setup isometric camera
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 20;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    
    // Initialize managers
    this.inputManager = new InputManager(this.renderer.domElement);
    this.sceneManager = new SceneManager(this.scene, this.camera);
    this.physicsEngine = new PhysicsEngine();
    this.audioManager = new AudioManager();
    this.levelManager = new LevelManager();
    
    // Initialize game entities
    this.player = new Player();
    this.zombieManager = new ZombieManager();
    this.projectileManager = new ProjectileManager();
    
    // Initialize performance monitor (Chrome dev tools)
    this.performanceMonitor = new PerformanceMonitor(false);
    
    // Initialize collision debugger
    this.collisionDebugger = new CollisionDebugger(this.scene);
    
    // STEP 29: Initialize particle system
    this.particleSystem = new ParticleSystem(this.scene, 1000);
    
    // STEP 31: Initialize level loader
    this.levelLoader = new LevelLoader(this.scene);
    
    // STEP 31: Make gameEngine globally accessible for testing
    if (import.meta.env.DEV) {
      (window as any).gameEngine = this;
    }
    
    // STEP 35: Initialize environmental hazard manager
    this.environmentalHazardManager = new EnvironmentalHazardManager();
    
    // STEP 38: Initialize fog system
    this.fogSystem = new FogSystem(this.scene);
    this.fogSystem.setAudioManager(this.audioManager);
    
    // STEP 40: Initialize boss system
    this.bossManager = new BossManager();
    this.bossManager.setAudioManager(this.audioManager);
    this.bossManager.setParticleSystem(this.particleSystem);
    this.setupBossCallbacks();
    
    // Make boss manager globally accessible for TankZombie
    (window as any).bossManager = this.bossManager;
    
    this.init();
    
    // STEP 36: Initialize extended hazard system after scene is ready
    this.environmentalHazardManager.initializeExtended(this.scene, this.camera, this.renderer);
  }

  private init(): void {
    // Setup scene
    this.sceneManager.setupScene();
    
    // Set scene for managers that need it
    this.zombieManager.setScene(this.scene);
    this.zombieManager.setPhysicsEngine(this.physicsEngine);
    this.zombieManager.setAudioManager(this.audioManager); // STEP 28: Set audio manager
    this.zombieManager.setFogSystem(this.fogSystem); // STEP 38: Set fog system
    this.projectileManager.setScene(this.scene);
    this.projectileManager.setPhysicsEngine(this.physicsEngine);
    this.projectileManager.setAudioManager(this.audioManager); // STEP 37: Set audio for explosions
    this.levelManager.setScene(this.scene); // STEP 35: Set scene for level manager
    
    // Add player to scene
    this.scene.add(this.player.getMesh());
    
    // Set camera reference for player aiming
    this.player.setCamera(this.camera, this.container);
    
    // Set projectile manager reference for player
    this.player.setProjectileManager(this.projectileManager);
    
    // STEP 27: Set audio manager reference for player
    this.player.setAudioManager(this.audioManager);
    
    // STEP 29: Set particle system references
    this.player.setParticleSystem(this.particleSystem);
    this.zombieManager.setParticleSystem(this.particleSystem);
    this.projectileManager.setParticleSystem(this.particleSystem);
    
    // STEP 26: Initialize audio system with test sound
    this.initializeAudio();
    
    // Register player with physics engine
    this.physicsEngine.addEntity(this.player);
    
    
    // Add test obstacles for collision testing
    this.createTestObstacles();
    
    // Connect LevelManager with ZombieManager for wave spawning
    this.levelManager.setZombieManager(this.zombieManager);
    
    // STEP 33: Test mixed zombie spawning (remove in production)
    // Spawn test zombies with mixed types for testing
    if ((window as any).debugSpawnTestZombies) {
      this.zombieManager.spawnZombie({ x: 10, y: 0, z: 10 }, 'normal');
      this.zombieManager.spawnZombie({ x: -10, y: 0, z: 10 }, 'fast');
      this.zombieManager.spawnZombie({ x: 10, y: 0, z: -10 }, 'normal');
      this.zombieManager.spawnZombie({ x: -10, y: 0, z: -10 }, 'fast');
      this.zombieManager.spawnZombie({ x: 0, y: 0, z: 15 }, 'fast');
    }
    
    // Add reference markers for testing (smaller, less intrusive)
    const markerGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const markerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.5,
      roughness: 0.5,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });
    
    // Add a few position markers for spatial reference
    const markerPositions = [
      { x: 10, y: 0.3, z: 0 },
      { x: -10, y: 0.3, z: 0 },
      { x: 0, y: 0.3, z: 10 },
      { x: 0, y: 0.3, z: -10 }
    ];
    
    markerPositions.forEach(pos => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial.clone());
      marker.position.set(pos.x, pos.y, pos.z);
      marker.castShadow = true;
      this.scene.add(marker);
    });
    
    // Load first level and start first wave
    this.levelManager.loadLevel(1);
    this.configureLevelEnvironment();
    
    // Start first wave after a short delay
    setTimeout(() => {
      console.log('Starting first wave of level 1...');
      this.levelManager.startNextWave();
    }, 2000); // 2 second delay before first wave
  }
  
  private configureLevelEnvironment(): void {
    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel) return;
    
    // Stop any existing ambient sounds
    this.audioManager.stopCategory('ambient');
    
    // Configure fog and audio based on level theme
    switch (currentLevel.theme) {
      case 'forest':
        // Enable dense fog for forest level
        this.fogSystem.enable(0.025, '#3a4a3a');
        // Also update scene fog
        this.scene.fog = new THREE.FogExp2(0x3a4a3a, 0.025);
        // Start forest ambience
        this.audioManager.startForestAmbience();
        // Load forest map assets
        this.loadForestMap();
        break;
      case 'industrial':
        // Light fog for industrial level
        this.fogSystem.enable(0.01, '#666666');
        this.scene.fog = new THREE.FogExp2(0x666666, 0.01);
        // Start industrial ambience
        this.audioManager.startIndustrialAmbience();
        // Load industrial map assets
        this.loadIndustrialMap();
        break;
      case 'simple-map':
      case 'city-streets':
      default:
        // Disable fog for other levels
        this.fogSystem.disable();
        // Use default scene fog
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
        break;
    }
  }
  
  private loadForestMap(): void {
    // Import and load the forest map
    import('../../levels/maps/ForestMap').then(({ ForestMap }) => {
      const forestMap = new ForestMap(this.scene);
      forestMap.load();
      
      // Register obstacles with physics engine
      const obstacles = forestMap.getObstacles();
      obstacles.forEach(obstacle => {
        // Create a simple entity wrapper for physics
        const obstacleEntity = {
          id: `forest-obstacle-${Math.random()}`,
          type: 'obstacle' as const,
          transform: {
            position: {
              x: obstacle.position.x,
              y: obstacle.position.y,
              z: obstacle.position.z
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
          },
          boundingBox: {
            min: { x: -1, y: 0, z: -1 },
            max: { x: 1, y: 3, z: 1 }
          },
          active: true
        };
        this.physicsEngine.addEntity(obstacleEntity);
      });
    });
  }
  
  private loadIndustrialMap(): void {
    // Import and load the industrial map
    import('../../levels/maps/IndustrialMap').then(({ IndustrialMap }) => {
      const industrialMap = new IndustrialMap(this.scene);
      industrialMap.load(this.particleSystem);
      
      // Store reference for updates
      (this as any).industrialMap = industrialMap;
      
      // Register obstacles with physics engine
      const obstacles = industrialMap.getObstacles();
      obstacles.forEach(obstacle => {
        const obstacleEntity = {
          id: `industrial-obstacle-${Math.random()}`,
          type: 'obstacle' as const,
          transform: {
            position: {
              x: obstacle.position.x,
              y: obstacle.position.y,
              z: obstacle.position.z
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 }
          },
          boundingBox: {
            min: { x: -2, y: 0, z: -2 },
            max: { x: 2, y: 4, z: 2 }
          },
          active: true
        };
        this.physicsEngine.addEntity(obstacleEntity);
      });
    });
  }
  
  private setupBossCallbacks(): void {
    const bossStore = useBossStore.getState();
    
    this.bossManager.setCallbacks({
      onBossSpawn: (boss) => {
        bossStore.setBoss(boss);
        console.log('Boss spawned:', boss.name);
      },
      onPhaseChange: (boss, phase) => {
        bossStore.setBossPhase(phase);
        
        // Show warning for special attacks
        if (phase === 2) {
          bossStore.showSpecialAttackWarning('Boss Enraged! Ground Slam Attack Unlocked!');
        } else if (phase === 3) {
          bossStore.showSpecialAttackWarning('Boss Berserk! Maximum Rage!');
        }
      },
      onSpecialAttack: (boss, attackName) => {
        bossStore.showSpecialAttackWarning(attackName);
      },
      onBossDamaged: (boss, damage) => {
        bossStore.updateBossHealth(boss.health, damage);
      },
      onBossDefeat: (boss) => {
        bossStore.hideBossUI();
        
        // Add bonus score
        const gameStore = useGameStore.getState();
        gameStore.addScore(5000); // Boss defeat bonus
        
        // Show victory message after delay
        setTimeout(() => {
          console.log('Boss defeated! Victory!');
          // Could trigger level completion here
        }, 3000);
      }
    });
  }
  
  private spawnBoss(): void {
    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel || currentLevel.theme !== 'industrial') return;
    
    // Spawn Tank Zombie boss in the arena
    const bossPosition = { x: 0, y: 0, z: -30 }; // Arena center
    const tankBoss = new TankZombie(bossPosition);
    
    // Set up boss systems
    tankBoss.setAudioManager(this.audioManager);
    tankBoss.setParticleSystem(this.particleSystem);
    tankBoss.setOnSummonCallback((position) => {
      // Spawn regular zombie at position
      this.zombieManager.spawnZombie(position, 'basic');
    });
    
    // Add to scene
    this.scene.add(tankBoss.getMesh());
    
    // Register with physics
    this.physicsEngine.addEntity(tankBoss);
    
    // Add to zombie manager for updates
    (this.zombieManager as any).zombies.set(tankBoss.id, tankBoss);
    
    // Start boss fight
    this.bossManager.startBossFight(tankBoss);
  }

  public start(): void {
    this.isRunning = true;
    this.clock.start(); // Ensure clock is started
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
  }

  public pause(): void {
    this.setPaused(true);
  }

  public setPaused(paused: boolean): void {
    const store = useGameStore.getState();
    if (paused) {
      store.pauseGame();
    } else {
      store.resumeGame();
      this.clock.start();
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;
    
    this.performanceMonitor.begin();
    
    requestAnimationFrame(this.gameLoop);
    
    const gameState = useGameStore.getState().gameState;
    if (gameState === 'playing') {
      const deltaTime = this.clock.getDelta();
      this.update(deltaTime);
    } else if (gameState === 'paused') {
      // Clock is paused, no updates
    }
    
    this.render();
    
    this.performanceMonitor.end();
  };

  private update(deltaTime: number): void {
    // Update input
    const input = this.inputManager.getInput();
    
    // Toggle collision debug with F2
    if (input.debugCollisions) {
      this.collisionDebugger.toggleDebug();
    }
    
    // Toggle pause with ESC
    if (input.pauseToggled) {
      const store = useGameStore.getState();
      const currentState = store.gameState;
      if (currentState === 'playing') {
        store.pauseGame();
      } else if (currentState === 'paused') {
        store.resumeGame();
      }
    }
    
    // Update player
    this.player.update(deltaTime, input);
    
    // Update camera to follow player
    this.sceneManager.updateCameraPosition(this.player.getPosition());
    
    // STEP 28: Update 3D audio listener position to match player
    this.audioManager.updateListenerPosition(this.player.getPosition(), this.player.getAimDirection());
    
    // Update zombies
    this.zombieManager.update(deltaTime, this.player.getPosition());
    
    // STEP 40: Update boss manager
    this.bossManager.update(deltaTime, this.player.getPosition());
    
    // Update projectiles
    this.projectileManager.update(deltaTime);
    
    // Check projectile collisions
    this.checkProjectileCollisions();
    
    // STEP 17: Check zombie-player collisions
    this.checkZombiePlayerCollisions();
    
    // Update physics
    this.physicsEngine.update(deltaTime);
    
    // STEP 29: Update particle system
    this.particleSystem.update(deltaTime);
    
    // STEP 31: Update level loader (weapon pickups animation)
    this.updateLevelLoader(deltaTime);
    
    // STEP 31: Check win conditions
    if (this.checkWinConditions()) {
      console.log('Level completed!');
      // Trigger level completion logic
      this.onLevelComplete();
    }
    
    // STEP 31: Debug level loading
    if ((window as any).debugLoadLevel) {
      const levelId = (window as any).debugLoadLevel;
      (window as any).debugLoadLevel = null;
      this.loadLevel(levelId);
    }
    
    // STEP 33: Debug wave spawning
    if ((window as any).debugStartWave) {
      (window as any).debugStartWave = null;
      this.levelManager.startNextWave();
    }
    
    // STEP 34: Debug shotgun testing
    if ((window as any).debugGiveShotgun) {
      (window as any).debugGiveShotgun = null;
      // Import Shotgun synchronously to avoid async issue
      import('../../weapons').then(({ Shotgun }) => {
        this.player.addWeapon(new Shotgun());
        console.log('Shotgun added to player inventory');
      });
    }
    
    // STEP 35: Update environmental hazards
    const damagableEntities = [
      this.player,
      ...this.zombieManager.getZombies()
    ];
    this.environmentalHazardManager.update(damagableEntities, deltaTime);
    
    // STEP 37: Update explosions
    Explosion.setEntities(damagableEntities);
    Explosion.update(deltaTime);
    
    // Update camera position for projectile manager
    this.projectileManager.setCameraInfo(
      this.camera.position,
      (intensity: number) => this.applyScreenShake(intensity)
    );
    
    // Update screen shake
    this.updateScreenShake(deltaTime);
    
    // STEP 38: Update fog system (for lightning effects)
    const ambientLight = this.scene.children.find(child => child instanceof THREE.AmbientLight) as THREE.AmbientLight;
    this.fogSystem.update(deltaTime, ambientLight);
    
    // STEP 39: Update industrial map mechanics if loaded
    if ((this as any).industrialMap) {
      const industrialMap = (this as any).industrialMap;
      industrialMap.update(deltaTime);
      
      // Apply conveyor belt movement to entities
      const allEntities = [this.player, ...this.zombieManager.getZombies()];
      industrialMap.getConveyorBelts().forEach((belt: any) => {
        allEntities.forEach(entity => {
          belt.applyMovement(entity, deltaTime);
        });
      });
      
      // Check hazard collisions
      industrialMap.getHazards().forEach((hazard: any) => {
        allEntities.forEach(entity => {
          if (hazard.checkCollision(entity)) {
            hazard.applyEffect(entity);
          }
        });
      });
    }
    // Update collision debug visualization
    if (this.collisionDebugger.isEnabled()) {
      // Update player debug box
      this.collisionDebugger.updateDebugBox(this.player);
      
      // Update obstacle debug boxes
      this.physicsEngine.getAllEntities().forEach(entity => {
        if (entity.type === 'obstacle') {
          this.collisionDebugger.updateDebugBox(entity);
        }
      });
    }
    
    // Update player health in store only if it changed
    const store = useGameStore.getState();
    const currentHealth = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    if (store.playerHealth !== currentHealth || store.playerMaxHealth !== maxHealth) {
      store.setPlayerHealth(currentHealth, maxHealth);
    }
    
    // Update weapon info in store
    const weaponStore = useWeaponStore.getState();
    const currentWeapon = this.player.getCurrentWeapon();
    if (weaponStore.currentWeapon?.id !== currentWeapon?.id) {
      weaponStore.setCurrentWeapon(currentWeapon);
      weaponStore.setWeapons(this.player.weapons);
      weaponStore.setCurrentWeaponIndex(this.player.currentWeaponIndex);
    }
    
    // Check game over condition
    if (this.player.isPlayerDead() && store.gameState !== 'gameOver') {
      store.gameOver();
      this.onGameOver();
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  // STEP 35: Load a specific level (simple version)
  private loadLevelSimple(levelNumber: number): void {
    this.levelManager.loadLevel(levelNumber);
    
    // Initialize hazards for the level
    const level = this.levelManager.getCurrentLevel();
    const map = this.levelManager.getCurrentMap();
    
    if (level && map && typeof (map as any).getLavaHazards === 'function') {
      this.environmentalHazardManager.initialize(levelNumber, (map as any).getLavaHazards());
    }
    
    // STEP 36: Create demo hazards for testing
    if (levelNumber === 99) { // Demo level
      this.createDemoHazards();
    }
  }
  
  // STEP 36: Create demo hazards showcasing all types
  private createDemoHazards(): void {
    // Damage zone (acid pool)
    this.environmentalHazardManager.createHazard({
      id: 'demo_acid_1',
      type: 'damage',
      position: { x: -10, y: 0, z: 0 },
      dimensions: { x: 4, y: 0.5, z: 4 },
      properties: {
        damage: 15,
        damageType: 'acid'
      }
    });
    
    // Instant death pit
    this.environmentalHazardManager.createHazard({
      id: 'demo_pit_1',
      type: 'instant_death',
      position: { x: 10, y: -1, z: 0 },
      dimensions: { x: 3, y: 2, z: 3 },
      properties: {
        deathType: 'pit'
      }
    });
    
    // Slowing zone (mud)
    this.environmentalHazardManager.createHazard({
      id: 'demo_mud_1',
      type: 'slow',
      position: { x: 0, y: 0, z: -10 },
      dimensions: { x: 6, y: 0.3, z: 6 },
      properties: {
        slowFactor: 0.3,
        slowType: 'mud'
      }
    });
    
    // Push zone (wind)
    this.environmentalHazardManager.createHazard({
      id: 'demo_wind_1',
      type: 'push',
      position: { x: 0, y: 0, z: 10 },
      dimensions: { x: 8, y: 4, z: 2 },
      properties: {
        pushForce: { x: 5, y: 0, z: 0 },
        pushType: 'wind'
      }
    });
    
    // Geyser (upward push)
    this.environmentalHazardManager.createHazard({
      id: 'demo_geyser_1',
      type: 'push',
      position: { x: -5, y: 0, z: -5 },
      dimensions: { x: 2, y: 0.5, z: 2 },
      properties: {
        pushForce: { x: 0, y: 20, z: 0 },
        pushType: 'geyser'
      }
    });
    
    // Ice slowing zone
    this.environmentalHazardManager.createHazard({
      id: 'demo_ice_1',
      type: 'slow',
      position: { x: 5, y: 0, z: 5 },
      dimensions: { x: 5, y: 0.1, z: 5 },
      properties: {
        slowFactor: 0.7,
        slowType: 'ice'
      }
    });
  }

  private async initializeAudio(): Promise<void> {
    try {
      // STEP 26: Load test sound with base64 encoded beep
      // This is a simple sine wave beep sound encoded as base64
      const testBeepBase64 = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgYODhYWHh4mJi4uNjY+PkZGTk5WVl5eZmZubnd2fn6Gio6Slpqepqaqrra2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
      
      await this.audioManager.loadSound('test-beep', {
        src: [testBeepBase64],
        volume: 0.3,
        preload: true
      }, 'ui');
      
      console.log('Audio system initialized successfully');
      
      // Play test sound after a short delay to ensure user interaction
      setTimeout(() => {
        console.log('Playing test beep sound...');
        this.audioManager.playSound('test-beep', 0.5);
      }, 1000);
      
      // STEP 27: Initialize weapon sounds
      await this.audioManager.initializeWeaponSounds();
      
      // STEP 28: Initialize zombie sounds
      await this.audioManager.initializeZombieSounds();
      
      // STEP 38: Initialize forest sounds
      await this.audioManager.initializeForestSounds();
      
      // STEP 39: Initialize industrial sounds
      await this.audioManager.initializeIndustrialSounds();
      
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  public handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    const frustumSize = 20;
    
    this.camera.left = frustumSize * aspect / -2;
    this.camera.right = frustumSize * aspect / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = frustumSize / -2;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  public destroy(): void {
    this.stop();
    this.inputManager.destroy();
    this.audioManager.destroy();
    this.performanceMonitor.destroy();
    // STEP 29: Dispose particle system
    this.particleSystem.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }

  public getGameStats(): GameStats {
    return useGameStore.getState().gameStats;
  }

  public getInputManager(): InputManager {
    return this.inputManager;
  }

  public getPlayer(): Player {
    return this.player;
  }

  public toggleDebug(): void {
    this.performanceMonitor.toggle();
  }

  private createTestObstacles(): void {
    // Create some test walls/obstacles for collision testing
    const obstacleData = [
      { id: 'wall1', pos: { x: 15, y: 1, z: 0 }, size: { x: 2, y: 2, z: 10 } },
      { id: 'wall2', pos: { x: -15, y: 1, z: 0 }, size: { x: 2, y: 2, z: 10 } },
      { id: 'wall3', pos: { x: 0, y: 1, z: 15 }, size: { x: 10, y: 2, z: 2 } },
      { id: 'wall4', pos: { x: 0, y: 1, z: -15 }, size: { x: 10, y: 2, z: 2 } },
      { id: 'pillar1', pos: { x: 7, y: 1, z: 7 }, size: { x: 2, y: 2, z: 2 } },
      { id: 'pillar2', pos: { x: -7, y: 1, z: -7 }, size: { x: 2, y: 2, z: 2 } }
    ];

    const obstacleMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.8,
      metalness: 0.2
    });

    obstacleData.forEach((data) => {
      const geometry = new THREE.BoxGeometry(data.size.x, data.size.y, data.size.z);
      const mesh = new THREE.Mesh(geometry, obstacleMaterial);
      mesh.position.set(data.pos.x, data.pos.y, data.pos.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Create entity for physics
      const obstacle: Entity = {
        id: data.id,
        type: 'obstacle',
        transform: {
          position: { ...data.pos },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        },
        boundingBox: {
          min: { 
            x: -data.size.x / 2, 
            y: -data.size.y / 2, 
            z: -data.size.z / 2 
          },
          max: { 
            x: data.size.x / 2, 
            y: data.size.y / 2, 
            z: data.size.z / 2 
          }
        },
        active: true
      };

      // Add as static entity to physics
      this.physicsEngine.addEntity(obstacle, true);
    });
  }
  
  private checkProjectileCollisions(): void {
    // STEP 18: Projectile-Zombie Collision
    const projectiles = this.projectileManager.getProjectiles();
    const zombies = this.zombieManager.getZombies();
    
    
    projectiles.forEach(projectile => {
      // Skip collision check if projectile is too young (to avoid self-collision)
      if (!projectile.canCollide()) return;
      
      // Skip if projectile is already inactive
      if (!projectile.active) return;
      
      // Check collision with each zombie
      zombies.forEach(zombie => {
        if (!zombie.active || zombie.isDead) return;
        
        // Simple AABB collision check between projectile and zombie
        const projPos = projectile.transform.position;
        const zombiePos = zombie.transform.position;
        const zombieBox = zombie.boundingBox;
        
        // Calculate zombie's world space bounding box
        const zombieMinX = zombiePos.x + zombieBox.min.x;
        const zombieMaxX = zombiePos.x + zombieBox.max.x;
        const zombieMinY = zombiePos.y + zombieBox.min.y;
        const zombieMaxY = zombiePos.y + zombieBox.max.y;
        const zombieMinZ = zombiePos.z + zombieBox.min.z;
        const zombieMaxZ = zombiePos.z + zombieBox.max.z;
        
        
        // Check if projectile point is inside zombie bounding box
        if (projPos.x >= zombieMinX && projPos.x <= zombieMaxX &&
            projPos.y >= zombieMinY && projPos.y <= zombieMaxY &&
            projPos.z >= zombieMinZ && projPos.z <= zombieMaxZ) {
          
          console.log(`HIT! Zombie hit by projectile with damage=${projectile.damage}. Health: ${zombie.health} -> ${zombie.health - projectile.damage}`);
          
          // Deal damage to zombie
          zombie.takeDamage(projectile.damage);
          
          // STEP 29: Create blood splatter effect
          if (this.particleSystem) {
            const hitPosition = projectile.transform.position;
            const direction = {
              x: projectile.velocity.x,
              y: projectile.velocity.y,
              z: projectile.velocity.z
            };
            
            // Normalize direction
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
            if (length > 0) {
              direction.x /= length;
              direction.y /= length;
              direction.z /= length;
            }
            
            this.particleSystem.emit('blood', {
              count: 20,
              emitPosition: new THREE.Vector3(hitPosition.x, hitPosition.y + 0.5, hitPosition.z),
              emitDirection: new THREE.Vector3(direction.x, direction.y + 0.5, direction.z),
              spread: 0.5,
              speed: 3,
              speedVariation: 1,
              color: new THREE.Color(0.5, 0, 0),
              size: 0.1,
              sizeVariation: 0.05,
              lifetime: 1.5,
              lifetimeVariation: 0.5
            });
          }
          
          // Check if zombie died
          if (zombie.isDead) {
            console.log(`ZOMBIE KILLED! +10 points. Score before: ${useGameStore.getState().gameStats.score}`);
            // Update score
            const store = useGameStore.getState();
            store.addScore(10); // 10 points per zombie
            store.incrementZombiesKilled();
            console.log(`Score after: ${store.gameStats.score}, Zombies killed: ${store.gameStats.zombiesKilled}`);
          }
          
          // STEP 29: Create explosion effect using particle system
          if (this.particleSystem) {
            const pos = projectile.transform.position;
            this.particleSystem.emit('custom', {
              count: 30,
              emitPosition: new THREE.Vector3(pos.x, pos.y, pos.z),
              emitDirection: new THREE.Vector3(0, 1, 0),
              spread: Math.PI,
              speed: 4,
              speedVariation: 2,
              color: new THREE.Color(1, 0.5, 0),
              colorVariation: 0.3,
              size: 0.2,
              sizeVariation: 0.1,
              lifetime: 0.5,
              lifetimeVariation: 0.2,
              gravity: true,
              fadeOut: true,
              shrink: true
            });
          }
          
          // Create hit effect at projectile position
          this.createExplosionEffect(projectile.transform.position);
          
          // Mark projectile for removal
          projectile.active = false;
        }
      });
      
      // Check collisions with physics engine for obstacles
      if (projectile.active) { // Only check if projectile hasn't hit a zombie
        const collisions = this.physicsEngine.getCollisions(projectile);
        const hitObstacle = collisions.some(entity => {
          if (entity.id === projectile.ownerId) return false;
          if (entity.type === 'projectile') return false;
          if (entity.type === 'zombie') return false; // Already handled above
          return true;
        });
        
        if (hitObstacle) {
          this.createExplosionEffect(projectile.transform.position);
          projectile.active = false;
        }
      }
    });
  }
  
  private createExplosionEffect(position: Vector3): void {
    // Create flash effect
    const flashGeometry = new THREE.SphereGeometry(1, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.set(position.x, position.y, position.z);
    this.scene.add(flash);
    
    // Animate flash
    const flashStart = Date.now();
    const flashAnimate = () => {
      const elapsed = Date.now() - flashStart;
      const progress = elapsed / 200; // 0.2 seconds
      
      if (progress < 1) {
        flash.scale.setScalar(1 + progress * 2);
        flashMaterial.opacity = 0.8 * (1 - progress);
        requestAnimationFrame(flashAnimate);
      } else {
        this.scene.remove(flash);
      }
    };
    flashAnimate();
    
    // Create explosion particles
    const particleCount = 20;
    const explosionGroup = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1 * Math.random(), 1, 0.5),
        transparent: true,
        opacity: 1
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Random direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      const velocityX = Math.cos(angle) * speed;
      const velocityZ = Math.sin(angle) * speed;
      const velocityY = Math.random() * 3;
      
      particle.position.set(position.x, position.y, position.z);
      
      // Animate particle
      const startTime = Date.now();
      const duration = 500; // 0.5 seconds
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
          particle.position.x += velocityX * 0.016;
          particle.position.y += velocityY * 0.016 - 0.3 * progress * 0.016; // Gravity
          particle.position.z += velocityZ * 0.016;
          
          particleMaterial.opacity = 1 - progress;
          particle.scale.setScalar(1 - progress * 0.5);
          
          requestAnimationFrame(animate);
        } else {
          this.scene.remove(particle);
        }
      };
      
      animate();
      explosionGroup.add(particle);
    }
    
    this.scene.add(explosionGroup);
    
    // Remove explosion group after animation
    setTimeout(() => {
      this.scene.remove(explosionGroup);
    }, 600);
  }
  
  // STEP 17: Zombie-Player Collision
  private checkZombiePlayerCollisions(): void {
    const zombies = this.zombieManager.getZombies();
    const playerPos = this.player.getPosition();
    
    zombies.forEach(zombie => {
      if (zombie.isDead || !zombie.active) return;
      
      // Check if zombie is in attack range of player
      if (zombie.isInAttackRange(playerPos)) {
        // Check if zombie can attack (respects cooldown)
        if (zombie.canAttack()) {
          // Deal damage to player
          this.player.takeDamage(zombie.damage);
          zombie.attack(); // Update zombie's last attack time
        }
      }
    });
  }
  
  // STEP 31: Level System Architecture - Level Transition Methods
  
  /**
   * Load a specific level
   */
  public async loadLevel(levelId: number): Promise<boolean> {
    if (this.isTransitioning) {
      console.warn('Level transition already in progress');
      return false;
    }
    
    this.isTransitioning = true;
    
    try {
      // Pause game during transition
      const wasRunning = this.isRunning;
      this.pause();
      
      // Save current player state if transitioning from another level
      if (this.levelLoader!.getCurrentLevel()) {
        this.saveTransitionData();
      }
      
      // Clear current level entities
      this.clearLevelEntities();
      
      // Load new level
      const result = await this.levelLoader!.loadLevel(levelId);
      
      if (!result.success) {
        console.error('Failed to load level:', result.error);
        this.isTransitioning = false;
        return false;
      }
      
      // Initialize level entities
      const levelData = result.level!;
      this.initializeLevelEntities(levelData);
      
      // Restore player state if transitioning
      if (this.transitionData) {
        this.restorePlayerState();
      }
      
      // Update level manager
      this.levelManager.setCurrentLevel(levelId);
      
      // Initialize hazards for the level
      const level = this.levelManager.getCurrentLevel();
      const map = this.levelManager.getCurrentMap();
      
      if (level && map && typeof (map as any).getLavaHazards === 'function') {
        this.environmentalHazardManager.initialize(levelId, (map as any).getLavaHazards());
      }
      
      // STEP 36: Create demo hazards for testing
      if (levelId === 99) { // Demo level
        this.createDemoHazards();
      }
      
      // Auto-start first wave after a short delay
      setTimeout(() => {
        console.log('Starting first wave...');
        this.levelManager.startNextWave();
      }, 2000); // 2 second delay before first wave
      
      // Resume game if it was running
      if (wasRunning) {
        this.start();
      }
      
      this.isTransitioning = false;
      return true;
      
    } catch (error) {
      console.error('Error during level transition:', error);
      this.isTransitioning = false;
      return false;
    }
  }
  
  /**
   * Transition to next level
   */
  public async transitionToNextLevel(): Promise<boolean> {
    const currentLevel = this.levelLoader?.getCurrentLevel();
    if (!currentLevel) {
      console.error('No current level to transition from');
      return false;
    }
    
    const nextLevelId = currentLevel.id + 1;
    return this.loadLevel(nextLevelId);
  }
  
  /**
   * Save player state for transition
   */
  private saveTransitionData(): void {
    const currentLevel = this.levelLoader!.getCurrentLevel()!;
    const playerWeapons = this.player.weapons.map(w => w.id);
    const playerAmmo = new Map<string, number>();
    
    // Save ammo for each weapon
    this.player.weapons.forEach(weapon => {
      playerAmmo.set(weapon.id, weapon.ammo);
    });
    
    this.transitionData = {
      fromLevel: currentLevel.id,
      toLevel: currentLevel.id + 1,
      playerHealth: this.player.getHealth(),
      playerWeapons,
      playerAmmo,
      score: useGameStore.getState().gameStats.score,
      time: useGameStore.getState().gameStats.time
    };
  }
  
  /**
   * Restore player state after transition
   */
  private restorePlayerState(): void {
    if (!this.transitionData) return;
    
    // Restore health
    this.player.health = this.transitionData.playerHealth;
    
    // Restore weapons and ammo
    // This would need weapon restoration logic
    
    // Restore score
    useGameStore.getState().setScore(this.transitionData.score);
    
    this.transitionData = null;
  }
  
  /**
   * Clear all level-specific entities
   */
  private clearLevelEntities(): void {
    // Clear zombies
    this.zombieManager.clearAllZombies();
    
    // Clear projectiles
    this.projectileManager.clearAllProjectiles();
    
    // Clear particles
    if (this.particleSystem) {
      this.particleSystem.clear();
    }
    
    // Level loader handles its own cleanup
    if (this.levelLoader) {
      this.levelLoader.cleanupLevel();
    }
  }
  
  /**
   * Initialize entities for the loaded level
   */
  private initializeLevelEntities(levelData: any): void {
    // Set player start position
    if (levelData.playerStartPosition) {
      this.player.setPosition(
        levelData.playerStartPosition.x,
        levelData.playerStartPosition.y,
        levelData.playerStartPosition.z
      );
    }
    
    // Level manager will handle wave spawning
    // Weapon pickups are handled by level loader
  }
  
  /**
   * Check win conditions for current level
   */
  public checkWinConditions(): boolean {
    const levelData = this.levelLoader?.getCurrentLevel();
    if (!levelData) return false;
    
    for (const condition of levelData.winConditions) {
      switch (condition.type) {
        case 'kill_all':
          // Check if all zombies are dead and no more waves
          const zombies = this.zombieManager.getZombies();
          const allDead = zombies.length === 0 || zombies.every(z => z.isDead);
          const noMoreWaves = !this.levelManager.hasMoreWaves();
          if (allDead && noMoreWaves) {
            return true;
          }
          break;
          
        case 'survive_time':
          // Check if enough time has passed
          if (condition.value && useGameStore.getState().gameStats.time >= condition.value) {
            return true;
          }
          break;
          
        case 'kill_boss':
          // Check if boss is defeated
          // This would need boss tracking logic
          break;
          
        case 'reach_exit':
          // Check if player reached exit zone
          // This would need exit zone logic
          break;
      }
    }
    
    return false;
  }
  
  /**
   * Update level loader animations
   */
  private updateLevelLoader(deltaTime: number): void {
    if (this.levelLoader) {
      this.levelLoader.updatePickups(deltaTime);
    }
  }
  
  /**
   * Handle level completion
   */
  private onLevelComplete(): void {
    // Pause the game
    this.pause();
    
    // Show level complete UI
    console.log('Level Complete! Score:', useGameStore.getState().gameStats.score);
    
    // Transition to next level after a delay
    setTimeout(() => {
      this.transitionToNextLevel();
    }, 3000);
  }
  
  // STEP 37: Screen shake implementation
  private applyScreenShake(intensity: number): void {
    this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
    if (!this.originalCameraPosition) {
      this.originalCameraPosition = this.camera.position.clone();
    }
  }
  
  private updateScreenShake(deltaTime: number): void {
    if (this.screenShakeIntensity > 0) {
      // Apply shake
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity * 0.5;
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity * 0.5;
      
      if (this.originalCameraPosition) {
        this.camera.position.x = this.originalCameraPosition.x + shakeX;
        this.camera.position.y = this.originalCameraPosition.y + shakeY;
      }
      
      // Decay shake
      this.screenShakeIntensity *= 0.9;
      if (this.screenShakeIntensity < 0.01) {
        this.screenShakeIntensity = 0;
        if (this.originalCameraPosition) {
          this.camera.position.copy(this.originalCameraPosition);
        }
      }
    }
  }
}