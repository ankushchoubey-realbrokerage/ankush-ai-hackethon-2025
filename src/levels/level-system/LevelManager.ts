import { Wave, Vector3 } from '../../types';
import { LevelData } from '../../types/level.types';
import { levelConfigs } from '../maps/levelConfigs';
import { ZombieManager } from '../../entities/enemies/ZombieManager';
import { VolcanoMap } from '../maps/VolcanoMap';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

export class LevelManager {
  private currentLevel: LevelData | null = null;
  private currentWaveIndex: number = 0;
  private isWaveActive: boolean = false;
  private zombieManager: ZombieManager | null = null;
  private remainingZombiesInWave: number = 0;
  private currentMap: VolcanoMap | null = null;
  private scene: THREE.Scene | null = null;
  private totalZombiesInWave: number = 0;

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  public loadLevel(levelNumber: number): void {
    const level = levelConfigs.get(levelNumber);
    if (level) {
      this.currentLevel = level;
      this.currentWaveIndex = 0;
      this.isWaveActive = false;
      
      // STEP 35: Clean up previous map if any
      if (this.currentMap) {
        this.currentMap.cleanup();
        this.currentMap = null;
      }
      
      // STEP 35: Load volcano map for level 3
      if (levelNumber === 3 && this.scene) {
        this.currentMap = new VolcanoMap(this.scene);
        this.currentMap.initialize();
      }
      
      console.log(`Loaded level ${levelNumber}: ${level.name}`);
    } else {
      console.error(`Level ${levelNumber} not found`);
    }
  }

  public startNextWave(): void {
    if (!this.currentLevel || this.currentWaveIndex >= this.currentLevel.waves.length) {
      console.log('No more waves in current level');
      return;
    }

    const wave = this.currentLevel.waves[this.currentWaveIndex];
    this.isWaveActive = true;
    this.spawnWave(wave);
    this.currentWaveIndex++;
  }

  public setZombieManager(zombieManager: ZombieManager): void {
    this.zombieManager = zombieManager;
  }
  
  private spawnWave(wave: Wave): void {
    if (!this.zombieManager || !this.currentLevel) {
      console.error('Cannot spawn wave: ZombieManager or level not set');
      return;
    }
    
    console.log(`[LevelManager.spawnWave] Spawning wave with ${wave.zombieCount} zombies`);
    console.log(`[LevelManager.spawnWave] Zombie types:`, wave.zombieTypes);
    this.remainingZombiesInWave = wave.zombieCount;
    this.totalZombiesInWave = wave.zombieCount;
    
    const spawnPoints = this.currentLevel.spawnPoints;
    console.log(`[LevelManager.spawnWave] Available spawn points:`, spawnPoints);
    
    // Spawn zombies based on type distribution
    for (let i = 0; i < wave.zombieCount; i++) {
      // Select spawn point (cycle through available points)
      const spawnPoint = spawnPoints[i % spawnPoints.length];
      
      // Determine zombie type based on wave configuration
      const zombieType = this.selectZombieType(wave.zombieTypes);
      
      // Add small random offset to prevent stacking
      const position: Vector3 = {
        x: spawnPoint.x + (Math.random() - 0.5) * 2,
        y: spawnPoint.y,
        z: spawnPoint.z + (Math.random() - 0.5) * 2
      };
      
      // Map 'basic' to 'normal' for compatibility
      const spawnType = zombieType === 'basic' ? 'normal' : zombieType as 'normal' | 'fast';
      
      // Delay spawning to create wave effect
      setTimeout(() => {
        this.zombieManager!.spawnZombie(position, spawnType);
      }, i * 200); // 200ms between each zombie spawn
    }
  }
  
  private selectZombieType(zombieTypes: { type: string; percentage: number }[]): string {
    const random = Math.random() * 100;
    let accumulated = 0;
    
    for (const zombieType of zombieTypes) {
      accumulated += zombieType.percentage;
      if (random <= accumulated) {
        return zombieType.type;
      }
    }
    
    // Fallback to first type
    return zombieTypes[0]?.type || 'basic';
  }

  public isLevelComplete(): boolean {
    return this.currentLevel !== null && 
           this.currentWaveIndex >= this.currentLevel.waves.length && 
           !this.isWaveActive;
  }

  public getCurrentLevel(): LevelData | null {
    return this.currentLevel;
  }

  public getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }
  
  // STEP 31: Additional methods for level system
  public hasMoreWaves(): boolean {
    if (!this.currentLevel) return false;
    return this.currentWaveIndex < this.currentLevel.waves.length;
  }
  
  public setCurrentLevel(levelNumber: number): void {
    this.loadLevel(levelNumber);
  }
  
  // STEP 35: Get current map
  public getCurrentMap(): VolcanoMap | null {
    return this.currentMap;
  }
  
  public onZombieKilled(): void {
    if (this.remainingZombiesInWave > 0) {
      this.remainingZombiesInWave--;
      console.log(`[LevelManager] Zombie killed. Remaining in wave: ${this.remainingZombiesInWave}`);
      
      // Check if wave is complete
      if (this.remainingZombiesInWave === 0) {
        this.isWaveActive = false;
        console.log('[LevelManager] Wave complete!');
        
        // Update wave number in game store
        const store = useGameStore.getState();
        store.setWaveNumber(this.currentWaveIndex + 1);
      }
    }
  }
  
  public isWaveComplete(): boolean {
    return !this.isWaveActive && this.remainingZombiesInWave === 0;
  }
  
  public getRemainingZombiesInWave(): number {
    return this.remainingZombiesInWave;
  }
}