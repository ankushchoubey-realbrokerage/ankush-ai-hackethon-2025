import * as THREE from 'three';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { AudioManager } from '../audio/AudioManager';
import { Player } from '../../entities/player/Player';
import { ZombieManager } from '../../entities/enemies/ZombieManager';
import { ProjectileManager } from '../../entities/projectiles/ProjectileManager';
import { LevelManager } from '../../levels/level-system/LevelManager';
import { GameStats, Entity } from '../../types';
import { PerformanceMonitor } from '../../utils/PerformanceMonitor';
import { CollisionDebugger } from '../../utils/CollisionDebugger';

export class GameEngine {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private clock: THREE.Clock;
  private container: HTMLElement;
  
  private isPaused: boolean = false;
  private isRunning: boolean = false;
  
  private inputManager: InputManager;
  private sceneManager: SceneManager;
  private physicsEngine: PhysicsEngine;
  private audioManager: AudioManager;
  private levelManager: LevelManager;
  
  private player: Player;
  private zombieManager: ZombieManager;
  private projectileManager: ProjectileManager;
  
  private gameStats: GameStats = {
    score: 0,
    zombiesKilled: 0,
    waveNumber: 1,
    level: 1
  };
  
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
    this.performanceMonitor = new PerformanceMonitor(true);
    
    // Initialize collision debugger
    this.collisionDebugger = new CollisionDebugger(this.scene);
    
    this.init();
  }

  private init(): void {
    // Setup scene
    this.sceneManager.setupScene();
    
    // Set scene for managers that need it
    this.zombieManager.setScene(this.scene);
    this.projectileManager.setScene(this.scene);
    
    // Add player to scene
    this.scene.add(this.player.getMesh());
    
    // Set camera reference for player aiming
    this.player.setCamera(this.camera, this.container);
    
    // Register player with physics engine
    this.physicsEngine.addEntity(this.player);
    
    // Add test obstacles for collision testing
    this.createTestObstacles();
    
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
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (!paused) {
      this.clock.start();
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;
    
    this.performanceMonitor.begin();
    
    requestAnimationFrame(this.gameLoop);
    
    if (!this.isPaused) {
      const deltaTime = this.clock.getDelta();
      this.update(deltaTime);
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
    
    // Update player
    this.player.update(deltaTime, input);
    
    // Update camera to follow player
    this.sceneManager.updateCameraPosition(this.player.getPosition());
    
    // Update zombies
    this.zombieManager.update(deltaTime, this.player.getPosition());
    
    // Update projectiles
    this.projectileManager.update(deltaTime);
    
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
    
    // Check game over condition
    if (this.player.isPlayerDead()) {
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
    return this.gameStats;
  }

  public getInputManager(): InputManager {
    return this.inputManager;
  }

  public getPlayer(): Player {
    return this.player;
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
}