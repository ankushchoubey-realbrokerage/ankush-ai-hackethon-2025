import * as THREE from 'three';
import { Vector3 } from '../../types';
import { Zombie } from './Zombie';
import { AudioManager } from '../../core/audio/AudioManager';

export class ZombieManager {
  private zombies: Map<string, Zombie> = new Map();
  private scene: THREE.Scene | null = null;
  private physicsEngine: any = null;
  private audioManager: AudioManager | null = null; // STEP 28: Audio manager reference

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  public setPhysicsEngine(physicsEngine: any): void {
    this.physicsEngine = physicsEngine;
  }

  // STEP 28: Set audio manager reference
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }

  public spawnZombie(position: Vector3): void {
    if (!this.scene) return;
    
    const zombie = new Zombie(position);
    this.zombies.set(zombie.id, zombie);
    
    // STEP 28: Pass audio manager to zombie
    if (this.audioManager) {
      zombie.setAudioManager(this.audioManager);
    }
    
    // Add to scene
    this.scene.add(zombie.getMesh());
    
    // Register with physics engine
    if (this.physicsEngine) {
      this.physicsEngine.addEntity(zombie);
    }
  }

  public update(deltaTime: number, playerPosition: Vector3): void {
    const toRemove: string[] = [];
    
    this.zombies.forEach(zombie => {
      // Update zombie AI and movement
      zombie.update(deltaTime, playerPosition);
      
      // Mark dead zombies for removal
      if (zombie.isDead) {
        toRemove.push(zombie.id);
      }
    });
    
    // Remove dead zombies
    toRemove.forEach(id => this.removeZombie(id));
  }

  public removeZombie(zombieId: string): void {
    const zombie = this.zombies.get(zombieId);
    if (zombie) {
      if (this.scene) {
        this.scene.remove(zombie.getMesh());
      }
      if (this.physicsEngine) {
        this.physicsEngine.removeEntity(zombie.id);
      }
    }
    this.zombies.delete(zombieId);
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