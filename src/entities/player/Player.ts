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

  private mesh: THREE.Mesh;

  constructor() {
    // Create player mesh
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x0066cc,
      metalness: 0.2,
      roughness: 0.8
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
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
    const moveVector = { x: 0, y: 0, z: 0 };

    if (input.movement.up) moveVector.z -= 1;
    if (input.movement.down) moveVector.z += 1;
    if (input.movement.left) moveVector.x -= 1;
    if (input.movement.right) moveVector.x += 1;

    // Normalize diagonal movement
    const length = Math.sqrt(moveVector.x * moveVector.x + moveVector.z * moveVector.z);
    if (length > 0) {
      moveVector.x /= length;
      moveVector.z /= length;
    }

    // Apply movement
    this.velocity.x = moveVector.x * this.speed;
    this.velocity.z = moveVector.z * this.speed;

    this.transform.position.x += this.velocity.x * deltaTime;
    this.transform.position.z += this.velocity.z * deltaTime;
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

  public getMesh(): THREE.Mesh {
    return this.mesh;
  }

  public getPosition(): Vector3 {
    return this.transform.position;
  }
}