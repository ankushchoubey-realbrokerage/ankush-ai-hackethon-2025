import * as THREE from 'three';
import { Player as IPlayer, PlayerInput, Vector3 } from '../../types';
import { Weapon } from '../../types';
import { MouseUtils } from '../../utils/MouseUtils';
import { Pistol, Shotgun, RocketLauncher } from '../../weapons';
import { AudioManager } from '../../core/audio/AudioManager';

export class Player implements IPlayer {
  private projectileManager: any = null; // Will be set by GameEngine
  private instanceId: number = Date.now(); // Debug: track instance
  private audioManager: AudioManager | null = null; // STEP 27: Audio manager reference
  private particleSystem: any = null; // Will be set by GameEngine
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

  // STEP 17: Damage and invulnerability properties
  private lastDamageTime: number = 0;
  private invulnerabilityDuration: number = 1000; // 1 second in milliseconds
  private isInvulnerable: boolean = false;

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
  private aimIndicator: THREE.Group | null = null;
  private camera: THREE.OrthographicCamera | null = null;
  private container: HTMLElement | null = null;

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

    // Initialize with pistol only
    this.weapons.push(new Pistol());
    
    // Update bounding box to match new size
    this.updateBoundingBox();
    
    // Create aim indicator line
    this.createAimIndicator();
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
    
    // STEP 17: Visual feedback for invulnerability
    if (this.isInvulnerable) {
      // Flash effect - toggle visibility rapidly
      const flashRate = 100; // milliseconds
      this.mesh.visible = Math.floor(Date.now() / flashRate) % 2 === 0;
    } else {
      this.mesh.visible = true;
    }
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

    // Apply movement (physics engine will handle boundaries and collisions)
    this.transform.position.x += this.velocity.x * deltaTime;
    this.transform.position.z += this.velocity.z * deltaTime;
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
    if (!this.camera || !this.container) return;

    // Convert screen coordinates to world coordinates
    const mouseWorld = MouseUtils.screenToWorld(
      mousePosition.x,
      mousePosition.y,
      this.camera,
      this.container,
      this.transform.position.y
    );

    // Calculate rotation angle
    const angle = MouseUtils.calculateAimAngle(
      new THREE.Vector3(this.transform.position.x, this.transform.position.y, this.transform.position.z),
      mouseWorld
    );

    // Update player rotation
    this.transform.rotation.y = angle;
    
