import { Entity, DamagableEntity, Vector3 } from '../../types';
import { HazardZone } from './HazardZone';
import * as THREE from 'three';

// STEP 36: Damage zone implementation

export class DamageZone extends HazardZone {
  private damagePerSecond: number;
  private damageType: string;
  private visualMesh: THREE.Mesh | null = null;
  private scene: THREE.Scene | null = null;
  private allEntities: Entity[] = [];
  
  constructor(
    id: string,
    position: Vector3,
    dimensions: Vector3,
    damagePerSecond: number = 10,
    damageType: string = 'environmental'
  ) {
    super(id, 'damage', position, dimensions);
    this.damagePerSecond = damagePerSecond;
    this.damageType = damageType;
  }
  
  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    this.createVisualIndicator();
  }
  
  private createVisualIndicator(): void {
    if (!this.scene) return;
    
    const geometry = new THREE.BoxGeometry(
      this.bounds.max.x - this.bounds.min.x,
      this.bounds.max.y - this.bounds.min.y,
      this.bounds.max.z - this.bounds.min.z
    );
    
    const material = new THREE.MeshBasicMaterial({
      color: this.getVisualIndicator().color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    this.visualMesh = new THREE.Mesh(geometry, material);
    this.visualMesh.position.copy(this.position as THREE.Vector3);
    this.scene.add(this.visualMesh);
    
    // Add pulsing animation
    this.animateVisual();
  }
  
  private animateVisual(): void {
    if (!this.visualMesh) return;
    
    const animate = () => {
      if (!this.visualMesh || !this.active) return;
      
      const time = Date.now() * 0.001;
      const opacity = 0.2 + Math.sin(time * 2) * 0.1;
      (this.visualMesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  setEntities(entities: Entity[]): void {
    this.allEntities = entities;
  }
  
  protected getCurrentEntitiesInZone(): Entity[] {
    return this.allEntities.filter(entity => this.checkCollision(entity));
  }
  
  onEnter(entity: Entity): void {
    console.log(`Entity ${entity.id} entered damage zone ${this.id}`);
  }
  
  onStay(entity: Entity, deltaTime: number): void {
    if ('health' in entity) {
      const damagableEntity = entity as DamagableEntity;
      const damage = this.damagePerSecond * deltaTime;
      
      // Check for fire-resistant zombies
      if ('zombieType' in entity && (entity as any).zombieType === 'fire-resistant' && 
          (this.damageType === 'fire' || this.damageType === 'lava')) {
        // Fire-resistant zombies are immune to fire/lava damage
        return;
      }
      
      damagableEntity.health -= damage;
      if (damagableEntity.health <= 0) {
        damagableEntity.health = 0;
        damagableEntity.isDead = true;
      }
    }
  }
  
  onExit(entity: Entity): void {
    console.log(`Entity ${entity.id} left damage zone ${this.id}`);
  }
  
  getVisualIndicator(): { color: number; intensity: number } {
    switch (this.damageType) {
      case 'fire':
      case 'lava':
        return { color: 0xff4400, intensity: 0.8 };
      case 'acid':
        return { color: 0x00ff00, intensity: 0.6 };
      case 'electricity':
        return { color: 0x00ffff, intensity: 0.9 };
      default:
        return { color: 0xff0000, intensity: 0.5 };
    }
  }
  
  cleanup(): void {
    super.cleanup();
    if (this.visualMesh && this.scene) {
      this.scene.remove(this.visualMesh);
      this.visualMesh.geometry.dispose();
      (this.visualMesh.material as THREE.Material).dispose();
    }
  }
}