import * as THREE from 'three';
import { Projectile } from './Projectile';
import { Vector3 } from '../../types';

export class ProjectileManager {
  private projectiles: Map<string, Projectile> = new Map();
  private scene: THREE.Scene | null = null;
  private physicsEngine: any = null;
  private particleSystem: any = null;
  private maxProjectiles: number = 100; // Limit for performance

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  public setPhysicsEngine(physicsEngine: any): void {
    this.physicsEngine = physicsEngine;
  }
  
  public setParticleSystem(particleSystem: any): void {
    this.particleSystem = particleSystem;
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
  
  public getProjectileCount(): number {
    return this.projectiles.size;
  }
}