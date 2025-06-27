import { Entity, Vector3 } from '../../types';
import { IHazard, HazardType, HazardEntityState } from './IHazard';
import { BoundingBox } from './LavaHazard';

// STEP 36: Base hazard zone implementation

export abstract class HazardZone implements IHazard {
  id: string;
  type: HazardType;
  position: Vector3;
  bounds: BoundingBox;
  active: boolean = true;
  
  protected entitiesInZone: Map<string, HazardEntityState> = new Map();
  protected warningDistance: number = 3; // Units from hazard edge
  
  constructor(id: string, type: HazardType, position: Vector3, dimensions: Vector3) {
    this.id = id;
    this.type = type;
    this.position = position;
    
    // Calculate bounding box
    this.bounds = {
      min: {
        x: position.x - dimensions.x / 2,
        y: position.y - dimensions.y / 2,
        z: position.z - dimensions.z / 2
      },
      max: {
        x: position.x + dimensions.x / 2,
        y: position.y + dimensions.y / 2,
        z: position.z + dimensions.z / 2
      }
    };
  }
  
  checkCollision(entity: Entity): boolean {
    if (!this.active) return false;
    
    const pos = entity.transform.position;
    return (
      pos.x >= this.bounds.min.x &&
      pos.x <= this.bounds.max.x &&
      pos.y >= this.bounds.min.y - 0.5 && // Allow some height tolerance
      pos.y <= this.bounds.max.y + 1 &&
      pos.z >= this.bounds.min.z &&
      pos.z <= this.bounds.max.z
    );
  }
  
  update(deltaTime: number): void {
    if (!this.active) return;
    
    // Track entities entering/leaving/staying in zone
    const currentEntities = this.getCurrentEntitiesInZone();
    
    // Check for new entries
    currentEntities.forEach(entity => {
      if (!this.entitiesInZone.has(entity.id)) {
        const state: HazardEntityState = {
          entityId: entity.id,
          timeEntered: Date.now(),
          lastUpdateTime: Date.now()
        };
        this.entitiesInZone.set(entity.id, state);
        this.onEnter?.(entity);
      } else {
        // Entity is staying in zone
        const state = this.entitiesInZone.get(entity.id)!;
        const timeSinceLastUpdate = (Date.now() - state.lastUpdateTime) / 1000;
        state.lastUpdateTime = Date.now();
        this.onStay?.(entity, timeSinceLastUpdate);
      }
    });
    
    // Check for exits
    this.entitiesInZone.forEach((state, entityId) => {
      const stillInZone = currentEntities.some(e => e.id === entityId);
      if (!stillInZone) {
        this.entitiesInZone.delete(entityId);
        // Note: We don't have entity reference here, would need to track it
      }
    });
  }
  
  shouldShowWarning(entity: Entity): boolean {
    if (!this.active) return false;
    
    // Check if entity is near but not in hazard
    const pos = entity.transform.position;
    const expandedBounds = {
      min: {
        x: this.bounds.min.x - this.warningDistance,
        y: this.bounds.min.y - this.warningDistance,
        z: this.bounds.min.z - this.warningDistance
      },
      max: {
        x: this.bounds.max.x + this.warningDistance,
        y: this.bounds.max.y + this.warningDistance,
        z: this.bounds.max.z + this.warningDistance
      }
    };
    
    const nearHazard = (
      pos.x >= expandedBounds.min.x &&
      pos.x <= expandedBounds.max.x &&
      pos.y >= expandedBounds.min.y &&
      pos.y <= expandedBounds.max.y &&
      pos.z >= expandedBounds.min.z &&
      pos.z <= expandedBounds.max.z
    );
    
    return nearHazard && !this.checkCollision(entity);
  }
  
  cleanup(): void {
    this.entitiesInZone.clear();
  }
  
  // Override in subclasses to get actual entities
  protected abstract getCurrentEntitiesInZone(): Entity[];
  
  abstract onEnter?(entity: Entity): void;
  abstract onStay?(entity: Entity, deltaTime: number): void;
  abstract onExit?(entity: Entity): void;
}