import * as THREE from 'three';
import { Player as IPlayer, PlayerInput, Vector3 } from '../../types';
import { Weapon } from '../../types';

export class Player implements IPlayer {
  id: string = 'player';
  type: 'player' = 'player';
  transform = {
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  };
  boundingBox = {
    min: { x: -0.5, y: 0, z: -0.5 },
    max: { x: 0.5, y: 1, z: 0.5 }
  };
  active: boolean = true;
  health: number = 100;
  maxHealth: number = 100;
  isDead: boolean = false;
  velocity = { x: 0, y: 0, z: 0 };
  speed: number = 5;
  direction = { x: 0, y: 0, z: 1 };
  weapons: Weapon[] = [];
  currentWeaponIndex: number = 0;
  score: number = 0;

  // Movement properties
  private acceleration: number = 20; // Units per second squared
  private deceleration: number = 15; // Units per second squared
  private maxSpeed: number = 5; // Max units per second
  private currentSpeed = { x: 0, z: 0 }; // Current actual speed

  // Movement boundaries
  private boundaries = {
    minX: -45,
    maxX: 45,
    minZ: -45,
    maxZ: 45
  };

  private mesh: THREE.Group;

  constructor() {
    // Create player mesh group
    const group = new THREE.Group();
    
    // Body (main cube)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0066cc,
      metalness: 0.2,
      roughness: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Head (smaller cube on top)
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0088ff,
      metalness: 0.3,
      roughness: 0.7
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);
    
    // Direction indicator (small box showing forward direction)
    const directionGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.4);
    const directionMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffff00,
      metalness: 0.5,
      roughness: 0.5,
      emissive: 0xffff00,
      emissiveIntensity: 0.3
    });
    const direction = new THREE.Mesh(directionGeometry, directionMaterial);
    direction.position.set(0, 0.8, 0.5);
    direction.castShadow = true;
    group.add(direction);
    
    // Create the final mesh
    this.mesh = group;
    this.mesh.position.set(this.transform.position.x, this.transform.position.y, this.transform.position.z);

    // Initialize with pistol
    this.weapons.push({
      id: 'pistol',
      name: 'Pistol',
      type: 'pistol',
      damage: 25,
      fireRate: 2,
      ammo: -1,
      maxAmmo: -1,
      isUnlimited: true,
      projectileSpeed: 20
    });
    
    // Update bounding box to match new size
    this.updateBoundingBox();
  }

  public update(deltaTime: number, input: PlayerInput): void {
    if (this.isDead) return;

    // Update movement
    this.updateMovement(deltaTime, input);

    // Update rotation based on mouse
    this.updateRotation(input.mousePosition);

    // Handle firing
    if (input.isFiring) {
      this.fire();
    }

    // Update mesh position
    this.mesh.position.set(
      this.transform.position.x,
      this.transform.position.y,
      this.transform.position.z
    );
    this.mesh.rotation.y = this.transform.rotation.y;
  }

  private updateMovement(deltaTime: number, input: PlayerInput): void {
    // Get input direction
    const inputVector = { x: 0, z: 0 };

    if (input.movement.up) inputVector.z -= 1;
    if (input.movement.down) inputVector.z += 1;
    if (input.movement.left) inputVector.x -= 1;
    if (input.movement.right) inputVector.x += 1;

    // Normalize diagonal movement
    const inputLength = Math.sqrt(inputVector.x * inputVector.x + inputVector.z * inputVector.z);
    if (inputLength > 0) {
      inputVector.x /= inputLength;
      inputVector.z /= inputLength;
    }

    // Apply acceleration or deceleration
    if (inputLength > 0) {
      // Accelerate towards target velocity
      const targetVelocityX = inputVector.x * this.maxSpeed;
      const targetVelocityZ = inputVector.z * this.maxSpeed;
      
      // Smooth acceleration
      this.currentSpeed.x = this.smoothAcceleration(
        this.currentSpeed.x,
        targetVelocityX,
        this.acceleration * deltaTime
      );
      this.currentSpeed.z = this.smoothAcceleration(
        this.currentSpeed.z,
        targetVelocityZ,
        this.acceleration * deltaTime
      );
    } else {
      // Decelerate to stop
      this.currentSpeed.x = this.smoothDeceleration(
        this.currentSpeed.x,
        this.deceleration * deltaTime
      );
      this.currentSpeed.z = this.smoothDeceleration(
        this.currentSpeed.z,
        this.deceleration * deltaTime
      );
    }

    // Update velocity
    this.velocity.x = this.currentSpeed.x;
    this.velocity.z = this.currentSpeed.z;

    // Apply movement with boundaries
    const newX = this.transform.position.x + this.velocity.x * deltaTime;
    const newZ = this.transform.position.z + this.velocity.z * deltaTime;

    // Clamp to boundaries
    this.transform.position.x = Math.max(
      this.boundaries.minX,
      Math.min(this.boundaries.maxX, newX)
    );
    this.transform.position.z = Math.max(
      this.boundaries.minZ,
      Math.min(this.boundaries.maxZ, newZ)
    );

    // Stop velocity if we hit a boundary
    if (this.transform.position.x === this.boundaries.minX || 
        this.transform.position.x === this.boundaries.maxX) {
      this.currentSpeed.x = 0;
    }
    if (this.transform.position.z === this.boundaries.minZ || 
        this.transform.position.z === this.boundaries.maxZ) {
      this.currentSpeed.z = 0;
    }
  }

  private smoothAcceleration(current: number, target: number, maxDelta: number): number {
    const diff = target - current;
    const delta = Math.sign(diff) * Math.min(Math.abs(diff), maxDelta);
    return current + delta;
  }

  private smoothDeceleration(current: number, maxDelta: number): number {
    if (Math.abs(current) <= maxDelta) {
      return 0;
    }
    return current - Math.sign(current) * maxDelta;
  }

  private updateRotation(mousePosition: { x: number; y: number }): void {
    // This will be implemented properly when we integrate with the camera system
    // For now, just a placeholder
  }

  private fire(): void {
    // This will be implemented when we create the projectile system
    const currentWeapon = this.weapons[this.currentWeaponIndex];
    if (currentWeapon) {
      // Create projectile
    }
  }

  public takeDamage(damage: number): void {
    this.health -= damage;
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }

  private updateBoundingBox(): void {
    // Update bounding box based on player size
    this.boundingBox = {
      min: { x: -0.4, y: 0, z: -0.4 },
      max: { x: 0.4, y: 1.6, z: 0.4 }
    };
  }

  public getMesh(): THREE.Group {
    return this.mesh;
  }

  public getPosition(): Vector3 {
    return this.transform.position;
  }

  public isPlayerDead(): boolean {
    return this.isDead;
  }

  public getRotation(): Vector3 {
    return this.transform.rotation;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.transform.position.x = x;
    this.transform.position.y = y;
    this.transform.position.z = z;
    this.mesh.position.set(x, y, z);
  }

  public setRotation(x: number, y: number, z: number): void {
    this.transform.rotation.x = x;
    this.transform.rotation.y = y;
    this.transform.rotation.z = z;
    this.mesh.rotation.set(x, y, z);
  }

  public getVelocity(): Vector3 {
    return { ...this.velocity };
  }
}