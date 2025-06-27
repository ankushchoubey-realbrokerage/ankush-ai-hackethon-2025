import * as THREE from 'three';

export interface ParticleConfig {
  position: THREE.Vector3;
  velocity?: THREE.Vector3;
  color: THREE.Color;
  size: number;
  lifetime: number;
  gravity?: boolean;
  fadeOut?: boolean;
  shrink?: boolean;
}

export interface ParticleEffectConfig {
  count: number;
  emitPosition: THREE.Vector3;
  emitDirection?: THREE.Vector3;
  spread: number;
  speed: number;
  speedVariation: number;
  color: THREE.Color;
  colorVariation?: number;
  size: number;
  sizeVariation: number;
  lifetime: number;
  lifetimeVariation: number;
  gravity?: boolean;
  fadeOut?: boolean;
  shrink?: boolean;
}

class Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  lifetime: number;
  maxLifetime: number;
  gravity: boolean;
  fadeOut: boolean;
  shrink: boolean;
  active: boolean;
  initialSize: number;
  
  constructor() {
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.color = new THREE.Color();
    this.size = 1;
    this.lifetime = 0;
    this.maxLifetime = 1;
    this.gravity = false;
    this.fadeOut = true;
    this.shrink = false;
    this.active = false;
    this.initialSize = 1;
  }
  
  init(config: ParticleConfig): void {
    this.position.copy(config.position);
    this.velocity.copy(config.velocity || new THREE.Vector3());
    this.color.copy(config.color);
    this.size = config.size;
    this.initialSize = config.size;
    this.lifetime = config.lifetime;
    this.maxLifetime = config.lifetime;
    this.gravity = config.gravity || false;
    this.fadeOut = config.fadeOut !== false;
    this.shrink = config.shrink || false;
    this.active = true;
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
      return;
    }
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Apply gravity
    if (this.gravity) {
      this.velocity.y -= 9.8 * deltaTime;
    }
    
    // Calculate life ratio
    const lifeRatio = this.lifetime / this.maxLifetime;
    
    // Shrink over time
    if (this.shrink) {
      this.size = this.initialSize * lifeRatio;
    }
  }
  
  getOpacity(): number {
    if (!this.fadeOut || !this.active) return this.active ? 1 : 0;
    return this.lifetime / this.maxLifetime;
  }
}

export class ParticleSystem {
  private particlePool: Particle[] = [];
  private activeParticles: Set<Particle> = new Set();
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private maxParticles: number;
  
