import * as THREE from 'three';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { AudioManager } from '../audio/AudioManager';
import { Player } from '../../entities/player/Player';
import { ZombieManager } from '../../entities/enemies/ZombieManager';
import { ProjectileManager } from '../../entities/projectiles/ProjectileManager';
import { LevelManager } from '../../levels/level-system/LevelManager';
import { GameStats, Entity, Vector3 } from '../../types';
import { PerformanceMonitor } from '../../utils/PerformanceMonitor';
import { CollisionDebugger } from '../../utils/CollisionDebugger';
import { useGameStore } from '../../store/gameStore';
import { useWeaponStore } from '../../store/weaponStore';

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

  constructor(container: HTMLElement, onGameOver: () => void) {
    this.container = container;
    this.onGameOver = onGameOver;
    this.clock = new THREE.Clock();
    
    // Initialize Three.js components with Chrome optimizations
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2 for performance
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false; // Manual shadow updates for performance
    
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
    
    this.init();
  }

  private init(): void {
    // Setup scene
    this.sceneManager.setupScene();
    
    // Set scene for managers that need it
    this.zombieManager.setScene(this.scene);
    this.zombieManager.setPhysicsEngine(this.physicsEngine);
    this.zombieManager.setAudioManager(this.audioManager); // STEP 28: Set audio manager
    this.projectileManager.setScene(this.scene);
    this.projectileManager.setPhysicsEngine(this.physicsEngine);
    
    // Add player to scene
    this.scene.add(this.player.getMesh());
    
    // Set camera reference for player aiming
    this.player.setCamera(this.camera, this.container);
    
    // Set projectile manager reference for player
    this.player.setProjectileManager(this.projectileManager);
    
    // STEP 27: Set audio manager reference for player
    this.player.setAudioManager(this.audioManager);
    
    // STEP 26: Initialize audio system with test sound
    this.initializeAudio();
    
    // Register player with physics engine
    this.physicsEngine.addEntity(this.player);
    
    // Add test obstacles for collision testing
    this.createTestObstacles();
    
    // Spawn a test zombie
    this.zombieManager.spawnZombie({ x: 10, y: 0, z: 10 });
    
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
    
    // Load first level
    this.levelManager.loadLevel(1);
  }

  public start(): void {
    this.isRunning = true;
    this.clock.start(); // Ensure clock is started
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
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
    
    // Update projectiles
    this.projectileManager.update(deltaTime);
    
    // Check projectile collisions
    this.checkProjectileCollisions();
    
    // Update physics
    this.physicsEngine.update(deltaTime);
    
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
    if (store.playerHealth !== this.player.health || store.playerMaxHealth !== this.player.maxHealth) {
      store.setPlayerHealth(this.player.health, this.player.maxHealth);
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
    // Update shadows periodically for performance
    if (this.clock.getElapsedTime() % 0.1 < 0.016) { // Update every ~100ms
      this.renderer.shadowMap.needsUpdate = true;
    }
    
    this.renderer.render(this.scene, this.camera);
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
    const projectiles = this.projectileManager.getProjectiles();
    
    projectiles.forEach(projectile => {
      // Skip collision check if projectile is too young (to avoid self-collision)
      if (!projectile.canCollide()) return;
      
      // Get all collisions for this projectile
      const collisions = this.physicsEngine.getCollisions(projectile);
      
      // Check if projectile hit anything (except its owner and other projectiles)
      const hitSomething = collisions.some(entity => {
        // Skip the owner (player who shot it)
        if (entity.id === projectile.ownerId) return false;
        // Skip other projectiles
        if (entity.type === 'projectile') return false;
        // Hit something valid
        return true;
      });
      
      if (hitSomething) {
        // Create explosion effect at projectile position
        this.createExplosionEffect(projectile.transform.position);
        
        // TODO: Play explosion sound effect when audio system is ready
        // this.audioManager.playSound('explosion');
        
        // Mark projectile for removal
        projectile.active = false;
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
}