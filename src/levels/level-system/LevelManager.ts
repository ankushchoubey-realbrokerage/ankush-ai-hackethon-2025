import { Level, Wave } from '../../types';
import { levelConfigs } from '../maps/levelConfigs';
import { VolcanoMap } from '../maps/VolcanoMap';
import * as THREE from 'three';

export class LevelManager {
  private currentLevel: Level | null = null;
  private currentWaveIndex: number = 0;
  private isWaveActive: boolean = false;
  private currentMap: VolcanoMap | null = null;
  private scene: THREE.Scene | null = null;

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

  private spawnWave(wave: Wave): void {
    // This will be implemented when zombie spawning is ready
    console.log(`Spawning wave with ${wave.zombieCount} zombies`);
  }

  public isLevelComplete(): boolean {
    return this.currentLevel !== null && 
           this.currentWaveIndex >= this.currentLevel.waves.length && 
           !this.isWaveActive;
  }

  public getCurrentLevel(): Level | null {
    return this.currentLevel;
  }

  public getCurrentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }
  
  // STEP 35: Get current map
  public getCurrentMap(): VolcanoMap | null {
    return this.currentMap;
  }
}