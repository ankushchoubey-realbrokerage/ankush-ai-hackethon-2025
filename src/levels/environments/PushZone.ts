import { Entity, MovableEntity, Vector3 } from '../../types';
import { HazardZone } from './HazardZone';
import * as THREE from 'three';

// STEP 36: Push zone implementation (wind, geysers, conveyor belts)

export class PushZone extends HazardZone {
  private pushForce: Vector3;
  private pushType: 'wind' | 'geyser' | 'conveyor' | 'fan';
  private visualMesh: THREE.Mesh | null = null;
  private particleSystem: THREE.Points | null = null;
  private scene: THREE.Scene | null = null;
  private allEntities: Entity[] = [];
  private isIntermittent: boolean = false;
  private intermittentCycle: number = 3000; // milliseconds
  private lastActivationTime: number = 0;
  
  constructor(
    id: string,
    position: Vector3,
    dimensions: Vector3,
    pushForce: Vector3,
    pushType: 'wind' | 'geyser' | 'conveyor' | 'fan' = 'wind'
  ) {
    super(id, 'push', position, dimensions);
    this.pushForce = pushForce;
    this.pushType = pushType;
    this.isIntermittent = pushType === 'geyser';
  }
  
  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    this.createVisualIndicator();
    this.createParticleEffects();
  }
  
  private createVisualIndicator(): void {
    if (!this.scene) return;
    
    switch (this.pushType) {
      case 'conveyor':
        // Create conveyor belt visual
        const conveyorGeometry = new THREE.BoxGeometry(
          this.bounds.max.x - this.bounds.min.x,
          0.1,
          this.bounds.max.z - this.bounds.min.z
        );
        const conveyorMaterial = new THREE.MeshStandardMaterial({
          color: 0x444444,
          metalness: 0.3,
          roughness: 0.6
        });
        this.visualMesh = new THREE.Mesh(conveyorGeometry, conveyorMaterial);
        this.visualMesh.position.copy(this.position as THREE.Vector3);
        this.scene.add(this.visualMesh);
        break;
        
      case 'geyser':
        // Create geyser hole visual
        const geyserGeometry = new THREE.CylinderGeometry(1, 1.2, 0.5, 16);
        const geyserMaterial = new THREE.MeshStandardMaterial({
          color: 0x666666,
          roughness: 0.8
        });
        this.visualMesh = new THREE.Mesh(geyserGeometry, geyserMaterial);
        this.visualMesh.position.copy(this.position as THREE.Vector3);
        this.scene.add(this.visualMesh);
        break;
    }
  }
  
  private createParticleEffects(): void {
    if (!this.scene) return;
    
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    // Initialize particles based on push type
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      switch (this.pushType) {
        case 'wind':
        case 'fan':
          // Particles flow in push direction
          positions[i3] = this.bounds.min.x + Math.random() * (this.bounds.max.x - this.bounds.min.x);
          positions[i3 + 1] = this.bounds.min.y + Math.random() * (this.bounds.max.y - this.bounds.min.y);
          positions[i3 + 2] = this.bounds.min.z + Math.random() * (this.bounds.max.z - this.bounds.min.z);
          
          velocities[i3] = this.pushForce.x * 0.1;
          velocities[i3 + 1] = this.pushForce.y * 0.1;
          velocities[i3 + 2] = this.pushForce.z * 0.1;
          break;
          
        case 'geyser':
          // Particles shoot upward from center
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 0.5;
          positions[i3] = this.position.x + Math.cos(angle) * radius;
          positions[i3 + 1] = this.position.y;
          positions[i3 + 2] = this.position.z + Math.sin(angle) * radius;
          
          velocities[i3] = (Math.random() - 0.5) * 0.2;
          velocities[i3 + 1] = Math.random() * 0.5 + 0.5;
          velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
          break;
      }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
      color: this.pushType === 'geyser' ? 0x87ceeb : 0xcccccc,
      size: 0.2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
    
    // Animate particles
    this.animateParticles();
  }
  
  private animateParticles(): void {
    if (!this.particleSystem) return;
    
    const animate = () => {
      if (!this.particleSystem || !this.active) return;
      
      const positions = this.particleSystem.geometry.getAttribute('position') as THREE.BufferAttribute;
      const velocities = this.particleSystem.geometry.getAttribute('velocity') as THREE.BufferAttribute;
      
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        
        // Update positions
        positions.array[i3] += velocities.array[i3];
        positions.array[i3 + 1] += velocities.array[i3 + 1];
        positions.array[i3 + 2] += velocities.array[i3 + 2];
        
        // Reset particles that leave the zone
        const x = positions.array[i3];
        const y = positions.array[i3 + 1];
        const z = positions.array[i3 + 2];
        
        if (x < this.bounds.min.x || x > this.bounds.max.x ||
            y < this.bounds.min.y || y > this.bounds.max.y + 5 ||
            z < this.bounds.min.z || z > this.bounds.max.z) {
          
          // Reset to starting position
          switch (this.pushType) {
            case 'wind':
            case 'fan':
              positions.array[i3] = this.bounds.min.x;
              positions.array[i3 + 1] = this.bounds.min.y + Math.random() * (this.bounds.max.y - this.bounds.min.y);
              positions.array[i3 + 2] = this.bounds.min.z + Math.random() * (this.bounds.max.z - this.bounds.min.z);
              break;
              
            case 'geyser':
              const angle = Math.random() * Math.PI * 2;
              const radius = Math.random() * 0.5;
              positions.array[i3] = this.position.x + Math.cos(angle) * radius;
              positions.array[i3 + 1] = this.position.y;
              positions.array[i3 + 2] = this.position.z + Math.sin(angle) * radius;
              break;
          }
        }
      }
      
      positions.needsUpdate = true;
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  setEntities(entities: Entity[]): void {
    this.allEntities = entities;
  }
  
  protected getCurrentEntitiesInZone(): Entity[] {
    return this.allEntities.filter(entity => this.checkCollision(entity));
  }
  
  private isCurrentlyActive(): boolean {
    if (!this.isIntermittent) return true;
    
    const currentTime = Date.now();
    const cycleTime = currentTime % this.intermittentCycle;
    return cycleTime < this.intermittentCycle / 2; // Active for half the cycle
  }
  
  onEnter(entity: Entity): void {
    console.log(`Entity ${entity.id} entered ${this.pushType} zone`);
  }
  
  onStay(entity: Entity, deltaTime: number): void {
    if (!this.isCurrentlyActive()) return;
    
    if ('velocity' in entity) {
      const movableEntity = entity as MovableEntity;
      
      // Apply push force
      movableEntity.velocity.x += this.pushForce.x * deltaTime;
      movableEntity.velocity.y += this.pushForce.y * deltaTime;
      movableEntity.velocity.z += this.pushForce.z * deltaTime;
      
      // Clamp velocity to prevent excessive speeds
      const maxVelocity = 20;
      const velocity = movableEntity.velocity;
      const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
      if (speed > maxVelocity) {
        const scale = maxVelocity / speed;
        velocity.x *= scale;
        velocity.y *= scale;
        velocity.z *= scale;
      }
    }
  }
  
  onExit(entity: Entity): void {
    console.log(`Entity ${entity.id} left ${this.pushType} zone`);
  }
  
  getVisualIndicator(): { color: number; intensity: number } {
    switch (this.pushType) {
      case 'wind':
        return { color: 0xaaaaaa, intensity: 0.3 };
      case 'geyser':
        return { color: 0x4169e1, intensity: 0.7 };
      case 'conveyor':
        return { color: 0x666666, intensity: 0.4 };
      case 'fan':
        return { color: 0x888888, intensity: 0.5 };
    }
  }
  
  cleanup(): void {
    super.cleanup();
    
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