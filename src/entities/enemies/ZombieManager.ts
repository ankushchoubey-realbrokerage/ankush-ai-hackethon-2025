import * as THREE from 'three';
import { Zombie, Vector3 } from '../../types';

export class ZombieManager {
  private zombies: Map<string, Zombie> = new Map();
  private scene: THREE.Scene | null = null;
  private zombieIdCounter: number = 0;

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  public spawnZombie(position: Vector3, type: Zombie['zombieType'] = 'basic'): void {
    // This will be implemented in later steps
  }

  public update(deltaTime: number, playerPosition: Vector3): void {
    this.zombies.forEach(zombie => {
      // Update zombie AI and movement
      // This will be implemented in later steps
    });
  }

  public removeZombie(zombieId: string): void {
    const zombie = this.zombies.get(zombieId);
    if (zombie && this.scene) {
      // Remove from scene
      this.zombies.delete(zombieId);
    }
  }

  public getZombies(): Zombie[] {
    return Array.from(this.zombies.values());
  }

  public clear(): void {
    this.zombies.forEach((zombie, id) => {
      this.removeZombie(id);
    });
  }
}