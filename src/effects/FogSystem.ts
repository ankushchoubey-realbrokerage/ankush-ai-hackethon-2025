import * as THREE from 'three';
import { AudioManager } from '../core/audio/AudioManager';

export class FogSystem {
  private scene: THREE.Scene;
  private baseDensity: number = 0.02;
  private currentDensity: number = 0.02;
  private color: THREE.Color = new THREE.Color(0x4a5c4a);
  private enabled: boolean = false;
  private fogType: 'exponential' | 'linear' = 'exponential';
  
  // Lightning flash effect
  private isFlashing: boolean = false;
  private flashDuration: number = 0;
  private flashTimer: number = 0;
  private nextFlashTime: number = 0;
  private originalAmbientIntensity: number = 0;
  private audioManager: AudioManager | null = null;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  enable(density: number = 0.02, color: string = '#4a5c4a'): void {
    this.enabled = true;
    this.baseDensity = density;
    this.currentDensity = density;
    this.color = new THREE.Color(color);
    this.applyFog();
  }
  
  disable(): void {
    this.enabled = false;
    this.scene.fog = null;
  }
  
  private applyFog(): void {
    if (!this.enabled) return;
    
    if (this.fogType === 'exponential') {
      this.scene.fog = new THREE.FogExp2(this.color, this.currentDensity);
    } else {
      // Linear fog for more control
      const near = 5;
      const far = this.calculateFarDistance();
      this.scene.fog = new THREE.Fog(this.color, near, far);
    }
  }
  
  setVisibilityRange(near: number, far: number): void {
    this.fogType = 'linear';
    this.scene.fog = new THREE.Fog(this.color, near, far);
  }
  
  setDensity(density: number): void {
    this.currentDensity = density;
    this.applyFog();
  }
  
  private calculateFarDistance(): number {
    // Convert exponential density to approximate linear distance
    // Higher density = shorter visibility
    return Math.min(50, 1 / (this.currentDensity * 2));
  }
  
  // Dynamic fog effects
  pulse(minDensity: number, maxDensity: number, period: number, deltaTime: number): void {
    if (!this.enabled) return;
    
    const time = Date.now() / 1000;
    const wave = Math.sin(time * (2 * Math.PI) / period);
    const normalizedWave = (wave + 1) / 2; // 0 to 1
    
    this.currentDensity = minDensity + (maxDensity - minDensity) * normalizedWave;
    this.applyFog();
  }
  
  // Lightning flash effect that temporarily reveals more
  update(deltaTime: number, ambientLight?: THREE.Light): void {
    if (!this.enabled) return;
    
    // Schedule next lightning flash
    if (this.nextFlashTime <= 0) {
      this.nextFlashTime = 10 + Math.random() * 20; // 10-30 seconds between flashes
    }
    
    this.nextFlashTime -= deltaTime;
    
    if (this.nextFlashTime <= 0 && !this.isFlashing) {
      this.startLightningFlash(ambientLight);
    }
    
    // Handle ongoing flash
    if (this.isFlashing) {
      this.flashTimer += deltaTime;
      
      if (this.flashTimer < this.flashDuration) {
        // Flash effect
        const flashIntensity = Math.sin((this.flashTimer / this.flashDuration) * Math.PI);
        this.currentDensity = this.baseDensity * (1 - flashIntensity * 0.8);
        
        if (ambientLight) {
          ambientLight.intensity = this.originalAmbientIntensity + flashIntensity * 2;
        }
        
        this.applyFog();
      } else {
        // End flash
        this.isFlashing = false;
        this.currentDensity = this.baseDensity;
        if (ambientLight) {
          ambientLight.intensity = this.originalAmbientIntensity;
        }
        this.applyFog();
      }
    }
  }
  
  private startLightningFlash(ambientLight?: THREE.Light): void {
    this.isFlashing = true;
    this.flashDuration = 0.2 + Math.random() * 0.3; // 0.2-0.5 seconds
    this.flashTimer = 0;
    
    if (ambientLight) {
      this.originalAmbientIntensity = ambientLight.intensity;
    }
    
    // Play thunder sound with slight delay
    if (this.audioManager) {
      setTimeout(() => {
        this.audioManager?.playThunder();
      }, 200 + Math.random() * 300); // 200-500ms delay after flash
    }
  }
  
  // Get current visibility distance for AI/gameplay
  getVisibilityDistance(): number {
    if (!this.enabled) return Infinity;
    
    if (this.fogType === 'exponential') {
      return this.calculateFarDistance();
    } else if (this.scene.fog instanceof THREE.Fog) {
      return this.scene.fog.far;
    }
    
    return 50; // Default
  }
  
  // Check if a position is visible from another position
  isPositionVisible(from: THREE.Vector3, to: THREE.Vector3): boolean {
    if (!this.enabled) return true;
    
    const distance = from.distanceTo(to);
    const visibility = this.getVisibilityDistance();
    
    // Objects become less visible as they approach fog distance
    return distance < visibility * 0.8;
  }
  
  // Get fog color for UI/effects matching
  getFogColor(): string {
    return `#${this.color.getHexString()}`;
  }
}