import * as THREE from 'three';
import { Entity, Vector3, BoundingBox } from '../../types';

export class Projectile implements Entity {
  id: string;
  type: 'projectile' = 'projectile';
  transform = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  };
  boundingBox: BoundingBox = {
    min: { x: -0.1, y: -0.1, z: -0.1 },
    max: { x: 0.1, y: 0.1, z: 0.1 }
  };
  active: boolean = true;
  
  // Projectile specific properties
  velocity: Vector3;
  damage: number;
  ownerId: string;
  lifetime: number;
  maxLifetime: number = 5; // 5 seconds max lifetime for longer range
  projectileSpeed: number;
  collisionDelay: number = 0.1; // 0.1 second delay before collision detection
  collisionRadius: number = 0.3; // Collision sphere radius for easier hits
  
  private mesh: THREE.Mesh;
  
  constructor(
    position: Vector3,
    direction: Vector3,
    damage: number,
    projectileSpeed: number,
    ownerId: string,
    collisionRadius?: number
  ) {
    this.id = `projectile-${Date.now()}-${Math.random()}`;
    this.transform.position = { ...position };
    this.damage = damage;
    this.ownerId = ownerId;
    this.projectileSpeed = projectileSpeed;
    this.lifetime = 0;
    
    // Allow custom collision radius for different weapon types
    if (collisionRadius !== undefined) {
      this.collisionRadius = collisionRadius;
    }
    
    // Calculate velocity from direction and speed
    this.velocity = {
      x: direction.x * projectileSpeed,
      y: direction.y * projectileSpeed,
      z: direction.z * projectileSpeed
    };
    
    // Create mesh - make it bigger to match collision radius better
    const geometry = new THREE.SphereGeometry(0.2, 8, 8); // Larger visual to match collision
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 1.0, // Brighter glow
      metalness: 0.3,
      roughness: 0.4
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    
    // Add a trail effect
    const trailGeometry = new THREE.ConeGeometry(0.05, 0.3, 4);
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.6
    });
    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.rotation.x = Math.PI / 2; // Point backwards
    trail.position.z = -0.15;
    this.mesh.add(trail);
    
    // Debug: Add collision radius visualization (comment out in production)
    if (import.meta.env.DEV && false) { // Set to true to see collision radius
      const debugGeometry = new THREE.SphereGeometry(this.collisionRadius, 16, 16);
      const debugMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.2,
        wireframe: true
      });
      const debugSphere = new THREE.Mesh(debugGeometry, debugMaterial);
      this.mesh.add(debugSphere);
    }
  }
  
  public update(deltaTime: number): void {
    if (!this.active) return;
    
    // Update lifetime
    this.lifetime += deltaTime;
    if (this.lifetime > this.maxLifetime) {
      this.active = false;
      return;
    }
    
    // Update position
    this.transform.position.x += this.velocity.x * deltaTime;
    this.transform.position.y += this.velocity.y * deltaTime;
    this.transform.position.z += this.velocity.z * deltaTime;
    
    // Update mesh position
    this.mesh.position.set(
      this.transform.position.x,
      this.transform.position.y,
      this.transform.position.z
    );
    
    // Rotate mesh to face direction of travel
    if (this.velocity.x !== 0 || this.velocity.z !== 0) {
      this.mesh.rotation.y = Math.atan2(this.velocity.x, this.velocity.z);
    }
  }
  
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }
  
  public destroy(): void {
    this.active = false;
    // Mesh removal will be handled by ProjectileManager
  }
  
  public canCollide(): boolean {
    // Only allow collisions after the delay period
    return this.lifetime > this.collisionDelay;
  }
  
  public getCollisionRadius(): number {
    return this.collisionRadius;
  }
}