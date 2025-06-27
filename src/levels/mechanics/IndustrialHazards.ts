import * as THREE from 'three';
import { Entity, Vector3 } from '../../types';
import { ParticleSystem } from '../../effects/ParticleSystem';
import { AudioManager } from '../../core/audio/AudioManager';

export interface HazardConfig {
  position: Vector3;
  type: 'steam_vent' | 'crusher' | 'electrical' | 'toxic_pool';
  damage: number;
  interval?: number;
  dimensions?: Vector3;
}

export abstract class IndustrialHazard {
  protected position: Vector3;
  protected damage: number;
  protected mesh: THREE.Group;
  protected active: boolean = true;
  protected bounds: THREE.Box3;
  protected audioManager: AudioManager | null = null;
  
  constructor(config: HazardConfig) {
    this.position = config.position;
    this.damage = config.damage;
    this.mesh = new THREE.Group();
    this.bounds = new THREE.Box3();
  }
  
  public setAudioManager(audioManager: AudioManager): void {
    this.audioManager = audioManager;
  }
  
  abstract update(deltaTime: number): void;
  abstract checkCollision(entity: Entity): boolean;
  abstract applyEffect(entity: Entity): void;
  
  public getMesh(): THREE.Group {
    return this.mesh;
  }
  
  public setActive(active: boolean): void {
    this.active = active;
  }
}

export class SteamVent extends IndustrialHazard {
  private timer: number = 0;
  private interval: number;
  private duration: number = 2; // Steam lasts 2 seconds
  private isSteaming: boolean = false;
  private steamParticles: THREE.Points | null = null;
  private particleSystem: ParticleSystem | null = null;
  
  constructor(config: HazardConfig) {
    super(config);
    this.interval = config.interval || 5; // Default 5 seconds between bursts
    
    this.createMesh();
  }
  
  private createMesh(): void {
    // Base vent
    const ventGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.3, 8);
    const ventMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    const vent = new THREE.Mesh(ventGeometry, ventMaterial);
    vent.position.set(this.position.x, this.position.y, this.position.z);
    vent.castShadow = true;
    this.mesh.add(vent);
    
    // Warning light
    const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(this.position.x, this.position.y + 0.3, this.position.z);
    this.mesh.add(light);
    
    // Set bounds for collision
    this.bounds.setFromCenterAndSize(
      new THREE.Vector3(this.position.x, this.position.y + 2, this.position.z),
      new THREE.Vector3(2, 4, 2)
    );
  }
  
  public setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.timer += deltaTime;
    
    if (!this.isSteaming && this.timer >= this.interval) {
      this.startSteam();
    }
    
    if (this.isSteaming && this.timer >= this.duration) {
      this.stopSteam();
      this.timer = 0;
    }
    
    // Update steam particles
    if (this.isSteaming && this.particleSystem) {
      // Emit steam particles
      for (let i = 0; i < 5; i++) {
        const particleConfig = {
          position: new THREE.Vector3(
            this.position.x + (Math.random() - 0.5) * 0.5,
            this.position.y + 0.2,
            this.position.z + (Math.random() - 0.5) * 0.5
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            3 + Math.random() * 2,
            (Math.random() - 0.5) * 0.5
          ),
          color: new THREE.Color(0xcccccc),
          size: 0.5 + Math.random() * 0.5,
          lifetime: 2,
          gravity: false,
          fadeOut: true,
          shrink: true
        };
        this.particleSystem.emit('custom', particleConfig);
      }
    }
  }
  
  private startSteam(): void {
    this.isSteaming = true;
    this.timer = 0;
    
    // Make warning light blink
    const light = this.mesh.children[1] as THREE.Mesh;
    if (light && light.material) {
      (light.material as THREE.MeshStandardMaterial).emissiveIntensity = 1;
    }
    
    // Play steam sound
    if (this.audioManager) {
      this.audioManager.playSteamHiss(this.position);
    }
  }
  
  private stopSteam(): void {
    this.isSteaming = false;
    
    // Turn off warning light
    const light = this.mesh.children[1] as THREE.Mesh;
    if (light && light.material) {
      (light.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
    }
  }
  
  checkCollision(entity: Entity): boolean {
    if (!this.isSteaming || !this.active) return false;
    
    const entityBox = new THREE.Box3(
      new THREE.Vector3(
        entity.transform.position.x + entity.boundingBox.min.x,
        entity.transform.position.y + entity.boundingBox.min.y,
        entity.transform.position.z + entity.boundingBox.min.z
      ),
      new THREE.Vector3(
        entity.transform.position.x + entity.boundingBox.max.x,
        entity.transform.position.y + entity.boundingBox.max.y,
        entity.transform.position.z + entity.boundingBox.max.z
      )
    );
    
    return entityBox.intersectsBox(this.bounds);
  }
  
  applyEffect(entity: Entity): void {
    if ('takeDamage' in entity) {
      (entity as any).takeDamage(this.damage);
    }
  }
}

