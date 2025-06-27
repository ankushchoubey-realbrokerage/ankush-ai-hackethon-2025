import * as THREE from 'three';
import { Entity, Vector3 } from '../../types';

export interface ConveyorBeltConfig {
  position: Vector3;
  dimensions: Vector3;
  direction: Vector3;
  speed?: number;
  textureRepeat?: number;
}

export class ConveyorBelt {
  private mesh: THREE.Mesh;
  private bounds: THREE.Box3;
  private direction: THREE.Vector3;
  private speed: number;
  private textureOffset: number = 0;
  private material: THREE.MeshStandardMaterial;
  private arrowHelpers: THREE.ArrowHelper[] = [];
  
  constructor(config: ConveyorBeltConfig) {
    const {
      position,
      dimensions,
      direction,
      speed = 3,
      textureRepeat = 5
    } = config;
    
    this.speed = speed;
    this.direction = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();
    
    // Create conveyor belt mesh
    const geometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
    
    // Create animated material
    this.material = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.7,
      roughness: 0.3,
      map: this.createConveyorTexture(textureRepeat)
    });
    
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Calculate bounds
    this.bounds = new THREE.Box3().setFromObject(this.mesh);
    
    // Add visual direction indicators
    this.createDirectionArrows();
  }
  
  private createConveyorTexture(repeat: number): THREE.Texture {
    // Create a simple striped texture for the conveyor
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, 256, 256);
    
    // Stripes
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(0, i * 32, 256, 16);
    }
    
    // Arrows
    ctx.fillStyle = '#999999';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) {
      ctx.fillText('▶', 128, 32 + i * 64);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, 1);
    
    return texture;
  }
  
  private createDirectionArrows(): void {
    // Create arrow helpers to show conveyor direction
    const arrowLength = 2;
    const arrowColor = 0x00ff00;
    
    // Place arrows along the conveyor
    const numArrows = 3;
    const bounds = this.bounds;
    const size = new THREE.Vector3();
    bounds.getSize(size);
    
    for (let i = 0; i < numArrows; i++) {
      const t = (i + 0.5) / numArrows;
      const arrowPos = new THREE.Vector3(
        bounds.min.x + size.x * t,
        bounds.max.y + 0.5,
        (bounds.min.z + bounds.max.z) / 2
      );
      
      const arrow = new THREE.ArrowHelper(
        this.direction,
        arrowPos,
        arrowLength,
        arrowColor,
        arrowLength * 0.3,
        arrowLength * 0.2
      );
      
      this.arrowHelpers.push(arrow);
    }
  }
  
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }
  
  public getArrows(): THREE.ArrowHelper[] {
    return this.arrowHelpers;
  }
  
  public update(deltaTime: number): void {
    // Animate texture to show movement
    if (this.material.map) {
      this.textureOffset += this.speed * deltaTime * 0.1;
      this.material.map.offset.x = this.textureOffset;
    }
  }
  
  public applyMovement(entity: Entity, deltaTime: number): void {
    if (this.isEntityOn(entity)) {
      // Apply conveyor movement
      entity.transform.position.x += this.direction.x * this.speed * deltaTime;
      entity.transform.position.z += this.direction.z * this.speed * deltaTime;
      
      // Update velocity for physics calculations
      if ('velocity' in entity) {
        (entity as any).velocity.x += this.direction.x * this.speed * 0.5;
        (entity as any).velocity.z += this.direction.z * this.speed * 0.5;
      }
    }
  }
  
  private isEntityOn(entity: Entity): boolean {
    // Check if entity is on the conveyor belt
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
    
    // Check if entity is above the belt and intersecting horizontally
    const onTop = entityBox.min.y <= this.bounds.max.y + 0.1 && 
                  entityBox.min.y >= this.bounds.max.y - 0.5;
    const intersectsHorizontally = entityBox.intersectsBox(this.bounds);
    
    return onTop && intersectsHorizontally;
  }
  
  public getBounds(): THREE.Box3 {
    return this.bounds.clone();
  }
  
  public getDirection(): Vector3 {
    return {
      x: this.direction.x,
      y: this.direction.y,
      z: this.direction.z
    };
  }
  
  public setSpeed(speed: number): void {
    this.speed = speed;
  }
  
  public reverse(): void {
    this.direction.multiplyScalar(-1);
    // Update arrow directions
    this.arrowHelpers.forEach(arrow => {
      arrow.setDirection(this.direction);
    });
  }
}