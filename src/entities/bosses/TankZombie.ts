import * as THREE from 'three';
import { Zombie } from '../enemies/Zombie';
import { IBoss } from './BossSystem';
import { Vector3 } from '../../types';
import { ParticleSystem } from '../../effects/ParticleSystem';
import { AudioManager } from '../../core/audio/AudioManager';

export class TankZombie extends Zombie implements IBoss {
  name: string = 'Tank Zombie';
  phase: number = 1;
  specialAttackCooldown: number = 5; // 5 seconds between special attacks
  lastSpecialAttackTime: number = 0;
  
  // Attack states
  private isCharging: boolean = false;
  private chargeTarget: Vector3 | null = null;
  private chargeSpeed: number = 8;
  private isGroundSlamming: boolean = false;
  private groundSlamTimer: number = 0;
  private summonCooldown: number = 10;
  private lastSummonTime: number = 0;
  
  // Rage mode properties
  private baseSpeed: number;
  private baseDamage: number;
  private rageSpeedMultiplier: number = 1.5;
  private rageDamageMultiplier: number = 1.5;
  
  // References
  private particleSystem: ParticleSystem | null = null;
  private onSummonCallback: ((position: Vector3) => void) | null = null;
  
  zombieType: any = 'tank-boss';
  
  constructor(position: Vector3) {
    super(position);
    
    // Boss stats - dies in 4 hits
    this.health = 4;
    this.maxHealth = 4;
    this.speed = 1.5; // Slower than normal zombies
    this.damage = 50; // High damage
    this.attackRange = 3; // Larger attack range
    this.attackCooldown = 2; // Slower attacks
    
    // Store base values for rage mode
    this.baseSpeed = this.speed;
    this.baseDamage = this.damage;
    
    // Scale up the boss
    this.scaleMesh(2.0);
    
    // Custom appearance
    this.customizeAppearance();
  }
  
  private scaleMesh(scale: number): void {
    const mesh = this.getMesh();
    mesh.scale.set(scale, scale, scale);
    
    // Update bounding box
    this.boundingBox = {
      min: { x: -0.8, y: 0, z: -0.8 },
      max: { x: 0.8, y: 3.2, z: 0.8 }
    };
    
    // Update health bar position
    const healthBar = mesh.children.find(child => 
      child instanceof THREE.Group && child.position.y > 2
    );
    if (healthBar) {
      healthBar.position.y = 4.5;
      healthBar.scale.set(1.5, 1.5, 1.5);
    }
  }
  