export class Crusher extends IndustrialHazard {
  private timer: number = 0;
  private interval: number;
  private crushDuration: number = 0.5;
  private isCrushing: boolean = false;
  private crusherMesh: THREE.Mesh;
  private originalY: number;
  
  constructor(config: HazardConfig) {
    super(config);
    this.interval = config.interval || 3;
    this.damage = 1000; // Instant death
    
    this.createMesh();
    this.originalY = this.position.y + 3;
  }
  
  private createMesh(): void {
    // Base platform
    const baseGeometry = new THREE.BoxGeometry(3, 0.5, 3);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(this.position.x, this.position.y, this.position.z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.mesh.add(base);
    
    // Crusher head
    const crusherGeometry = new THREE.BoxGeometry(2.8, 2, 2.8);
    const crusherMaterial = new THREE.MeshStandardMaterial({
      color: 0x883333,
      metalness: 0.8,
      roughness: 0.2
    });
    this.crusherMesh = new THREE.Mesh(crusherGeometry, crusherMaterial);
    this.crusherMesh.position.set(this.position.x, this.originalY, this.position.z);
    this.crusherMesh.castShadow = true;
    this.mesh.add(this.crusherMesh);
    
    // Warning stripes
    const stripeGeometry = new THREE.PlaneGeometry(3, 0.2);
    const stripeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.set(
        this.position.x,
        this.position.y + 0.26,
        this.position.z + 1.3 - i * 0.8
      );
      stripe.rotation.x = -Math.PI / 2;
      this.mesh.add(stripe);
    }
    
    // Set collision bounds
    this.bounds.setFromCenterAndSize(
      new THREE.Vector3(this.position.x, this.position.y + 0.5, this.position.z),
      new THREE.Vector3(2.5, 1, 2.5)
    );
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.timer += deltaTime;
    
    if (!this.isCrushing && this.timer >= this.interval) {
      this.startCrush();
    }
    
    if (this.isCrushing) {
      const crushProgress = Math.min(this.timer / this.crushDuration, 1);
      
      if (crushProgress < 0.5) {
        // Crushing down
        const t = crushProgress * 2;
        this.crusherMesh.position.y = this.originalY - t * (this.originalY - this.position.y - 0.5);
      } else {
        // Returning up
        const t = (crushProgress - 0.5) * 2;
        this.crusherMesh.position.y = this.position.y + 0.5 + t * (this.originalY - this.position.y - 0.5);
      }
      
      if (crushProgress >= 1) {
        this.isCrushing = false;
        this.timer = 0;
      }
    }
  }
  
  private startCrush(): void {
    this.isCrushing = true;
    this.timer = 0;
    
    // Play metal clank sound
    if (this.audioManager) {
      this.audioManager.playMetalClank(this.position);
    }
  }
  
