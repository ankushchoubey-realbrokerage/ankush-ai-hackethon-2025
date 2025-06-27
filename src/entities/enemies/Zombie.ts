import * as THREE from 'three';
import { Zombie as IZombie, Vector3 } from '../../types';

export class Zombie implements IZombie {
  id: string;
  type: 'zombie' = 'zombie';
  subType: 'normal' = 'normal';
  transform = {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  };
  boundingBox = {
    min: { x: -0.4, y: 0, z: -0.4 },
    max: { x: 0.4, y: 1.6, z: 0.4 }
  };
  active: boolean = true;
  health: number = 100;
  maxHealth: number = 100;
  isDead: boolean = false;
  velocity = { x: 0, y: 0, z: 0 };
  speed: number = 2; // Slower than player
  damage: number = 10;
  attackRange: number = 1.5;
  attackCooldown: number = 1; // 1 second between attacks
  lastAttackTime: number = 0;
  
  private mesh: THREE.Group;
  
  constructor(position: Vector3) {
    this.id = `zombie-${Date.now()}-${Math.random()}`;
    this.transform.position = { ...position };
    
    // Create zombie mesh group
    const group = new THREE.Group();
    
    // Body (dark green cube)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016, // Dark green
      metalness: 0.1,
      roughness: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Head (slightly lighter green)
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a6b1e, // Lighter green
      metalness: 0.1,
      roughness: 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);
    
    // Eyes (red glowing)
    const eyeGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.1);
    const eyeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.35, 0.31);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial.clone());
    rightEye.position.set(0.15, 1.35, 0.31);
    group.add(rightEye);
    
    // Arms (simple boxes for now)
    const armGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,
      metalness: 0.1,
      roughness: 0.9
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.55, 0.5, 0);
    leftArm.rotation.z = 0.1; // Slight outward angle
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial.clone());
    rightArm.position.set(0.55, 0.5, 0);
    rightArm.rotation.z = -0.1; // Slight outward angle
    group.add(rightArm);
    
    this.mesh = group;
    this.mesh.position.set(position.x, position.y, position.z);
  }
  
  public update(deltaTime: number, playerPosition: Vector3): void {
    if (this.isDead) return;
    
    // Simple AI: move toward player
    const dx = playerPosition.x - this.transform.position.x;
    const dz = playerPosition.z - this.transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > 0.1) {
      // Normalize direction
      const dirX = dx / distance;
      const dirZ = dz / distance;
      
      // Update velocity
      this.velocity.x = dirX * this.speed;
      this.velocity.z = dirZ * this.speed;
      
      // Update position
      this.transform.position.x += this.velocity.x * deltaTime;
      this.transform.position.z += this.velocity.z * deltaTime;
      
      // Update rotation to face player
      this.transform.rotation.y = Math.atan2(dx, dz);
      
      // Update mesh
      this.mesh.position.set(
        this.transform.position.x,
        this.transform.position.y,
        this.transform.position.z
      );
      this.mesh.rotation.y = this.transform.rotation.y;
    }
  }
  
  public takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.active = false;
    }
  }
  
  public canAttack(): boolean {
    const currentTime = Date.now();
    return currentTime - this.lastAttackTime >= this.attackCooldown * 1000;
  }
  
  public attack(): void {
    this.lastAttackTime = Date.now();
  }
  
  public getMesh(): THREE.Group {
    return this.mesh;
  }
  
  public getPosition(): Vector3 {
    return this.transform.position;
  }
  
  public isInAttackRange(targetPosition: Vector3): boolean {
    const dx = targetPosition.x - this.transform.position.x;
    const dz = targetPosition.z - this.transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance <= this.attackRange;
  }
}