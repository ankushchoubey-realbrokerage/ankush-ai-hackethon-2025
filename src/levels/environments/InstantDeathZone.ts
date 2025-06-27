import { Entity, DamagableEntity, Vector3 } from '../../types';
import { HazardZone } from './HazardZone';
import * as THREE from 'three';

// STEP 36: Instant death zone implementation (bottomless pits, crushers)

export class InstantDeathZone extends HazardZone {
  private visualMesh: THREE.Mesh | null = null;
  private warningMeshes: THREE.Mesh[] = [];
  private scene: THREE.Scene | null = null;
  private allEntities: Entity[] = [];
  private deathType: 'pit' | 'crusher' | 'void';
  
  constructor(
    id: string,
    position: Vector3,
    dimensions: Vector3,
    deathType: 'pit' | 'crusher' | 'void' = 'pit'
  ) {
    super(id, 'instant_death', position, dimensions);
    this.deathType = deathType;
    this.warningDistance = 5; // Larger warning distance for instant death
  }
  
  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    this.createVisualIndicator();
    this.createWarningIndicators();
  }
  
  private createVisualIndicator(): void {
    if (!this.scene) return;
    
    if (this.deathType === 'pit') {
      // Create dark pit visual
      const geometry = new THREE.BoxGeometry(
        this.bounds.max.x - this.bounds.min.x,
        0.1,
        this.bounds.max.z - this.bounds.min.z
      );
      
      const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.9
      });
      
      this.visualMesh = new THREE.Mesh(geometry, material);
      this.visualMesh.position.set(
        this.position.x,
        this.bounds.min.y,
        this.position.z
      );
      this.scene.add(this.visualMesh);
    }
  }
  
  private createWarningIndicators(): void {
    if (!this.scene) return;
    
    // Create warning signs around the hazard
    const signPositions = [
      { x: this.bounds.min.x - 1, z: this.position.z },
      { x: this.bounds.max.x + 1, z: this.position.z },
      { x: this.position.x, z: this.bounds.min.z - 1 },
      { x: this.position.x, z: this.bounds.max.z + 1 }
    ];
    
    signPositions.forEach(pos => {
      // Create warning sign post
      const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
      const postMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
      const post = new THREE.Mesh(postGeometry, postMaterial);
      post.position.set(pos.x, this.position.y + 0.75, pos.z);
      this.scene!.add(post);
      this.warningMeshes.push(post);
      
      // Create warning sign
      const signGeometry = new THREE.PlaneGeometry(0.5, 0.5);
      const signMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide
      });
      const sign = new THREE.Mesh(signGeometry, signMaterial);
      sign.position.set(pos.x, this.position.y + 1.5, pos.z);
      
      // Face sign towards hazard
      sign.lookAt(new THREE.Vector3(this.position.x, this.position.y + 1.5, this.position.z));
      
      this.scene!.add(sign);
      this.warningMeshes.push(sign);
      
      // Add "!" text (would need TextGeometry in real implementation)
    });
  }
  
  setEntities(entities: Entity[]): void {
    this.allEntities = entities;
  }
  
  protected getCurrentEntitiesInZone(): Entity[] {
    return this.allEntities.filter(entity => this.checkCollision(entity));
  }
  
  onEnter(entity: Entity): void {
    console.log(`Entity ${entity.id} entered instant death zone ${this.id}!`);
    
    if ('health' in entity) {
      const damagableEntity = entity as DamagableEntity;
      damagableEntity.health = 0;
      damagableEntity.isDead = true;
      console.log(`Entity ${entity.id} instantly killed by ${this.deathType}`);
    }
  }
  
  onStay(entity: Entity, deltaTime: number): void {
    // Ensure entity is dead (in case it somehow survived)
    if ('health' in entity && !(entity as DamagableEntity).isDead) {
      this.onEnter(entity);
    }
  }
  
  onExit(entity: Entity): void {
    // Entities don't usually exit instant death zones alive
  }
  
  getVisualIndicator(): { color: number; intensity: number } {
    return { color: 0x000000, intensity: 1.0 };
  }
  
  shouldShowWarning(entity: Entity): boolean {
    // Always show warning when near instant death
    return super.shouldShowWarning(entity) && entity.type === 'player';
  }
  
  cleanup(): void {
    super.cleanup();
    
    if (this.scene) {
      if (this.visualMesh) {
        this.scene.remove(this.visualMesh);
        this.visualMesh.geometry.dispose();
        (this.visualMesh.material as THREE.Material).dispose();
      }
      
      this.warningMeshes.forEach(mesh => {
        this.scene!.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
    }
    
    this.warningMeshes = [];
  }
}