    // Update aim indicator
    this.updateAimIndicator(mouseWorld);
  }

  private fire(): void {
    const currentWeapon = this.getCurrentWeapon();
    if (currentWeapon && currentWeapon.fire && this.projectileManager) {
      // Fire the weapon
      const fired = currentWeapon.fire();
      if (fired) {
        // Calculate spawn position (further in front of player to avoid self-collision)
        const spawnOffset = 1.0; // Increased from 0.5 to avoid collision
        const aimDir = this.getAimDirection();
        const spawnPosition = {
          x: this.transform.position.x + aimDir.x * spawnOffset,
          y: this.transform.position.y + 0.8, // Shoot from roughly gun height
          z: this.transform.position.z + aimDir.z * spawnOffset
        };
        
        // Check if this is a shotgun for multi-projectile handling
        if (currentWeapon.id === 'shotgun' && currentWeapon instanceof Shotgun) {
          // Shotgun fires multiple pellets in a spread pattern
          const pelletsPerShot = currentWeapon.pelletsPerShot;
          
          for (let i = 0; i < pelletsPerShot; i++) {
            let pelletDirection = { ...aimDir };
            
            if (i === 0) {
              // Center pellet goes straight
              pelletDirection = aimDir;
            } else {
              // Create spread pattern for other pellets
              // Pattern: +X, -X, +Y, -Y directions with spread angle
              const patternIndex = (i - 1) % 4;
              let spreadX = 0;
              let spreadZ = 0;
              
              const baseSpread = currentWeapon.spread || 0.15;
              
              switch (patternIndex) {
                case 0: // Right
                  spreadX = baseSpread;
                  break;
                case 1: // Left
                  spreadX = -baseSpread;
                  break;
                case 2: // Forward-right diagonal
                  spreadX = baseSpread * 0.707;
                  spreadZ = baseSpread * 0.707;
                  break;
                case 3: // Forward-left diagonal
                  spreadX = -baseSpread * 0.707;
                  spreadZ = baseSpread * 0.707;
                  break;
              }
              
              // Apply rotation to spread
              const cos = Math.cos(this.transform.rotation.y);
              const sin = Math.sin(this.transform.rotation.y);
              
              pelletDirection = {
                x: aimDir.x + (spreadX * cos - spreadZ * sin),
                y: 0,
                z: aimDir.z + (spreadX * sin + spreadZ * cos)
              };
              
              // Normalize the direction
              const length = Math.sqrt(pelletDirection.x * pelletDirection.x + pelletDirection.z * pelletDirection.z);
              pelletDirection.x /= length;
              pelletDirection.z /= length;
            }
            
            // Create pellet projectile
            this.projectileManager.createProjectile(
              spawnPosition,
              pelletDirection,
              currentWeapon.damage,
              currentWeapon.projectileSpeed,
              this.id
            );
          }
        } else {
          // Normal single projectile weapons
          let finalDirection = { ...aimDir };
          if (currentWeapon.spread && currentWeapon.spread > 0) {
            const spreadAngle = (Math.random() - 0.5) * currentWeapon.spread;
            const cos = Math.cos(spreadAngle);
            const sin = Math.sin(spreadAngle);
            finalDirection = {
              x: aimDir.x * cos - aimDir.z * sin,
              y: 0,
              z: aimDir.x * sin + aimDir.z * cos
            };
          }
          
          // Create projectile
          this.projectileManager.createProjectile(
            spawnPosition,
            finalDirection,
            currentWeapon.damage,
            currentWeapon.projectileSpeed,
            this.id
          );
        }
        
        // STEP 37: Create appropriate projectile type for rocket launcher
        if (currentWeapon.id === 'rocketlauncher') {
          // Create rocket with explosion properties
          const rocketLauncher = currentWeapon as any;
          this.projectileManager.createRocket(
            spawnPosition,
            finalDirection,
            currentWeapon.damage,
            currentWeapon.projectileSpeed,
            this.id,
            rocketLauncher.explosionRadius || 5,
            rocketLauncher.splashDamage || 75
          );
        }
        // STEP 27: Play weapon sound
        if (this.audioManager) {
          // Determine weapon type and play appropriate sound
          if (currentWeapon.id === 'pistol') {
            this.audioManager.playWeaponSound('pistol', 0.5);
          } else if (currentWeapon.id === 'machine_gun') {
            this.audioManager.playWeaponSound('machine_gun', 0.4);
          } else if (currentWeapon.id === 'shotgun') {
            this.audioManager.playWeaponSound('shotgun', 0.7); // Louder for shotgun
          } else if (currentWeapon.id === 'rocketlauncher') {
            this.audioManager.playWeaponSound('rocket_launch', 0.7);
          }
        }
        
        // STEP 29: Create muzzle flash effect
        if (this.particleSystem) {
          this.particleSystem.emit('muzzleFlash', {
            count: 10,
            emitPosition: new THREE.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z),
            emitDirection: new THREE.Vector3(finalDirection.x, finalDirection.y, finalDirection.z),
            spread: 0.1,
            speed: 5,
            speedVariation: 2,
            color: new THREE.Color(1, 1, 0.5),
            size: 0.3,
            sizeVariation: 0.1,
            lifetime: 0.1,
            lifetimeVariation: 0.05
          });
        }
      }
    }
  }

  public takeDamage(damage: number): void {
    // STEP 17: Check invulnerability
    const currentTime = Date.now();
    if (currentTime - this.lastDamageTime < this.invulnerabilityDuration) {
      return; // Still invulnerable, don't take damage
    }

    // Apply damage
    this.health -= damage;
    this.lastDamageTime = currentTime;
    this.isInvulnerable = true;
    
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
    
    // Reset invulnerability flag after duration
    setTimeout(() => {
      this.isInvulnerable = false;
    }, this.invulnerabilityDuration);
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

  public setCamera(camera: THREE.OrthographicCamera, container: HTMLElement): void {
    this.camera = camera;
    this.container = container;
  }

  private createAimIndicator(): void {
    // Create a group for aim visualization
    const aimGroup = new THREE.Group();

    // Create main aim line
    const lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0.8, 0.5,  // Start slightly in front of player
      0, 0.8, 8     // End 8 units forward
    ]);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });

    const aimLine = new THREE.Line(lineGeometry, lineMaterial);
    aimGroup.add(aimLine);

    // Add aim cone for spread visualization
    const coneGeometry = new THREE.ConeGeometry(1.5, 8, 8, 1, true);
    const coneMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    
    const aimCone = new THREE.Mesh(coneGeometry, coneMaterial);
    aimCone.rotation.x = -Math.PI / 2; // Point forward
    aimCone.position.set(0, 0.8, 4);
    aimGroup.add(aimCone);

    // Add dot at end of aim line
    const dotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    const aimDot = new THREE.Mesh(dotGeometry, dotMaterial);
    aimDot.position.set(0, 0.8, 8);
    aimGroup.add(aimDot);

    this.aimIndicator = aimGroup as any;
    this.mesh.add(this.aimIndicator);
  }

  private updateAimIndicator(mouseWorld: THREE.Vector3): void {
    if (!this.aimIndicator) return;

    // The aim indicator rotates with the player mesh, so no need to update it
    // The rotation is handled by updating the player's rotation
    // This method can be used for dynamic updates if needed
  }

  public getAimDirection(): Vector3 {
    // Get the forward direction based on rotation
    const angle = this.transform.rotation.y;
    return {
      x: Math.sin(angle),
      y: 0,
      z: Math.cos(angle)
    };
  }
  
  public isCurrentlyInvulnerable(): boolean {
    return this.isInvulnerable;
  }
  
  public getHealth(): number {
    return this.health;
  }
  
  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getCurrentWeapon(): Weapon | null {
    return this.weapons[this.currentWeaponIndex] || null;
  }

  public switchWeapon(index: number): void {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }
  
  public addWeapon(weapon: Weapon): void {
    // Check if weapon already exists
    const existingIndex = this.weapons.findIndex(w => w.id === weapon.id);
    if (existingIndex === -1) {
      this.weapons.push(weapon);
      // Auto-switch to new weapon
      this.currentWeaponIndex = this.weapons.length - 1;
    } else {
      // If weapon exists, just add ammo
      const existingWeapon = this.weapons[existingIndex];
      if (existingWeapon.addAmmo) {
        existingWeapon.addAmmo(weapon.maxAmmo);
      }
    }
  }
  
  public setProjectileManager(projectileManager: any): void {
    this.projectileManager = projectileManager;
  }

  // STEP 27: Set audio manager reference
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  public setParticleSystem(particleSystem: any): void {
    this.particleSystem = particleSystem;
  }
}