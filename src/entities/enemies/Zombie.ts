import * as THREE from 'three';
import { Zombie as IZombie, Vector3, ZombieType } from '../../types';
import { AudioManager } from '../../core/audio/AudioManager';

export class Zombie implements IZombie {
  id: string;
  type: 'zombie' = 'zombie';
  zombieType: ZombieType;
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
  specialAbilities?: string[];
  
  private mesh: THREE.Group;
  private healthBarContainer: THREE.Group;
  private healthBarFill: THREE.Mesh;
  private audioManager: AudioManager | null = null;
  
  // STEP 28: Zombie sound properties
  private groanTimer: number = 0;
  private groanInterval: number = 3 + Math.random() * 2; // 3-5 seconds
  private hasPlayedDeathSound: boolean = false;
  
  constructor(position: Vector3, zombieType: ZombieType = 'basic') {
    this.id = `zombie-${Date.now()}-${Math.random()}`;
    this.zombieType = zombieType;
    this.transform.position = { ...position };
    
    // STEP 35: Configure stats based on zombie type
    this.configureZombieType();
    
    // Create zombie mesh group
    const group = new THREE.Group();
    
    // Body (color based on zombie type)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
    const bodyColor = this.zombieType === 'fire-resistant' ? 0x1a0a00 : 0x2d5016; // Charred black vs dark green
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: bodyColor,
      metalness: this.zombieType === 'fire-resistant' ? 0.3 : 0.1,
      roughness: this.zombieType === 'fire-resistant' ? 0.7 : 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);
    
