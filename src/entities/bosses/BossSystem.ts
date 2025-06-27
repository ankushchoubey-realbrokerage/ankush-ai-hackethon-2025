import { Entity, Vector3 } from '../../types';
import { AudioManager } from '../../core/audio/AudioManager';
import { ParticleSystem } from '../../effects/ParticleSystem';

export interface IBoss extends Entity {
  name: string;
  health: number;
  maxHealth: number;
  phase: number;
  specialAttackCooldown: number;
  lastSpecialAttackTime: number;
  
  enterPhase(phase: number): void;
  specialAttack(): void;
  onDefeat(): void;
  update(deltaTime: number, playerPosition: Vector3): void;
}

export interface BossEventCallbacks {
  onBossSpawn?: (boss: IBoss) => void;
  onPhaseChange?: (boss: IBoss, phase: number) => void;
  onSpecialAttack?: (boss: IBoss, attackName: string) => void;
  onBossDamaged?: (boss: IBoss, damage: number) => void;
  onBossDefeat?: (boss: IBoss) => void;
}

export class BossManager {
  private currentBoss: IBoss | null = null;
  private callbacks: BossEventCallbacks = {};
  private audioManager: AudioManager | null = null;
  private particleSystem: ParticleSystem | null = null;
  private bossMusic: number | null = null;
  
  constructor() {}
  
  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }
  
  setCallbacks(callbacks: BossEventCallbacks): void {
    this.callbacks = callbacks;
  }
  
  startBossFight(boss: IBoss): void {
    if (this.currentBoss) {
      console.warn('Boss fight already in progress');
      return;
    }
    
    this.currentBoss = boss;
    
    // Play boss intro
    this.playBossIntro();
    
    // Start boss music
    this.startBossMusic();
    
    // Notify callbacks
    if (this.callbacks.onBossSpawn) {
      this.callbacks.onBossSpawn(boss);
    }
    
    console.log(`Boss fight started: ${boss.name}`);
  }
  
  private playBossIntro(): void {
    // Play boss roar or intro sound
    if (this.audioManager && this.currentBoss) {
      // Play alarm sound as boss intro
      this.audioManager.playAlarm();
    }
  }
  
  private startBossMusic(): void {
    // Start intense battle music
    if (this.audioManager) {
      // For now, we can use the industrial ambience at higher volume
      // In a real game, we'd have dedicated boss battle music
      this.audioManager.stopCategory('ambient');
      this.audioManager.startIndustrialAmbience();
    }
  }
  
  update(deltaTime: number, playerPosition: Vector3): void {
    if (!this.currentBoss) return;
    
    // Update boss
    this.currentBoss.update(deltaTime, playerPosition);
    
    // Check phase transitions
    this.checkPhaseTransitions();
    
    // Check if boss is defeated
    if (this.currentBoss.health <= 0 && this.currentBoss.active) {
      this.defeatBoss();
    }
  }
  
  private checkPhaseTransitions(): void {
    if (!this.currentBoss) return;
    
    const healthPercentage = this.currentBoss.health / this.currentBoss.maxHealth;
    let newPhase = 1;
    
    if (healthPercentage <= 0.33) {
      newPhase = 3; // Rage mode
    } else if (healthPercentage <= 0.66) {
      newPhase = 2; // Add ground slam
    }
    
    if (newPhase !== this.currentBoss.phase) {
      this.currentBoss.enterPhase(newPhase);
      
      if (this.callbacks.onPhaseChange) {
        this.callbacks.onPhaseChange(this.currentBoss, newPhase);
      }
    }
  }
  
  private defeatBoss(): void {
    if (!this.currentBoss) return;
    
    this.currentBoss.onDefeat();
    
    // Stop boss music
    if (this.audioManager) {
      this.audioManager.stopCategory('ambient');
    }
    
    // Play victory sound
    if (this.audioManager) {
      // Play a victory fanfare (using test beep for now)
      this.audioManager.playSound('test-beep', 0.8);
    }
    
    // Create victory particles
    if (this.particleSystem && this.currentBoss.transform) {
      this.createVictoryParticles(this.currentBoss.transform.position);
    }
    
    // Notify callbacks
    if (this.callbacks.onBossDefeat) {
      this.callbacks.onBossDefeat(this.currentBoss);
    }
    
    console.log(`Boss defeated: ${this.currentBoss.name}`);
    
    // Clear current boss after a delay
    setTimeout(() => {
      this.currentBoss = null;
    }, 3000);
  }
  
  private createVictoryParticles(position: Vector3): void {
    if (!this.particleSystem) return;
    
    // Create a burst of golden particles
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      
      this.particleSystem.emit('custom', {
        position: new (window as any).THREE.Vector3(position.x, position.y + 1, position.z),
        velocity: new (window as any).THREE.Vector3(
          Math.cos(angle) * speed,
          Math.random() * 10,
          Math.sin(angle) * speed
        ),
        color: new (window as any).THREE.Color(1, 0.8, 0), // Golden
        size: 0.5 + Math.random() * 0.5,
        lifetime: 2,
        gravity: true,
        fadeOut: true,
        shrink: true
      });
    }
  }
  
  onBossDamaged(boss: IBoss, damage: number): void {
    if (this.callbacks.onBossDamaged) {
      this.callbacks.onBossDamaged(boss, damage);
    }
    
    // Play hurt sound
    if (this.audioManager && boss.transform) {
      this.audioManager.playSound3D('zombie_groan_1', boss.transform.position, 0.8);
    }
  }
  
  getCurrentBoss(): IBoss | null {
    return this.currentBoss;
  }
  
  endBossFight(): void {
    if (this.currentBoss) {
      // Clean up boss fight
      if (this.audioManager) {
        this.audioManager.stopCategory('ambient');
      }
      
      this.currentBoss = null;
    }
  }
}