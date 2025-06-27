import * as THREE from 'three';
import { Entity, Vector3, BoundingBox } from '../../types';
import { Projectile } from './Projectile';

// STEP 37: Rocket Projectile Implementation

export class Rocket extends Projectile {
  public projectileType: 'rocket' = 'rocket';
  public explosionRadius: number;
  public splashDamage: number;
  private trailParticles: THREE.Points[] = [];
  private scene: THREE.Scene | null = null;
  private rocketMesh: THREE.Group;
  private thrusterLight: THREE.PointLight;
  
  constructor(
    position: Vector3,
    direction: Vector3,
    damage: number,
    projectileSpeed: number,
    ownerId: string,
    explosionRadius: number = 5,
    splashDamage: number = 75
  ) {
    super(position, direction, damage, projectileSpeed, ownerId);
    
    this.explosionRadius = explosionRadius;
    this.splashDamage = splashDamage;
    
    // Rockets are affected by gravity slightly
    this.velocity.y -= 0.5; // Initial upward compensation
    
    // Create custom rocket mesh
    this.rocketMesh = this.createRocketMesh();
    this.rocketMesh.position.copy(this.getMesh().position);
    
    // Add thruster light
    this.thrusterLight = new THREE.PointLight(0xff6600, 2, 5);
    this.thrusterLight.position.set(0, 0, -0.5);
    this.rocketMesh.add(this.thrusterLight);
    
    // Replace default mesh with rocket mesh
    const oldMesh = this.getMesh();
    (this as any).mesh = this.rocketMesh;
    oldMesh.geometry.dispose();
    (oldMesh.material as THREE.Material).dispose();
  }
  
  private createRocketMesh(): THREE.Group {
    const group = new THREE.Group();
    
    // Rocket body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2; // Horizontal orientation
    group.add(body);
    
    // Rocket nose cone
    const noseGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.5,
      roughness: 0.4
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 0.55;
    group.add(nose);
    
    // Rocket fins
    const finGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.15);
    const finMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.6,
      roughness: 0.4
    });
    
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      const angle = (i / 4) * Math.PI * 2;
      fin.position.x = -0.3;
      fin.position.y = Math.sin(angle) * 0.15;
      fin.position.z = Math.cos(angle) * 0.15;
      fin.rotation.x = angle;
      group.add(fin);
    }
    
    // Thruster exhaust
    const exhaustGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);
    const exhaustMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.8
    });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.rotation.z = Math.PI / 2;
    exhaust.position.x = -0.5;
    group.add(exhaust);
    
    return group;
  }
  
  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  public update(deltaTime: number): void {
    if (!this.active) return;
    
    // Apply gravity to rockets
    this.velocity.y -= 9.8 * deltaTime * 0.2; // 20% gravity effect
    
    // Call parent update
    super.update(deltaTime);
    
    // Create smoke trail
    if (this.scene && Math.random() > 0.3) { // Create particles 70% of frames
      this.createTrailParticle();
    }
    
    // Update trail particles
    this.updateTrailParticles(deltaTime);
    
    // Rotate rocket to face direction of travel
    const direction = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z);
    direction.normalize();
    
    if (direction.length() > 0) {
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
      this.rocketMesh.quaternion.copy(quaternion);
    }
    
    // Pulse thruster light
    this.thrusterLight.intensity = 1.5 + Math.sin(Date.now() * 0.01) * 0.5;
  }
  
  private createTrailParticle(): void {
    if (!this.scene) return;
    
    const particleGeometry = new THREE.SphereGeometry(0.3, 4, 4);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x666666,
      transparent: true,
      opacity: 0.6
    });
    
    const particle = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3()]),
      new THREE.PointsMaterial({
        size: 1.5,
        color: 0x888888,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
      })
    );
    
    // Create mesh instead of points for better visuals
    const smokeMesh = new THREE.Mesh(particleGeometry, particleMaterial);
    smokeMesh.position.copy(this.rocketMesh.position);
    smokeMesh.position.x -= 0.5; // Behind the rocket
    
    // Add random offset
    smokeMesh.position.x += (Math.random() - 0.5) * 0.2;
    smokeMesh.position.y += (Math.random() - 0.5) * 0.2;
    smokeMesh.position.z += (Math.random() - 0.5) * 0.2;
    
    this.scene.add(smokeMesh);
    this.trailParticles.push(smokeMesh as any);
  }
  
  private updateTrailParticles(deltaTime: number): void {
    const particlesToRemove: number[] = [];
    
    this.trailParticles.forEach((particle, index) => {
      const mesh = particle as any as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      
      // Fade out and grow
      material.opacity -= deltaTime * 0.8;
      mesh.scale.addScalar(deltaTime * 0.5);
      
      // Float upward slightly
      mesh.position.y += deltaTime * 0.5;
      
      // Remove if faded out
      if (material.opacity <= 0) {
        particlesToRemove.push(index);
        if (this.scene) {
          this.scene.remove(mesh);
        }
        mesh.geometry.dispose();
        material.dispose();
      }
    });
    
    // Remove dead particles
    particlesToRemove.reverse().forEach(index => {
      this.trailParticles.splice(index, 1);
    });
  }
  
  public destroy(): void {
    super.destroy();
    
    // Clean up trail particles
    this.trailParticles.forEach(particle => {
      const mesh = particle as any as THREE.Mesh;
      if (this.scene) {
        this.scene.remove(mesh);
      }
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.trailParticles = [];
    
    // Clean up rocket mesh
    this.rocketMesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    
    // Remove thruster light
    if (this.thrusterLight.parent) {
      this.thrusterLight.parent.remove(this.thrusterLight);
    }
  }
}