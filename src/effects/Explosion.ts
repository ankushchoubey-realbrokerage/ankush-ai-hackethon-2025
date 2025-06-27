import * as THREE from 'three';
import { Vector3, DamagableEntity, Entity } from '../types';
import { AudioManager } from '../core/audio/AudioManager';

// STEP 37: Explosion System Implementation

export interface ExplosionOptions {
  position: Vector3;
  radius: number;
  damage: number;
  knockbackForce?: number;
  ownerId?: string;
  damageOwner?: boolean;
  scene: THREE.Scene;
  audioManager?: AudioManager;
  cameraPosition?: Vector3;
  onScreenShake?: (intensity: number) => void;
}

export class Explosion {
  private static explosions: Map<string, ExplosionInstance> = new Map();
  private static entities: DamagableEntity[] = [];
  
  static setEntities(entities: DamagableEntity[]): void {
    this.entities = entities;
  }
  
  static create(options: ExplosionOptions): void {
    const explosion = new ExplosionInstance(options);
    this.explosions.set(explosion.id, explosion);
    explosion.detonate();
    
    // Apply area damage immediately
    if (this.entities.length > 0) {
      this.applyAreaDamage(
        options.position,
        options.radius,
        options.damage,
        this.entities,
        options.ownerId,
        options.damageOwner || false
      );
    }
  }
  
  static update(deltaTime: number): void {
    const toRemove: string[] = [];
    
    this.explosions.forEach((explosion, id) => {
      explosion.update(deltaTime);
      if (explosion.isComplete()) {
        toRemove.push(id);
      }
    });
    
    toRemove.forEach(id => {
      const explosion = this.explosions.get(id);
      if (explosion) {
        explosion.cleanup();
        this.explosions.delete(id);
      }
    });
  }
  
  static applyAreaDamage(
    position: Vector3,
    radius: number,
    damage: number,
    entities: DamagableEntity[],
    ownerId?: string,
    damageOwner: boolean = false
  ): void {
    entities.forEach(entity => {
      // Skip owner if damageOwner is false
      if (!damageOwner && ownerId && entity.id === ownerId) {
        return;
      }
      
      // Calculate distance from explosion center
      const dx = entity.transform.position.x - position.x;
      const dy = entity.transform.position.y - position.y;
      const dz = entity.transform.position.z - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance <= radius) {
        // Calculate damage with falloff
        const damageAmount = this.calculateDamageWithFalloff(damage, distance, radius);
        
        if (damageAmount > 0) {
          // Apply damage
          const oldHealth = entity.health;
          entity.health -= damageAmount;
          
          if (entity.health <= 0) {
            entity.health = 0;
            entity.isDead = true;
          }
          
          console.log(`Explosion damaged ${entity.type} ${entity.id}: ${oldHealth} - ${damageAmount} = ${entity.health}`);
          
          // Apply knockback if entity has velocity
          if ('velocity' in entity && distance > 0) {
            const knockbackForce = 10 * (1 - distance / radius);
            const dirX = dx / distance;
            const dirY = dy / distance;
            const dirZ = dz / distance;
            
            (entity as any).velocity.x += dirX * knockbackForce;
            (entity as any).velocity.y += dirY * knockbackForce + 5; // Extra upward force
            (entity as any).velocity.z += dirZ * knockbackForce;
          }
        }
      }
    });
  }
  
  private static calculateDamageWithFalloff(
    baseDamage: number,
    distance: number,
    radius: number
  ): number {
    if (distance <= 0) {
      return baseDamage; // Direct hit
    }
    
    if (distance >= radius) {
      return 0; // Outside radius
    }
    
    // Quadratic falloff for more realistic explosion damage
    const falloff = Math.pow(1 - (distance / radius), 2);
    const minDamagePercent = 0.3; // Minimum 30% damage at edge
    const damagePercent = minDamagePercent + (1 - minDamagePercent) * falloff;
    
    return Math.floor(baseDamage * damagePercent);
  }
}

class ExplosionInstance {
  public id: string;
  private options: ExplosionOptions;
  private particles: THREE.Mesh[] = [];
  private shockwaveMesh: THREE.Mesh | null = null;
  private flashLight: THREE.PointLight | null = null;
  private lifetime: number = 0;
  private maxLifetime: number = 2; // 2 seconds
  
  constructor(options: ExplosionOptions) {
    this.id = `explosion-${Date.now()}-${Math.random()}`;
    this.options = options;
  }
  