  checkCollision(entity: Entity): boolean {
    if (!this.active) return false;
    
    // Check if entity is under the crusher when it's coming down
    if (this.isCrushing && this.timer < this.crushDuration * 0.5) {
      const entityBox = new THREE.Box3(
        new THREE.Vector3(
          entity.transform.position.x + entity.boundingBox.min.x,
          entity.transform.position.y + entity.boundingBox.min.y,
          entity.transform.position.z + entity.boundingBox.min.z
        ),
        new THREE.Vector3(
          entity.transform.position.x + entity.boundingBox.max.x,
          entity.transform.position.y + entity.boundingBox.max.y,
          entity.transform.position.z + entity.boundingBox.max.z
        )
      );
      
      return entityBox.intersectsBox(this.bounds);
    }
    
    return false;
  }
  
  applyEffect(entity: Entity): void {
    if ('takeDamage' in entity) {
      (entity as any).takeDamage(this.damage);
    }
  }
}

export class ElectricalHazard extends IndustrialHazard {
  private timer: number = 0;
  private interval: number;
  private shockDuration: number = 1;
  private isElectrified: boolean = false;
  private electricEffects: THREE.Line[] = [];
  
  constructor(config: HazardConfig) {
    super(config);
    this.interval = config.interval || 4;
    this.damage = config.damage || 20;
    
    this.createMesh();
  }
  
  private createMesh(): void {
    // Electrical panel
    const panelGeometry = new THREE.BoxGeometry(2, 3, 0.5);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.6,
      roughness: 0.4
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.set(this.position.x, this.position.y + 1.5, this.position.z);
    panel.castShadow = true;
    this.mesh.add(panel);
    
    // Warning sign
    const signGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const signMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      map: this.createWarningTexture()
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.set(this.position.x, this.position.y + 2, this.position.z + 0.26);
    this.mesh.add(sign);
    
    // Set bounds
    this.bounds.setFromCenterAndSize(
      new THREE.Vector3(this.position.x, this.position.y + 1, this.position.z + 1),
      new THREE.Vector3(3, 3, 3)
    );
  }
  
  private createWarningTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    
    // Yellow background
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(0, 0, 128, 128);
    
    // Black lightning bolt
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(64, 10);
    ctx.lineTo(45, 60);
    ctx.lineTo(60, 60);
    ctx.lineTo(50, 118);
    ctx.lineTo(70, 60);
    ctx.lineTo(85, 60);
    ctx.closePath();
    ctx.fill();
    
    return new THREE.CanvasTexture(canvas);
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.timer += deltaTime;
    
    if (!this.isElectrified && this.timer >= this.interval) {
      this.startElectricity();
    }
    
    if (this.isElectrified) {
      // Update electrical arcs
      this.updateElectricArcs();
      
      if (this.timer >= this.shockDuration) {
        this.stopElectricity();
        this.timer = 0;
      }
    }
  }
  
  private startElectricity(): void {
    this.isElectrified = true;
    this.timer = 0;
    
    // Create electrical arc effects
    for (let i = 0; i < 3; i++) {
      const points = [];
      const start = new THREE.Vector3(
        this.position.x + (Math.random() - 0.5) * 2,
        this.position.y + Math.random() * 3,
        this.position.z + 0.3
      );
      points.push(start);
      
      // Create jagged line
      for (let j = 0; j < 5; j++) {
        const prev = points[points.length - 1];
        points.push(new THREE.Vector3(
          prev.x + (Math.random() - 0.5) * 0.5,
          prev.y + (Math.random() - 0.5) * 0.5,
          prev.z + Math.random() * 0.5
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00aaff,
        linewidth: 2,
        transparent: true,
        opacity: 0.8
      });
      const arc = new THREE.Line(geometry, material);
      this.electricEffects.push(arc);
      this.mesh.add(arc);
    }
  }
  
  private updateElectricArcs(): void {
    // Make arcs flicker
    this.electricEffects.forEach(arc => {
      (arc.material as THREE.LineBasicMaterial).opacity = 0.4 + Math.random() * 0.6;
      arc.visible = Math.random() > 0.1;
    });
  }
  
  private stopElectricity(): void {
    this.isElectrified = false;
    
    // Remove electrical effects
    this.electricEffects.forEach(arc => {
      this.mesh.remove(arc);
    });
    this.electricEffects = [];
  }
  
  checkCollision(entity: Entity): boolean {
    if (!this.isElectrified || !this.active) return false;
    
    const entityBox = new THREE.Box3(
      new THREE.Vector3(
        entity.transform.position.x + entity.boundingBox.min.x,
        entity.transform.position.y + entity.boundingBox.min.y,
        entity.transform.position.z + entity.boundingBox.min.z
      ),
      new THREE.Vector3(
        entity.transform.position.x + entity.boundingBox.max.x,
        entity.transform.position.y + entity.boundingBox.max.y,
        entity.transform.position.z + entity.boundingBox.max.z
      )
    );
    
    return entityBox.intersectsBox(this.bounds);
  }
  
  applyEffect(entity: Entity): void {
    if ('takeDamage' in entity) {
      (entity as any).takeDamage(this.damage);
      
      // Apply stun effect
      if ('velocity' in entity) {
        (entity as any).velocity.x *= 0.1;
        (entity as any).velocity.z *= 0.1;
      }
    }
  }
}