  private customizeAppearance(): void {
    const mesh = this.getMesh();
    
    // Make the boss darker and more menacing
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.Material;
        
        if (material instanceof THREE.MeshStandardMaterial) {
          // Darker, more metallic appearance
          material.color.setHex(0x1a1a1a);
          material.metalness = 0.7;
          material.roughness = 0.3;
          
          // Add red glow to eyes
          if (material instanceof THREE.MeshBasicMaterial && 
              material.color.getHex() === 0xff0000) {
            material.emissive = new THREE.Color(0xff0000);
            material.emissiveIntensity = 1.0;
          }
        }
      }
    });
    
    // Add armor plates
    this.addArmorPlates();
  }
  
  private addArmorPlates(): void {
    const mesh = this.getMesh();
    
    // Shoulder armor
    const shoulderGeometry = new THREE.BoxGeometry(1.2, 0.4, 0.8);
    const armorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, armorMaterial);
    leftShoulder.position.set(-1.1, 2.6, 0);
    leftShoulder.rotation.z = -0.2;
    mesh.add(leftShoulder);
    
    const rightShoulder = new THREE.Mesh(shoulderGeometry, armorMaterial.clone());
    rightShoulder.position.set(1.1, 2.6, 0);
    rightShoulder.rotation.z = 0.2;
    mesh.add(rightShoulder);
    
    // Chest armor
    const chestGeometry = new THREE.BoxGeometry(1.8, 2, 0.6);
    const chestArmor = new THREE.Mesh(chestGeometry, armorMaterial.clone());
    chestArmor.position.set(0, 1, 0.5);
    mesh.add(chestArmor);
  }
  
  public setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }
  
  public setOnSummonCallback(callback: (position: Vector3) => void): void {
    this.onSummonCallback = callback;
  }
  
  public update(deltaTime: number, playerPosition: Vector3): void {
    if (this.isDead) return;
    
    // Handle special attack states
    if (this.isCharging) {
      this.updateCharge(deltaTime);
    } else if (this.isGroundSlamming) {
      this.updateGroundSlam(deltaTime);
    } else {
      // Normal movement and attacks
      super.update(deltaTime, playerPosition);
      
      // Check for special attacks
      this.checkSpecialAttacks(playerPosition);
    }
  }
  
  private checkSpecialAttacks(playerPosition: Vector3): void {
    const currentTime = Date.now() / 1000;
    
    // Check if we can do a special attack
    if (currentTime - this.lastSpecialAttackTime < this.specialAttackCooldown) {
      return;
    }
    
    const dx = playerPosition.x - this.transform.position.x;
    const dz = playerPosition.z - this.transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Choose attack based on phase and distance
    if (this.phase >= 2 && distance < 5) {
      // Ground slam for close range in phase 2+
      this.startGroundSlam();
    } else if (distance > 8 && distance < 20) {
      // Charge attack for medium range
      this.startCharge(playerPosition);
    } else if (this.phase >= 2 && currentTime - this.lastSummonTime > this.summonCooldown) {
      // Summon zombies in phase 2+
      this.summonZombies();
    }
  }
  
  private startCharge(target: Vector3): void {
    this.isCharging = true;
    this.chargeTarget = { ...target };
    this.lastSpecialAttackTime = Date.now() / 1000;
    
    // Play charge sound
    const audioManager = this.getAudioManager();
    if (audioManager) {
      audioManager.playSound3D('zombie_groan_2', this.transform.position, 1.0);
    }
    
    // Visual effect for charge
    this.createChargeEffect();
  }
  
  private updateCharge(deltaTime: number): void {
    if (!this.chargeTarget) {
      this.isCharging = false;
      return;
    }
    
    const dx = this.chargeTarget.x - this.transform.position.x;
    const dz = this.chargeTarget.z - this.transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < 1) {
      // Reached target
      this.isCharging = false;
      this.chargeTarget = null;
      
      // Deal damage in area
      this.createChargeImpact();
    } else {
      // Move toward target
      const dirX = dx / distance;
      const dirZ = dz / distance;
      
      this.velocity.x = dirX * this.chargeSpeed;
      this.velocity.z = dirZ * this.chargeSpeed;
      
      this.transform.position.x += this.velocity.x * deltaTime;
      this.transform.position.z += this.velocity.z * deltaTime;
      
      // Update mesh position
      this.getMesh().position.set(
        this.transform.position.x,
        this.transform.position.y,
        this.transform.position.z
      );
      
      // Face direction
      this.transform.rotation.y = Math.atan2(dx, dz);
      this.getMesh().rotation.y = this.transform.rotation.y;
    }
  }
  
  private createChargeEffect(): void {
    if (!this.particleSystem) return;
    
    // Create dust particles behind the boss
    const interval = setInterval(() => {
      if (!this.isCharging) {
        clearInterval(interval);
        return;
      }
      
      for (let i = 0; i < 3; i++) {
        this.particleSystem!.emit('custom', {
          position: new THREE.Vector3(
            this.transform.position.x + (Math.random() - 0.5) * 2,
            0.1,
            this.transform.position.z + (Math.random() - 0.5) * 2
          ),
          velocity: new THREE.Vector3(0, 1, 0),
          color: new THREE.Color(0x8b7355), // Dust brown
          size: 0.5,
          lifetime: 1,
          gravity: true,
          fadeOut: true,
          shrink: true
        });
      }
    }, 100);
  }
  
  private createChargeImpact(): void {
    // Create impact particles
    if (this.particleSystem) {
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        this.particleSystem.emit('custom', {
          position: new THREE.Vector3(
            this.transform.position.x,
            0.5,
            this.transform.position.z
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * 5,
            2,
            Math.sin(angle) * 5
          ),
          color: new THREE.Color(0x8b7355),
          size: 0.8,
          lifetime: 1.5,
          gravity: true,
          fadeOut: true,
          shrink: true
        });
      }
    }
    
    // Play impact sound
    const audioManager = this.getAudioManager();
    if (audioManager) {
      audioManager.playMetalClank(this.transform.position);
    }
  }
  
  private startGroundSlam(): void {
    this.isGroundSlamming = true;
    this.groundSlamTimer = 0;
    this.lastSpecialAttackTime = Date.now() / 1000;
    this.velocity.x = 0;
    this.velocity.z = 0;
    
    // Play slam preparation sound
    const audioManager = this.getAudioManager();
    if (audioManager) {
      audioManager.playSound3D('zombie_groan_3', this.transform.position, 1.0);
    }
  }
  
  private updateGroundSlam(deltaTime: number): void {
    this.groundSlamTimer += deltaTime;
    
    const slamDuration = 1.0; // 1 second total
    const slamPoint = 0.5; // Slam happens at 0.5 seconds
    
    if (this.groundSlamTimer < slamPoint) {
      // Raise arms
      const progress = this.groundSlamTimer / slamPoint;
      const mesh = this.getMesh();
      mesh.position.y = this.transform.position.y + progress * 0.5;
    } else if (this.groundSlamTimer < slamDuration) {
      // Slam down
      const progress = (this.groundSlamTimer - slamPoint) / (slamDuration - slamPoint);
      const mesh = this.getMesh();
      mesh.position.y = this.transform.position.y + (1 - progress) * 0.5;
      
      // Create AOE damage at slam point
      if (this.groundSlamTimer - deltaTime < slamPoint) {
        this.createGroundSlamEffect();
      }
    } else {
      // End slam
      this.isGroundSlamming = false;
      this.getMesh().position.y = this.transform.position.y;
    }
  }
  
  private createGroundSlamEffect(): void {
    // Create shockwave particles
    if (this.particleSystem) {
      for (let ring = 0; ring < 3; ring++) {
        const radius = (ring + 1) * 2;
        const particleCount = 20 + ring * 10;
        
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2;
          this.particleSystem.emit('custom', {
            position: new THREE.Vector3(
              this.transform.position.x + Math.cos(angle) * radius,
              0.1,
              this.transform.position.z + Math.sin(angle) * radius
            ),
            velocity: new THREE.Vector3(0, 3 - ring, 0),
            color: new THREE.Color(0x8b7355),
            size: 1 - ring * 0.2,
            lifetime: 1 + ring * 0.2,
            gravity: true,
            fadeOut: true,
            shrink: true
          });
        }
      }
    }
    
    // Play slam sound
    const audioManager = this.getAudioManager();
    if (audioManager) {
      audioManager.playSound3D('metal_clank', this.transform.position, 1.2);
    }
  }
  
  private summonZombies(): void {
    this.lastSummonTime = Date.now() / 1000;
    this.lastSpecialAttackTime = Date.now() / 1000;
    
    // Summon 3-5 zombies around the boss
    const zombieCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < zombieCount; i++) {
      const angle = (i / zombieCount) * Math.PI * 2;
      const distance = 5 + Math.random() * 3;
      
      const summonPosition = {
        x: this.transform.position.x + Math.cos(angle) * distance,
        y: 0,
        z: this.transform.position.z + Math.sin(angle) * distance
      };
      
      // Create summon effect
      this.createSummonEffect(summonPosition);
      
      // Call summon callback after delay
      if (this.onSummonCallback) {
        setTimeout(() => {
          if (this.onSummonCallback) {
            this.onSummonCallback(summonPosition);
          }
        }, 500);
      }
    }
    
    // Play summon sound
    const audioManager = this.getAudioManager();
    if (audioManager) {
      audioManager.playAlarm();
    }
  }
  
  private createSummonEffect(position: Vector3): void {
    if (!this.particleSystem) return;
    
    // Create portal effect
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      this.particleSystem.emit('custom', {
        position: new THREE.Vector3(position.x, 0.1, position.z),
        velocity: new THREE.Vector3(
          Math.cos(angle) * 2,
          5,
          Math.sin(angle) * 2
        ),
        color: new THREE.Color(0x800080), // Purple
        size: 0.5,
        lifetime: 1.5,
        gravity: false,
        fadeOut: true,
        shrink: true
      });
    }
  }
  
  public enterPhase(phase: number): void {
    this.phase = phase;
    console.log(`Tank Zombie entering phase ${phase}`);
    
    switch (phase) {
      case 2:
        // Phase 2: Add ground slam
        this.specialAttackCooldown = 4; // Faster special attacks
        break;
      case 3:
        // Phase 3: Rage mode
        this.speed = this.baseSpeed * this.rageSpeedMultiplier;
        this.damage = this.baseDamage * this.rageDamageMultiplier;
        this.specialAttackCooldown = 3; // Even faster attacks
        this.attackCooldown = 1.5; // Faster basic attacks
        
        // Visual rage effect
        this.applyRageVisuals();
        break;
    }
    
    // Play phase change sound
    const audioManager = this.getAudioManager();
    if (audioManager) {
      audioManager.playSound3D('zombie_groan_1', this.transform.position, 1.5);
    }
  }
  
  private applyRageVisuals(): void {
    const mesh = this.getMesh();
    
    // Make eyes glow brighter
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.Material;
        
        if (material instanceof THREE.MeshBasicMaterial && 
            material.color.getHex() === 0x660000) {
          material.color.setHex(0xff0000);
          // MeshBasicMaterial doesn't have emissive, just make it brighter
        }
      }
    });
    
    // Add rage aura particles
    if (this.particleSystem) {
      setInterval(() => {
        if (this.isDead || this.phase !== 3) return;
        
        this.particleSystem!.emit('custom', {
          position: new THREE.Vector3(
            this.transform.position.x + (Math.random() - 0.5) * 2,
            this.transform.position.y + Math.random() * 3,
            this.transform.position.z + (Math.random() - 0.5) * 2
          ),
          velocity: new THREE.Vector3(0, 1, 0),
          color: new THREE.Color(0xff0000), // Red rage
          size: 0.3,
          lifetime: 1,
          gravity: false,
          fadeOut: true,
          shrink: true
        });
      }, 100);
    }
  }
  
  public specialAttack(): void {
    // This is called by external systems if needed
    // The boss handles its own special attacks in checkSpecialAttacks
  }
  
  public onDefeat(): void {
    this.isDead = true;
    this.active = false;
    
    // Hide health bar
    const healthBar = this.getMesh().children.find(child => 
      child instanceof THREE.Group && child.position.y > 4
    );
    if (healthBar) {
      healthBar.visible = false;
    }
    
    // Play death animation (fall backwards)
    const mesh = this.getMesh();
    let deathTimer = 0;
    const deathDuration = 1.5;
    
    const animateDeath = () => {
      deathTimer += 0.016; // ~60 FPS
      
      if (deathTimer < deathDuration) {
        const progress = deathTimer / deathDuration;
        mesh.rotation.x = -progress * Math.PI / 2; // Fall backwards
        mesh.position.y = this.transform.position.y * (1 - progress * 0.5);
        
        requestAnimationFrame(animateDeath);
      }
    };
    
    animateDeath();
    
    // Create epic death particles
    if (this.particleSystem) {
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        
        this.particleSystem.emit('custom', {
          position: new THREE.Vector3(
            this.transform.position.x,
            this.transform.position.y + 1,
            this.transform.position.z
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            Math.random() * 15,
            Math.sin(angle) * speed
          ),
          color: new THREE.Color(Math.random(), Math.random(), Math.random()),
          size: 0.5 + Math.random(),
          lifetime: 3,
          gravity: true,
          fadeOut: true,
          shrink: true
        });
      }
    }
  }
  
  // Override takeDamage to notify boss manager
  public takeDamage(damage: number): void {
    // Reduce damage in armor phases
    if (this.phase === 1) {
      damage *= 0.8; // 20% damage reduction
    }
    
    super.takeDamage(damage);
    
    // Notify boss manager for UI updates
    if ((window as any).bossManager) {
      (window as any).bossManager.onBossDamaged(this, damage);
    }
  }
  
  // Get audio manager reference
  private getAudioManager(): AudioManager | null {
    return (this as any).audioManager || null;
  }
  
  // Additional getters for UI
  public getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }
  
  public getPhaseInfo(): { phase: number; name: string } {
    const phaseNames = ['Normal', 'Enraged', 'Berserk'];
    return {
      phase: this.phase,
      name: phaseNames[this.phase - 1] || 'Unknown'
    };
  }
}