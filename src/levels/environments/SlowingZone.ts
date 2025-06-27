import { Entity, MovableEntity, Vector3 } from '../../types';
import { HazardZone } from './HazardZone';
import { HazardEntityState } from './IHazard';
import * as THREE from 'three';

// STEP 36: Slowing zone implementation (mud, tar, ice)

interface SlowingEntityState extends HazardEntityState {
  originalSpeed?: number;
}

export class SlowingZone extends HazardZone {
  private slowFactor: number;
  private slowType: 'mud' | 'tar' | 'ice' | 'quicksand';
  private visualMesh: THREE.Mesh | null = null;
  private particleSystem: THREE.Points | null = null;
  private scene: THREE.Scene | null = null;
  private allEntities: Entity[] = [];
  
  constructor(
    id: string,
    position: Vector3,
    dimensions: Vector3,
    slowFactor: number = 0.5, // 0.5 = 50% speed
    slowType: 'mud' | 'tar' | 'ice' | 'quicksand' = 'mud'
  ) {
    super(id, 'slow', position, dimensions);
    this.slowFactor = Math.max(0.1, Math.min(1, slowFactor)); // Clamp between 10% and 100%
    this.slowType = slowType;
  }
  
  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    this.createVisualIndicator();
    this.createParticleEffects();
  }
  
  private createVisualIndicator(): void {
    if (!this.scene) return;
    
    const geometry = new THREE.BoxGeometry(
      this.bounds.max.x - this.bounds.min.x,
      0.2, // Shallow surface
      this.bounds.max.z - this.bounds.min.z
    );
    
    const materialProps = this.getMaterialProperties();
    const material = new THREE.MeshStandardMaterial(materialProps);
    
    this.visualMesh = new THREE.Mesh(geometry, material);
    this.visualMesh.position.set(
      this.position.x,
      this.bounds.min.y,
      this.position.z
    );
    this.scene.add(this.visualMesh);
  }
  
  private getMaterialProperties(): THREE.MeshStandardMaterialParameters {
    switch (this.slowType) {
      case 'mud':
        return {
          color: 0x4a3319,
          roughness: 0.9,
          metalness: 0,
          transparent: true,
          opacity: 0.8
        };
      case 'tar':
        return {
          color: 0x0a0a0a,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0.9
        };
      case 'ice':
        return {
          color: 0x87ceeb,
          roughness: 0.1,
          metalness: 0.5,
          transparent: true,
          opacity: 0.7
        };
      case 'quicksand':
        return {
          color: 0xc2b280,
          roughness: 0.8,
          metalness: 0,
          transparent: true,
          opacity: 0.85
        };
    }
  }
  
  private createParticleEffects(): void {
    if (!this.scene || this.slowType !== 'ice') return;
    
    // Create sparkle effects for ice
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = this.bounds.min.x + Math.random() * (this.bounds.max.x - this.bounds.min.x);
      positions[i3 + 1] = this.bounds.min.y + 0.1;
      positions[i3 + 2] = this.bounds.min.z + Math.random() * (this.bounds.max.z - this.bounds.min.z);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }
  
  setEntities(entities: Entity[]): void {
    this.allEntities = entities;
  }
  
  protected getCurrentEntitiesInZone(): Entity[] {
    return this.allEntities.filter(entity => this.checkCollision(entity));
  }
  
  onEnter(entity: Entity): void {
    if ('speed' in entity) {
      const movableEntity = entity as MovableEntity;
      const state = this.entitiesInZone.get(entity.id) as SlowingEntityState;
      if (state) {
        state.originalSpeed = movableEntity.speed;
      }
      movableEntity.speed *= this.slowFactor;
      console.log(`Entity ${entity.id} entered ${this.slowType} zone, speed reduced to ${movableEntity.speed}`);
    }
  }
  
  onStay(entity: Entity, deltaTime: number): void {
    // For quicksand, gradually slow down more
    if (this.slowType === 'quicksand' && 'speed' in entity) {
      const movableEntity = entity as MovableEntity;
      const state = this.entitiesInZone.get(entity.id) as SlowingEntityState;
      if (state && state.originalSpeed) {
        const timeInZone = (Date.now() - state.timeEntered) / 1000;
        const dynamicSlowFactor = Math.max(0.1, this.slowFactor - (timeInZone * 0.05));
        movableEntity.speed = state.originalSpeed * dynamicSlowFactor;
      }
    }
  }
  
  onExit(entity: Entity): void {
    if ('speed' in entity) {
      const movableEntity = entity as MovableEntity;
      const state = this.entitiesInZone.get(entity.id) as SlowingEntityState;
      if (state && state.originalSpeed) {
        movableEntity.speed = state.originalSpeed;
        console.log(`Entity ${entity.id} left ${this.slowType} zone, speed restored to ${movableEntity.speed}`);
      }
    }
  }
  
  getVisualIndicator(): { color: number; intensity: number } {
    switch (this.slowType) {
      case 'mud':
        return { color: 0x4a3319, intensity: 0.3 };
      case 'tar':
        return { color: 0x0a0a0a, intensity: 0.4 };
      case 'ice':
        return { color: 0x87ceeb, intensity: 0.6 };
      case 'quicksand':
        return { color: 0xc2b280, intensity: 0.5 };
    }
  }
  
  cleanup(): void {
    super.cleanup();
    
    // Restore original speeds for any entities still in zone
    this.entitiesInZone.forEach((state, entityId) => {
      const entity = this.allEntities.find(e => e.id === entityId);
      if (entity && 'speed' in entity && (state as SlowingEntityState).originalSpeed) {
        (entity as MovableEntity).speed = (state as SlowingEntityState).originalSpeed!;
      }
    });
    
    if (this.scene) {
      if (this.visualMesh) {
        this.scene.remove(this.visualMesh);
        this.visualMesh.geometry.dispose();
        (this.visualMesh.material as THREE.Material).dispose();
      }
      
      if (this.particleSystem) {
        this.scene.remove(this.particleSystem);
        this.particleSystem.geometry.dispose();
        (this.particleSystem.material as THREE.Material).dispose();
      }
    }
  }
}