export class ToxicPool extends IndustrialHazard {
  private bubbleTimer: number = 0;
  private particleSystem: ParticleSystem | null = null;
  
  constructor(config: HazardConfig) {
    super(config);
    this.damage = config.damage || 5; // Damage per second
    
    const dimensions = config.dimensions || { x: 4, y: 0.2, z: 4 };
    this.createMesh(dimensions);
  }
  
  private createMesh(dimensions: Vector3): void {
    // Toxic liquid
    const poolGeometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
    const poolMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
      emissive: 0x00ff00,
      emissiveIntensity: 0.2
    });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.position.set(this.position.x, this.position.y, this.position.z);
    pool.receiveShadow = true;
    this.mesh.add(pool);
    
    // Set bounds
    this.bounds.setFromObject(pool);
  }
  
  public setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.bubbleTimer += deltaTime;
    
    // Emit toxic bubbles
    if (this.particleSystem && this.bubbleTimer > 0.2) {
      this.bubbleTimer = 0;
      
      const bounds = this.bounds;
      const size = new THREE.Vector3();
      bounds.getSize(size);
      
      // Random bubble position
      const x = bounds.min.x + Math.random() * size.x;
      const z = bounds.min.z + Math.random() * size.z;
      
      const particleConfig = {
        position: new THREE.Vector3(x, this.position.y + 0.1, z),
        velocity: new THREE.Vector3(0, 0.5 + Math.random() * 0.5, 0),
        color: new THREE.Color(0x00ff00),
        size: 0.1 + Math.random() * 0.2,
        lifetime: 1 + Math.random(),
        gravity: false,
        fadeOut: true,
        shrink: false
      };
      this.particleSystem.emit('custom', particleConfig);
    }
  }
  
  checkCollision(entity: Entity): boolean {
    if (!this.active) return false;
    
    const entityBox = new THREE.Box3(
      new THREE.Vector3(
        entity.transform.position.x + entity.boundingBox.min.x,
        entity.transform.position.y + entity.boundingBox.min.y,
        entity.transform.position.z + entity.boundingBox.min.z
      ),
      new THREE.Vector3(
        entity.transform.position.x + entity.boundingBox.max.x,
        entity.transform.position.y + entity.boundingBox.max.y,
        entity.transform.position.z + entity.boundingBox.max.z
      )
    );
    
    return entityBox.intersectsBox(this.bounds);
  }
  
  applyEffect(entity: Entity): void {
    // Apply damage over time (called each frame while in pool)
    if ('takeDamage' in entity) {
      (entity as any).takeDamage(this.damage * 0.016); // Assuming 60 FPS
    }
  }
}