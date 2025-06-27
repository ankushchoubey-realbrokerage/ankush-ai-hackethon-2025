import { Wave } from '../../types';
import { LevelData } from '../../types/level.types';
import { levelConfigs } from '../maps/levelConfigs';

export class LevelManager {
  private currentLevel: LevelData | null = null;
  private currentWaveIndex: number = 0;
  private isWaveActive: boolean = false;

  public loadLevel(levelNumber: number): void {
    const level = levelConfigs.get(levelNumber);
    if (level) {
      this.currentLevel = level;
      this.currentWaveIndex = 0;
      this.isWaveActive = false;
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
}