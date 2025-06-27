import * as THREE from 'three';
import { Vector3, ZombieType } from '../../types';
import { Zombie } from './Zombie';
import { FastZombie } from './FastZombie';
import { AudioManager } from '../../core/audio/AudioManager';

export class ZombieManager {
  private zombies: Map<string, Zombie> = new Map();
  private scene: THREE.Scene | null = null;
  private physicsEngine: any = null;
  private audioManager: AudioManager | null = null; // STEP 28: Audio manager reference
  private particleSystem: any = null;

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  public setPhysicsEngine(physicsEngine: any): void {
    this.physicsEngine = physicsEngine;
  }
  
  public setParticleSystem(particleSystem: any): void {
    this.particleSystem = particleSystem;
  }
  
  public getZombie(id: string): Zombie | undefined {
    return this.zombies.get(id);
  }

  // STEP 28: Set audio manager reference
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }

  public spawnZombie(position: Vector3, zombieType: ZombieType | 'normal' | 'fast' = 'basic'): void {
    if (!this.scene) return;
    
    // Create zombie based on type
    let zombie: Zombie;
    if (zombieType === 'fast') {
      zombie = new FastZombie(position);
    } else if (zombieType === 'normal') {
      // Map 'normal' to 'basic' for compatibility
      zombie = new Zombie(position, 'basic');
    } else {
      zombie = new Zombie(position, zombieType as ZombieType);
    }
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
        console.log(`[ZombieManager.update] Found dead zombie ${zombie.id}, marking for removal`);
        toRemove.push(zombie.id);
      }
    });
    
    // Remove dead zombies
    toRemove.forEach(id => this.removeZombie(id));
  }

  public removeZombie(zombieId: string): void {
    console.log(`[ZombieManager.removeZombie] Removing zombie ${zombieId}`);
    const zombie = this.zombies.get(zombieId);
    if (zombie) {
      console.log(`[ZombieManager.removeZombie] Zombie found, isDead=${zombie.isDead}`);
      // STEP 18: Add death effect before removing
      if (zombie.isDead && this.scene) {
        this.createDeathEffect(zombie.getPosition());
      }
      
      if (this.scene) {
        this.scene.remove(zombie.getMesh());
      }
      if (this.physicsEngine) {
        this.physicsEngine.removeEntity(zombie.id);
      }
    }
    this.zombies.delete(zombieId);
  }
  
  private createDeathEffect(position: Vector3): void {
    if (!this.scene) return;
    
    // Create a simple death effect (red particles)
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Random position around death location
      particle.position.set(
        position.x + (Math.random() - 0.5) * 0.5,
        position.y + Math.random() * 0.5,
        position.z + (Math.random() - 0.5) * 0.5
      );
      
      this.scene.add(particle);
      
      // Animate particle
      const startTime = Date.now();
      const velocityY = Math.random() * 2 + 1;
      const velocityX = (Math.random() - 0.5) * 2;
      const velocityZ = (Math.random() - 0.5) * 2;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 1000; // 1 second duration
        
        if (progress < 1) {
          particle.position.x += velocityX * 0.016;
          particle.position.y += (velocityY - 5 * progress) * 0.016; // Gravity
          particle.position.z += velocityZ * 0.016;
          
          particleMaterial.opacity = 1 - progress;
          particle.scale.setScalar(1 - progress * 0.5);
          
          requestAnimationFrame(animate);
        } else {
          this.scene?.remove(particle);
        }
      };
      
      animate();
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
  
  // STEP 31: Alias for level system compatibility
  public clearAllZombies(): void {
    this.clear();
  }
}