    // Head (color based on zombie type)
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const headColor = this.zombieType === 'fire-resistant' ? 0x2a1505 : 0x3a6b1e; // Dark brown vs lighter green
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: headColor,
      metalness: this.zombieType === 'fire-resistant' ? 0.2 : 0.1,
      roughness: this.zombieType === 'fire-resistant' ? 0.8 : 0.9
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);
    
    // Eyes (color based on zombie type)
    const eyeGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.1);
    const eyeColor = this.zombieType === 'fire-resistant' ? 0xff6600 : 0xff0000; // Orange vs red
    const eyeMaterial = new THREE.MeshBasicMaterial({ 
      color: eyeColor,
      emissive: eyeColor,
      emissiveIntensity: this.zombieType === 'fire-resistant' ? 0.8 : 0.5
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
    
    // Create health bar
    this.createHealthBar();
  }
  
  // STEP 35: Configure zombie stats based on type
  private configureZombieType(): void {
    switch (this.zombieType) {
      case 'fire-resistant':
        this.maxHealth = 120; // More health
        this.health = 120;
        this.speed = 1.8; // Slightly slower
        this.damage = 12; // Slightly more damage
        this.specialAbilities = ['fire_resistance', 'lava_immunity'];
        break;
      case 'basic':
      default:
        // Default values already set
        break;
    }
  }

  private createHealthBar(): void {
    // Create health bar container
    this.healthBarContainer = new THREE.Group();
    
    // Background (dark red)
    const bgGeometry = new THREE.PlaneGeometry(1.0, 0.15);
    const bgMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x440000,
      side: THREE.DoubleSide
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    this.healthBarContainer.add(bgMesh);
    
    // Health fill (bright red)
    const fillGeometry = new THREE.PlaneGeometry(0.98, 0.13);
    const fillMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000,
      side: THREE.DoubleSide
    });
    this.healthBarFill = new THREE.Mesh(fillGeometry, fillMaterial);
    this.healthBarFill.position.z = 0.01; // Slightly in front of background
    this.healthBarContainer.add(this.healthBarFill);
    
    // Position health bar above zombie head
    this.healthBarContainer.position.set(0, 2.2, 0);
    
    // Set rotation for isometric view - tilted to be clearly visible
    this.healthBarContainer.rotation.x = -Math.PI / 4; // 45 degree tilt
    
    this.mesh.add(this.healthBarContainer);
  }
  
  public update(deltaTime: number, playerPosition: Vector3): void {
    if (this.isDead) return;
    
    // STEP 28: Update groan timer and play periodic groans
    if (this.audioManager) {
      this.groanTimer += deltaTime;
      if (this.groanTimer >= this.groanInterval) {
        this.audioManager.playRandomSound3D('zombie_groan', 3, this.transform.position, 0.3);
        this.groanTimer = 0;
        this.groanInterval = 3 + Math.random() * 2; // Reset with new random interval
      }
    }
    
    // STEP 16: Zombie AI Movement
    // Simple AI: move toward player
    const dx = playerPosition.x - this.transform.position.x;
    const dz = playerPosition.z - this.transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance > this.attackRange) { // Stop when in attack range
      // Normalize direction
      let dirX = dx / distance;
      let dirZ = dz / distance;
      
      // Add slight randomization to prevent stacking (±10% variation)
      const randomOffset = 0.1;
      dirX += (Math.random() - 0.5) * randomOffset;
      dirZ += (Math.random() - 0.5) * randomOffset;
      
      // Re-normalize after randomization
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
      dirX /= length;
      dirZ /= length;
      
      // Update velocity
      this.velocity.x = dirX * this.speed;
      this.velocity.z = dirZ * this.speed;
      
      // Update position
      this.transform.position.x += this.velocity.x * deltaTime;
      this.transform.position.z += this.velocity.z * deltaTime;
      
      // Update rotation to face player (use original direction, not randomized)
      this.transform.rotation.y = Math.atan2(dx, dz);
      
      // Update mesh
      this.mesh.position.set(
        this.transform.position.x,
        this.transform.position.y,
        this.transform.position.z
      );
      this.mesh.rotation.y = this.transform.rotation.y;
    } else {
      // Stop moving when in attack range
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
    
    // Keep health bar in fixed orientation for isometric view
    // No rotation needed - it will always be visible from the isometric camera angle
  }
  
  private updateHealthBar(): void {
    // Update health bar fill width based on current health
    const healthPercent = this.health / this.maxHealth;
    this.healthBarFill.scale.x = Math.max(0, healthPercent);
    
    // Change color based on health
    if (healthPercent > 0.6) {
      (this.healthBarFill.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00); // Green
    } else if (healthPercent > 0.3) {
      (this.healthBarFill.material as THREE.MeshBasicMaterial).color.setHex(0xffff00); // Yellow
    } else {
      (this.healthBarFill.material as THREE.MeshBasicMaterial).color.setHex(0xff0000); // Red
    }
  }
  
  public takeDamage(damage: number, damageType: string = 'normal'): void {
    const oldHealth = this.health;
    
    // STEP 35: Apply damage reduction for fire-resistant zombies
    let finalDamage = damage;
    if (this.zombieType === 'fire-resistant' && 
        (damageType === 'fire' || damageType === 'explosion')) {
      finalDamage = damage * 0.5; // 50% damage reduction
    }
    
    this.health -= finalDamage;
    console.log(`[Zombie.takeDamage] ${this.id}: ${oldHealth} - ${finalDamage} = ${this.health}`);
    
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.active = false;
      console.log(`[Zombie.takeDamage] ${this.id} DIED! isDead=${this.isDead}, active=${this.active}`);
      // Hide health bar when dead
      this.healthBarContainer.visible = false;
      
      // STEP 28: Play death sound
      if (this.audioManager && !this.hasPlayedDeathSound) {
        this.audioManager.playRandomSound3D('zombie_death', 2, this.transform.position, 0.5);
        this.hasPlayedDeathSound = true;
      }
    } else {
      console.log(`[Zombie.takeDamage] ${this.id} survived with ${this.health} health`);
    }
    
    // Update health bar visual
    this.updateHealthBar();
  }
  
  public getHealth(): number {
    return this.health;
  }
  
  public canAttack(): boolean {
    const currentTime = Date.now();
    return currentTime - this.lastAttackTime >= this.attackCooldown * 1000;
  }
  
  public attack(): void {
    this.lastAttackTime = Date.now();
    
    // STEP 28: Play attack sound
    if (this.audioManager) {
      this.audioManager.playSound3D('zombie_attack', this.transform.position, 0.4);
    }
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
  
  // STEP 28: Set audio manager reference
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
}