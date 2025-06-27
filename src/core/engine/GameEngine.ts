import * as THREE from 'three';
import { InputManager } from './InputManager';
import { SceneManager } from './SceneManager';
import { PhysicsEngine } from '../physics/PhysicsEngine';
import { AudioManager } from '../audio/AudioManager';
import { Player } from '../../entities/player/Player';
import { ZombieManager } from '../../entities/enemies/ZombieManager';
import { ProjectileManager } from '../../entities/projectiles/ProjectileManager';
import { LevelManager } from '../../levels/level-system/LevelManager';
import { GameStats } from '../../types';

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
  
  private onGameOver: () => void;

  constructor(container: HTMLElement, onGameOver: () => void) {
    this.container = container;
    this.onGameOver = onGameOver;
    this.clock = new THREE.Clock();
    
    // Initialize Three.js components
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    
    // Add test cubes for camera verification
    const testGeometry = new THREE.BoxGeometry(2, 2, 2);
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const positions = [
      { x: 5, y: 1, z: 5 },
      { x: -5, y: 1, z: 5 },
      { x: 5, y: 1, z: -5 },
      { x: -5, y: 1, z: -5 }
    ];
    
    positions.forEach((pos, index) => {
      const testMaterial = new THREE.MeshStandardMaterial({ 
        color: colors[index],
        metalness: 0.3,
        roughness: 0.7
      });
      const testCube = new THREE.Mesh(testGeometry, testMaterial);
      testCube.position.set(pos.x, pos.y, pos.z);
      testCube.castShadow = true;
      testCube.receiveShadow = true;
      this.scene.add(testCube);
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
    
    requestAnimationFrame(this.gameLoop);
    
    if (!this.isPaused) {
      const deltaTime = this.clock.getDelta();
      this.update(deltaTime);
    }
    
    this.render();
  };

  private update(deltaTime: number): void {
    // Update input
    const input = this.inputManager.getInput();
    
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
    
    // Check game over condition
    if (this.player.isPlayerDead()) {
      this.onGameOver();
    }
  }

  private render(): void {
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
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }

  public getGameStats(): GameStats {
    return this.gameStats;
  }
}