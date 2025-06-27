import * as THREE from 'three';
import { Projectile } from '../../types';

export class ProjectileManager {
  private projectiles: Map<string, Projectile> = new Map();
  private scene: THREE.Scene | null = null;
  private projectileIdCounter: number = 0;

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  public createProjectile(projectile: Omit<Projectile, 'id'>): void {
    const id = `projectile_${this.projectileIdCounter++}`;
    const newProjectile: Projectile = {
      ...projectile,
      id
    };
    
    this.projectiles.set(id, newProjectile);
    
    // Add visual representation to scene
    // This will be implemented in later steps
  }

  public update(deltaTime: number): void {
    this.projectiles.forEach((projectile, id) => {
      // Update projectile position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.position.z += projectile.velocity.z * deltaTime;
      
      // Update lifetime
      projectile.lifetime -= deltaTime;
      
      // Remove if lifetime expired or out of bounds
      if (projectile.lifetime <= 0 || this.isOutOfBounds(projectile)) {
        this.removeProjectile(id);
      }
    });
  }

  private isOutOfBounds(projectile: Projectile): boolean {
    const maxDistance = 50;
    const distance = Math.sqrt(
      projectile.position.x ** 2 + 
      projectile.position.z ** 2
    );
    return distance > maxDistance;
  }

  private removeProjectile(projectileId: string): void {
    this.projectiles.delete(projectileId);
    // Remove from scene
    // This will be implemented when we add visual representation
  }

  public getProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values());
  }

  public clear(): void {
    this.projectiles.forEach((projectile, id) => {
      this.removeProjectile(id);
    });
  }
}