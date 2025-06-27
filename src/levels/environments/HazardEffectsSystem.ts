import * as THREE from 'three';
import { Entity } from '../../types';
import { HazardType } from './IHazard';

// STEP 36: Hazard effects and feedback system

export interface HazardEffect {
  type: HazardType;
  entityId: string;
  startTime: number;
  duration?: number;
  intensity: number;
}

export class HazardEffectsSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private activeEffects: Map<string, HazardEffect> = new Map();
  private screenOverlay: HTMLDivElement | null = null;
  private shakeIntensity: number = 0;
  private originalCameraPosition: THREE.Vector3;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.originalCameraPosition = camera.position.clone();
    
    this.createScreenOverlay();
  }
  
  private createScreenOverlay(): void {
    this.screenOverlay = document.createElement('div');
    this.screenOverlay.style.position = 'fixed';
    this.screenOverlay.style.top = '0';
    this.screenOverlay.style.left = '0';
    this.screenOverlay.style.width = '100%';
    this.screenOverlay.style.height = '100%';
    this.screenOverlay.style.pointerEvents = 'none';
    this.screenOverlay.style.zIndex = '999';
    this.screenOverlay.style.mixBlendMode = 'multiply';
    document.body.appendChild(this.screenOverlay);
  }
  
  applyHazardEffect(entity: Entity, hazardType: HazardType, intensity: number = 1): void {
    const effectKey = `${entity.id}_${hazardType}`;
    
    if (!this.activeEffects.has(effectKey)) {
      const effect: HazardEffect = {
        type: hazardType,
        entityId: entity.id,
        startTime: Date.now(),
        intensity
      };
      
      this.activeEffects.set(effectKey, effect);
      
      // Apply immediate effects
      switch (hazardType) {
        case 'damage':
          this.applyDamageEffect(entity, intensity);
          break;
        case 'instant_death':
          this.applyDeathEffect(entity);
          break;
        case 'slow':
          this.applySlowEffect(entity, intensity);
          break;
        case 'push':
          this.applyPushEffect(entity, intensity);
          break;
      }
    }
  }
  
  removeHazardEffect(entity: Entity, hazardType: HazardType): void {
    const effectKey = `${entity.id}_${hazardType}`;
    const effect = this.activeEffects.get(effectKey);
    
    if (effect) {
      this.cleanupEffect(effect);
      this.activeEffects.delete(effectKey);
    }
  }
  
  private applyDamageEffect(entity: Entity, intensity: number): void {
    // Screen shake for player damage
    if (entity.type === 'player') {
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity * 0.5);
      
      // Red flash overlay
      if (this.screenOverlay) {
        this.screenOverlay.style.backgroundColor = `rgba(255, 0, 0, ${intensity * 0.3})`;
        this.screenOverlay.style.transition = 'background-color 0.1s';
        
        setTimeout(() => {
          if (this.screenOverlay) {
            this.screenOverlay.style.backgroundColor = 'transparent';
          }
        }, 100);
      }
    }
    
    // Add damage particles
    this.createDamageParticles(entity);
  }
  
  private applyDeathEffect(entity: Entity): void {
    if (entity.type === 'player') {
      // Intense screen shake
      this.shakeIntensity = 2;
      
      // Black fade
      if (this.screenOverlay) {
        this.screenOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.screenOverlay.style.transition = 'background-color 0.5s';
      }
    }
  }
  
  private applySlowEffect(entity: Entity, intensity: number): void {
    if (entity.type === 'player') {
      // Blue tint overlay
      if (this.screenOverlay) {
        this.screenOverlay.style.backgroundColor = `rgba(100, 150, 255, ${intensity * 0.2})`;
      }
    }
    
    // Add slow effect particles
    this.createSlowParticles(entity);
  }
  
  private applyPushEffect(entity: Entity, intensity: number): void {
    if (entity.type === 'player') {
      // Slight screen shake in push direction
      this.shakeIntensity = Math.max(this.shakeIntensity, intensity * 0.3);
    }
    
    // Add wind/push particles
    this.createPushParticles(entity);
  }
  
  private createDamageParticles(entity: Entity): void {
    // Create particle effect at entity position
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = entity.transform.position.x + (Math.random() - 0.5);
      positions[i3 + 1] = entity.transform.position.y + Math.random() * 2;
      positions[i3 + 2] = entity.transform.position.z + (Math.random() - 0.5);
      
      // Red/orange colors
      colors[i3] = 1;
      colors[i3 + 1] = Math.random() * 0.5;
      colors[i3 + 2] = 0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    // Animate and remove
    this.animateParticles(particles, 1000);
  }
  
  private createSlowParticles(entity: Entity): void {
    // Create ice/frost particles
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.random() * 1.5;
      
      positions[i3] = entity.transform.position.x + Math.cos(angle) * radius;
      positions[i3 + 1] = entity.transform.position.y + Math.random() * 2;
      positions[i3 + 2] = entity.transform.position.z + Math.sin(angle) * radius;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    this.animateParticles(particles, 2000);
  }
  
  private createPushParticles(entity: Entity): void {
    // Create wind/force particles
    const particleCount = 25;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = entity.transform.position.x + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = entity.transform.position.y + Math.random() * 2;
      positions[i3 + 2] = entity.transform.position.z + (Math.random() - 0.5) * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xcccccc,
      transparent: true,
      opacity: 0.5
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    
    this.animateParticles(particles, 500);
  }
  
  private animateParticles(particles: THREE.Points, duration: number): void {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        particles.position.y += 0.02;
        (particles.material as THREE.PointsMaterial).opacity = 1 - progress;
        particles.scale.setScalar(1 + progress * 0.5);
        
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(particles);
        particles.geometry.dispose();
        (particles.material as THREE.Material).dispose();
      }
    };
    
    animate();
  }
  
  update(deltaTime: number): void {
    // Update camera shake
    if (this.shakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 0.1;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 0.1;
      
      this.camera.position.x = this.originalCameraPosition.x + shakeX;
      this.camera.position.y = this.originalCameraPosition.y + shakeY;
      
      // Decay shake
      this.shakeIntensity *= 0.9;
      if (this.shakeIntensity < 0.01) {
        this.shakeIntensity = 0;
        this.camera.position.copy(this.originalCameraPosition);
      }
    }
    
    // Update active effects
    const currentTime = Date.now();
    const effectsToRemove: string[] = [];
    
    this.activeEffects.forEach((effect, key) => {
      const elapsed = currentTime - effect.startTime;
      
      // Remove effects after duration
      if (effect.duration && elapsed > effect.duration) {
        effectsToRemove.push(key);
      }
    });
    
    effectsToRemove.forEach(key => {
      const effect = this.activeEffects.get(key)!;
      this.cleanupEffect(effect);
      this.activeEffects.delete(key);
    });
  }
  
  private cleanupEffect(effect: HazardEffect): void {
    // Clear screen overlay
    if (this.screenOverlay && effect.entityId.includes('player')) {
      this.screenOverlay.style.backgroundColor = 'transparent';
    }
  }
  
  cleanup(): void {
    if (this.screenOverlay && this.screenOverlay.parentNode) {
      this.screenOverlay.parentNode.removeChild(this.screenOverlay);
    }
    
    this.activeEffects.clear();
    this.shakeIntensity = 0;
    this.camera.position.copy(this.originalCameraPosition);
  }
}