  constructor(scene: THREE.Scene, maxParticles: number = 1000) {
    this.maxParticles = maxParticles;
    
    // Initialize particle pool
    for (let i = 0; i < maxParticles; i++) {
      this.particlePool.push(new Particle());
    }
    
    // Initialize geometry buffers
    this.positions = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3);
    this.sizes = new Float32Array(maxParticles);
    
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    
    // Create material with vertex colors and sizes
    this.material = new THREE.PointsMaterial({
      size: 1,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }
  
  private getInactiveParticle(): Particle | null {
    for (const particle of this.particlePool) {
      if (!particle.active) {
        return particle;
      }
    }
    return null;
  }
  
  emit(type: 'muzzleFlash' | 'blood' | 'custom', config: ParticleConfig | ParticleEffectConfig): void {
    if ('count' in config) {
      // Handle ParticleEffectConfig
      this.emitEffect(type, config as ParticleEffectConfig);
    } else {
      // Handle single ParticleConfig
      const particle = this.getInactiveParticle();
      if (particle) {
        particle.init(config as ParticleConfig);
        this.activeParticles.add(particle);
      }
    }
  }
  
  private emitEffect(type: string, config: ParticleEffectConfig): void {
    let effectConfig: ParticleEffectConfig;
    
    switch (type) {
      case 'muzzleFlash':
        effectConfig = {
          ...config,
          count: 10,
          spread: 0.1,
          speed: 5,
          speedVariation: 2,
          color: new THREE.Color(1, 1, 0.5),
          size: 0.3,
          sizeVariation: 0.1,
          lifetime: 0.1,
          lifetimeVariation: 0.05,
          gravity: false,
          fadeOut: true,
          shrink: true,
        };
        break;
        
      case 'blood':
        effectConfig = {
          ...config,
          count: 20,
          spread: 0.5,
          speed: 3,
          speedVariation: 1,
          color: new THREE.Color(0.5, 0, 0),
          size: 0.1,
          sizeVariation: 0.05,
          lifetime: 1.5,
          lifetimeVariation: 0.5,
          gravity: true,
          fadeOut: true,
          shrink: false,
        };
        break;
        
      default:
        effectConfig = config;
    }
    
    const direction = effectConfig.emitDirection || new THREE.Vector3(0, 1, 0);
    
    for (let i = 0; i < effectConfig.count; i++) {
      const particle = this.getInactiveParticle();
      if (!particle) break;
      
      // Calculate random spread
      const spreadAngle = effectConfig.spread * (Math.random() - 0.5) * Math.PI;
      const rotationAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      
      const velocity = direction.clone()
        .applyAxisAngle(rotationAxis, spreadAngle)
        .multiplyScalar(effectConfig.speed + (Math.random() - 0.5) * effectConfig.speedVariation);
      
      // Apply color variation
      const color = effectConfig.color.clone();
      if (effectConfig.colorVariation) {
        const variation = effectConfig.colorVariation;
        color.r = Math.max(0, Math.min(1, color.r + (Math.random() - 0.5) * variation));
        color.g = Math.max(0, Math.min(1, color.g + (Math.random() - 0.5) * variation));
        color.b = Math.max(0, Math.min(1, color.b + (Math.random() - 0.5) * variation));
      }
      
      particle.init({
        position: effectConfig.emitPosition.clone(),
        velocity: velocity,
        color: color,
        size: effectConfig.size + (Math.random() - 0.5) * effectConfig.sizeVariation,
        lifetime: effectConfig.lifetime + (Math.random() - 0.5) * effectConfig.lifetimeVariation,
        gravity: effectConfig.gravity,
        fadeOut: effectConfig.fadeOut,
        shrink: effectConfig.shrink,
      });
      
      this.activeParticles.add(particle);
    }
  }
  
  update(deltaTime: number): void {
    let particleIndex = 0;
    
    // Update active particles and build geometry buffers
    for (const particle of this.activeParticles) {
      particle.update(deltaTime);
      
      if (!particle.active) {
        this.activeParticles.delete(particle);
        continue;
      }
      
      // Update buffers
      const i3 = particleIndex * 3;
      this.positions[i3] = particle.position.x;
      this.positions[i3 + 1] = particle.position.y;
      this.positions[i3 + 2] = particle.position.z;
      
      const opacity = particle.getOpacity();
      this.colors[i3] = particle.color.r * opacity;
      this.colors[i3 + 1] = particle.color.g * opacity;
      this.colors[i3 + 2] = particle.color.b * opacity;
      
      this.sizes[particleIndex] = particle.size;
      
      particleIndex++;
    }
    
    // Clear remaining buffer space
    for (let i = particleIndex; i < this.maxParticles; i++) {
      const i3 = i * 3;
      this.positions[i3] = 0;
      this.positions[i3 + 1] = 0;
      this.positions[i3 + 2] = -1000; // Move inactive particles far away
      this.sizes[i] = 0;
    }
    
    // Update geometry
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    
    // Update draw range
    this.geometry.setDrawRange(0, particleIndex);
  }
  
  clear(): void {
    for (const particle of this.activeParticles) {
      particle.active = false;
    }
    this.activeParticles.clear();
    this.update(0);
  }
  
  dispose(): void {
    this.clear();
    this.geometry.dispose();
    this.material.dispose();
    if (this.points.parent) {
      this.points.parent.remove(this.points);
    }
  }
  
  getActiveParticleCount(): number {
    return this.activeParticles.size;
  }
}