  detonate(): void {
    // Create visual effects
    this.createExplosionParticles();
    this.createShockwave();
    this.createFlash();
    
    // Play sound
    if (this.options.audioManager) {
      this.options.audioManager.playSound3D('explosion', this.options.position, 1.0);
    }
    
    // Screen shake for nearby explosions
    if (this.options.cameraPosition && this.options.onScreenShake) {
      const dx = this.options.position.x - this.options.cameraPosition.x;
      const dy = this.options.position.y - this.options.cameraPosition.y;
      const dz = this.options.position.z - this.options.cameraPosition.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      const maxShakeDistance = 20;
      if (distance < maxShakeDistance) {
        const intensity = (1 - distance / maxShakeDistance) * 2;
        this.options.onScreenShake(intensity);
      }
    }
  }
  
  private createExplosionParticles(): void {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const size = 0.2 + Math.random() * 0.3;
      const geometry = new THREE.SphereGeometry(size, 6, 6);
      
      // Mix of orange and red particles
      const color = Math.random() > 0.5 ? 0xff4400 : 0xff8800;
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1
      });
      
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(this.options.position as THREE.Vector3);
      
      // Random velocity in all directions
      const speed = 5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      (particle as any).velocity = {
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.cos(phi) * speed,
        z: Math.sin(phi) * Math.sin(theta) * speed
      };
      
      this.options.scene.add(particle);
      this.particles.push(particle);
    }
    
    // Add smoke particles
    for (let i = 0; i < 20; i++) {
      const size = 0.5 + Math.random() * 0.5;
      const geometry = new THREE.SphereGeometry(size, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.6
      });
      
      const smoke = new THREE.Mesh(geometry, material);
      smoke.position.copy(this.options.position as THREE.Vector3);
      smoke.position.x += (Math.random() - 0.5) * 2;
      smoke.position.y += Math.random() * 1;
      smoke.position.z += (Math.random() - 0.5) * 2;
      
      (smoke as any).velocity = {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 3 + 1,
        z: (Math.random() - 0.5) * 2
      };
      (smoke as any).isSmoke = true;
      
      this.options.scene.add(smoke);
      this.particles.push(smoke);
    }
  }
  
  private createShockwave(): void {
    const geometry = new THREE.RingGeometry(0.1, 0.5, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    this.shockwaveMesh = new THREE.Mesh(geometry, material);
    this.shockwaveMesh.position.copy(this.options.position as THREE.Vector3);
    this.shockwaveMesh.rotation.x = -Math.PI / 2;
    
    this.options.scene.add(this.shockwaveMesh);
  }
  
  private createFlash(): void {
    this.flashLight = new THREE.PointLight(0xffaa00, 10, this.options.radius * 2);
    this.flashLight.position.copy(this.options.position as THREE.Vector3);
    this.options.scene.add(this.flashLight);
  }
  
  update(deltaTime: number): void {
    this.lifetime += deltaTime;
    
    // Update particles
    this.particles.forEach((particle, index) => {
      const velocity = (particle as any).velocity;
      if (velocity) {
        particle.position.x += velocity.x * deltaTime;
        particle.position.y += velocity.y * deltaTime;
        particle.position.z += velocity.z * deltaTime;
        
        // Apply gravity
        velocity.y -= 9.8 * deltaTime;
        
        // Fade out
        const material = particle.material as THREE.MeshBasicMaterial;
        if ((particle as any).isSmoke) {
          material.opacity -= deltaTime * 0.5;
          particle.scale.addScalar(deltaTime * 2);
        } else {
          material.opacity -= deltaTime * 2;
        }
      }
    });
    
    // Update shockwave
    if (this.shockwaveMesh) {
      const scale = 1 + this.lifetime * this.options.radius * 2;
      this.shockwaveMesh.scale.set(scale, scale, 1);
      
      const material = this.shockwaveMesh.material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.8 - this.lifetime * 2);
    }
    
    // Update flash
    if (this.flashLight) {
      this.flashLight.intensity = Math.max(0, 10 - this.lifetime * 20);
    }
  }
  
  isComplete(): boolean {
    return this.lifetime >= this.maxLifetime;
  }
  
  cleanup(): void {
    // Remove particles
    this.particles.forEach(particle => {
      this.options.scene.remove(particle);
      particle.geometry.dispose();
      (particle.material as THREE.Material).dispose();
    });
    
    // Remove shockwave
    if (this.shockwaveMesh) {
      this.options.scene.remove(this.shockwaveMesh);
      this.shockwaveMesh.geometry.dispose();
      (this.shockwaveMesh.material as THREE.Material).dispose();
    }
    
    // Remove flash
    if (this.flashLight) {
      this.options.scene.remove(this.flashLight);
    }
  }
}