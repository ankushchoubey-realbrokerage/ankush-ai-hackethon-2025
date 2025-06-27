import * as THREE from 'three';
import { Vector3 } from '../../types';
import { Zombie } from './Zombie';

/**
 * FastZombie - A faster but weaker variant of the basic zombie
 * - 1.5x movement speed (3 vs 2)
 * - 75% health (75 HP vs 100 HP)
 * - Distinct visual appearance (red-tinted, smaller, with particle effects)
 */
export class FastZombie extends Zombie {
  private speedTrailParticles: THREE.Points | null = null;
  private particleTime: number = 0;
  
  constructor(position: Vector3) {
    super(position);
    
    // Override base zombie properties
    this.subType = 'fast' as any; // Fast zombie subtype
    this.speed = 3; // 1.5x normal zombie speed (2)
    this.health = 1;  // Dies in one hit
    this.maxHealth = 1;
    
    // Modify appearance
    this.applyFastZombieAppearance();
    
    // Create speed particle trail effect
    this.createSpeedTrail();
  }
  
  /**
   * Apply visual distinctions for fast zombies
   */
  private applyFastZombieAppearance(): void {
    const mesh = this.getMesh();
    
    // Scale down to 0.9x for smaller, more agile appearance
    mesh.scale.set(0.9, 0.9, 0.9);
    
    // Update body and head colors to red-tinted variants
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        
        // Body parts - dark red tint
        if (material.color.getHex() === 0x2d5016) { // Dark green body
          material.color.setHex(0x5a1616); // Dark red
        }
        // Head - lighter red tint
        else if (material.color.getHex() === 0x3a6b1e) { // Lighter green head
          material.color.setHex(0x7a2020); // Lighter red
        }
        // Eyes - brighter red glow
        else if (material.color.getHex() === 0xff0000) { // Red eyes
          material.emissiveIntensity = 0.8; // More intense glow
        }
      }
    });
    
    // Add emissive glow to body for "heated" appearance
    const bodyMesh = mesh.children[0] as THREE.Mesh;
    if (bodyMesh && bodyMesh.material) {
      const material = bodyMesh.material as THREE.MeshStandardMaterial;
      material.emissive = new THREE.Color(0x440000);
      material.emissiveIntensity = 0.2;
    }
  }
  
  /**
   * Create particle trail effect for speed visualization
   */
  private createSpeedTrail(): void {
    // Create particle geometry
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Initialize particles behind the zombie
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = Math.random() * 1.5; // Random height
      positions[i * 3 + 2] = -i * 0.1; // Trail behind
      
      // Red-orange gradient colors
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = 0.3 + (i / particleCount) * 0.4; // G
      colors[i * 3 + 2] = 0.1; // B
      
      sizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.speedTrailParticles = new THREE.Points(geometry, material);
    this.getMesh().add(this.speedTrailParticles);
  }
  
  /**
   * Override update to include particle trail animation
   */
  public update(deltaTime: number, playerPosition: Vector3): void {
    super.update(deltaTime, playerPosition);
    
    if (this.isDead) return;
    
    // Update particle trail
    if (this.speedTrailParticles && (this.velocity.x !== 0 || this.velocity.z !== 0)) {
      this.particleTime += deltaTime;
      
      const positions = this.speedTrailParticles.geometry.attributes.position as THREE.BufferAttribute;
      const colors = this.speedTrailParticles.geometry.attributes.color as THREE.BufferAttribute;
      const particleCount = positions.count;
      
      // Animate particles
      for (let i = 0; i < particleCount; i++) {
        // Create flowing effect
        const offset = (this.particleTime * 2 + i * 0.5) % 2;
        positions.setY(i, Math.sin(offset * Math.PI) * 1.5);
        positions.setZ(i, -i * 0.1 - offset * 0.2);
        
        // Fade out particles towards the end of trail
        const fade = 1 - (i / particleCount);
        colors.setX(i, fade); // Red channel
      }
      
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      
      // Show particles when moving
      this.speedTrailParticles.visible = true;
    } else if (this.speedTrailParticles) {
      // Hide particles when stationary
      this.speedTrailParticles.visible = false;
    }
  }
  
  /**
   * Override attack to include faster animation
   */
  public attack(): void {
    super.attack();
    
    // Fast zombies attack with quick lunges
    const mesh = this.getMesh();
    const originalZ = mesh.position.z;
    
    // Quick lunge animation
    const lunge = () => {
      mesh.position.z += 0.3;
      setTimeout(() => {
        mesh.position.z = originalZ;
      }, 100);
    };
    
    lunge();
  }
}