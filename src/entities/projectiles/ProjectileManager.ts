import * as THREE from 'three';
import { Projectile } from './Projectile';
import { Rocket } from './Rocket';
import { Vector3 } from '../../types';
import { Explosion } from '../../effects/Explosion';
import { AudioManager } from '../../core/audio/AudioManager';

export class ProjectileManager {
  private projectiles: Map<string, Projectile | Rocket> = new Map();
  private scene: THREE.Scene | null = null;
  private physicsEngine: any = null;
  private particleSystem: any = null;
  private audioManager: AudioManager | null = null;
  private maxProjectiles: number = 100; // Limit for performance
  private cameraPosition: Vector3 | null = null;
  private onScreenShake: ((intensity: number) => void) | null = null;

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  public setPhysicsEngine(physicsEngine: any): void {
    this.physicsEngine = physicsEngine;
  }
  
  public setParticleSystem(particleSystem: any): void {
    this.particleSystem = particleSystem;
  }
  
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  public setCameraInfo(cameraPosition: Vector3, onScreenShake: (intensity: number) => void): void {
    this.cameraPosition = cameraPosition;
    this.onScreenShake = onScreenShake;
  }

  public createProjectile(
    position: Vector3,
    direction: Vector3,
    damage: number,
    projectileSpeed: number,
    ownerId: string
  ): void {
    if (!this.scene) return;
    
    // Limit projectiles for performance
    if (this.projectiles.size >= this.maxProjectiles) {
      // Remove oldest projectile
      const oldestId = this.projectiles.keys().next().value;
      if (oldestId) {
        this.removeProjectile(oldestId);
      }
    }
    
    const projectile = new Projectile(
      position,
      direction,
      damage,
      projectileSpeed,
      ownerId
    );
    
    this.projectiles.set(projectile.id, projectile);
    this.scene.add(projectile.getMesh());
    
    // Register with physics engine
    if (this.physicsEngine) {
      this.physicsEngine.addEntity(projectile);
    }
  }
  
  // STEP 37: Create rocket projectile
  public createRocket(
    position: Vector3,
    direction: Vector3,
    damage: number,
    projectileSpeed: number,
    ownerId: string,
    explosionRadius: number = 5,
    splashDamage: number = 75
  ): void {
    if (!this.scene) return;
    
    // Limit projectiles for performance
    if (this.projectiles.size >= this.maxProjectiles) {
      const oldestId = this.projectiles.keys().next().value;
      if (oldestId) {
        this.removeProjectile(oldestId);
      }
    }
    
    const rocket = new Rocket(
      position,
      direction,
      damage,
      projectileSpeed,
      ownerId,
      explosionRadius,
      splashDamage
    );
    
    rocket.setScene(this.scene);
    
    this.projectiles.set(rocket.id, rocket);
    this.scene.add(rocket.getMesh());
    
    // Register with physics engine
    if (this.physicsEngine) {
      this.physicsEngine.addEntity(rocket);
    }
  }

  public update(deltaTime: number): void {
    const toRemove: string[] = [];
    
    this.projectiles.forEach((projectile) => {
      projectile.update(deltaTime);
      
      // Remove if inactive or out of bounds
      if (!projectile.active || this.isOutOfBounds(projectile)) {
        toRemove.push(projectile.id);
      }
    });
    
    // Remove inactive projectiles
    toRemove.forEach(id => this.removeProjectile(id));
  }

  private isOutOfBounds(projectile: Projectile): boolean {
    const maxDistance = 100; // Increased from 50 for longer range
    const pos = projectile.transform.position;
    const distance = Math.sqrt(pos.x ** 2 + pos.z ** 2);
    return distance > maxDistance;
  }

  private removeProjectile(projectileId: string): void {
    const projectile = this.projectiles.get(projectileId);
    if (projectile) {
      // STEP 37: Handle rocket explosion on removal
      if ('projectileType' in projectile && (projectile as any).projectileType === 'rocket') {
        const rocket = projectile as Rocket;
        if (this.scene && this.audioManager) {
          // Create explosion at rocket position
          Explosion.create({
            position: rocket.transform.position,
            radius: rocket.explosionRadius,
            damage: rocket.splashDamage,
            ownerId: rocket.ownerId,
            damageOwner: true, // Rockets can damage the player who fired them
            scene: this.scene,
            audioManager: this.audioManager,
            cameraPosition: this.cameraPosition || undefined,
            onScreenShake: this.onScreenShake || undefined
          });
        }
      }
      
      if (this.scene) {
        this.scene.remove(projectile.getMesh());
      }
      if (this.physicsEngine) {
        this.physicsEngine.removeEntity(projectile.id);
      }
      projectile.destroy();
    }
    this.projectiles.delete(projectileId);
  }

  public getProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values());
  }

  public clear(): void {
    this.projectiles.forEach((projectile) => {
      this.removeProjectile(projectile.id);
    });
  }
  
  // STEP 31: Alias for level system compatibility
  public clearAllProjectiles(): void {
    this.clear();
  }
  
  public getProjectileCount(): number {
    return this.projectiles.size;
  }
}