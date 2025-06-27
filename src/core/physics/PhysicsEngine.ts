import { Entity, BoundingBox, Vector3 } from '../../types';

export interface CollisionInfo {
  entity: Entity;
  normal: Vector3;
  penetration: number;
}

export class PhysicsEngine {
  private entities: Map<string, Entity> = new Map();
  private staticEntities: Map<string, Entity> = new Map();
  
  // World boundaries
  private worldBounds = {
    min: { x: -45, y: -10, z: -45 },
    max: { x: 45, y: 50, z: 45 }
  };

  public addEntity(entity: Entity, isStatic: boolean = false): void {
    if (isStatic) {
      this.staticEntities.set(entity.id, entity);
    } else {
      this.entities.set(entity.id, entity);
    }
  }

  public removeEntity(entityId: string): void {
    this.entities.delete(entityId);
    this.staticEntities.delete(entityId);
  }

  public update(deltaTime: number): void {
    // Check collisions for all dynamic entities
    this.entities.forEach((entity) => {
      // Check world boundaries
      this.constrainToWorldBounds(entity);
      
      // Check collisions with other entities
      const collisions = this.getDetailedCollisions(entity);
      if (collisions.length > 0) {
        this.resolveCollisions(entity, collisions);
      }
    });
  }

  public checkCollision(a: BoundingBox, b: BoundingBox): boolean {
    return (
      a.min.x <= b.max.x &&
      a.max.x >= b.min.x &&
      a.min.y <= b.max.y &&
      a.max.y >= b.min.y &&
      a.min.z <= b.max.z &&
      a.max.z >= b.min.z
    );
  }

  public checkPointInBox(point: Vector3, box: BoundingBox): boolean {
    return (
      point.x >= box.min.x &&
      point.x <= box.max.x &&
      point.y >= box.min.y &&
      point.y <= box.max.y &&
      point.z >= box.min.z &&
      point.z <= box.max.z
    );
  }

  public getCollisions(entity: Entity): Entity[] {
    const collisions: Entity[] = [];
    
    this.entities.forEach((other) => {
      if (other.id !== entity.id && this.checkCollision(entity.boundingBox, other.boundingBox)) {
        collisions.push(other);
      }
    });
    
    this.staticEntities.forEach((other) => {
      if (this.checkCollision(entity.boundingBox, other.boundingBox)) {
        collisions.push(other);
      }
    });
    
    return collisions;
  }

  private getDetailedCollisions(entity: Entity): CollisionInfo[] {
    const collisions: CollisionInfo[] = [];
    
    // Check dynamic entities
    this.entities.forEach((other) => {
      if (other.id !== entity.id) {
        const collision = this.getCollisionInfo(entity, other);
        if (collision) {
          collisions.push(collision);
        }
      }
    });
    
    // Check static entities
    this.staticEntities.forEach((other) => {
      const collision = this.getCollisionInfo(entity, other);
      if (collision) {
        collisions.push(collision);
      }
    });
    
    return collisions;
  }

  private getCollisionInfo(a: Entity, b: Entity): CollisionInfo | null {
    const aBounds = this.getWorldBoundingBox(a);
    const bBounds = this.getWorldBoundingBox(b);
    
    if (!this.checkCollision(aBounds, bBounds)) {
      return null;
    }
    
    // Calculate penetration and normal
    const aCenter = {
      x: (aBounds.min.x + aBounds.max.x) / 2,
      y: (aBounds.min.y + aBounds.max.y) / 2,
      z: (aBounds.min.z + aBounds.max.z) / 2
    };
    
    const bCenter = {
      x: (bBounds.min.x + bBounds.max.x) / 2,
      y: (bBounds.min.y + bBounds.max.y) / 2,
      z: (bBounds.min.z + bBounds.max.z) / 2
    };
    
    const dx = aCenter.x - bCenter.x;
    const dz = aCenter.z - bCenter.z;
    
    const aHalfWidth = (aBounds.max.x - aBounds.min.x) / 2;
    const aHalfDepth = (aBounds.max.z - aBounds.min.z) / 2;
    const bHalfWidth = (bBounds.max.x - bBounds.min.x) / 2;
    const bHalfDepth = (bBounds.max.z - bBounds.min.z) / 2;
    
    const overlapX = aHalfWidth + bHalfWidth - Math.abs(dx);
    const overlapZ = aHalfDepth + bHalfDepth - Math.abs(dz);
    
    // Find the axis of least penetration
    if (overlapX < overlapZ) {
      return {
        entity: b,
        normal: { x: dx > 0 ? 1 : -1, y: 0, z: 0 },
        penetration: overlapX
      };
    } else {
      return {
        entity: b,
        normal: { x: 0, y: 0, z: dz > 0 ? 1 : -1 },
        penetration: overlapZ
      };
    }
  }

  private getWorldBoundingBox(entity: Entity): BoundingBox {
    return {
      min: {
        x: entity.transform.position.x + entity.boundingBox.min.x,
        y: entity.transform.position.y + entity.boundingBox.min.y,
        z: entity.transform.position.z + entity.boundingBox.min.z
      },
      max: {
        x: entity.transform.position.x + entity.boundingBox.max.x,
        y: entity.transform.position.y + entity.boundingBox.max.y,
        z: entity.transform.position.z + entity.boundingBox.max.z
      }
    };
  }

  private constrainToWorldBounds(entity: Entity): void {
    const bounds = this.getWorldBoundingBox(entity);
    
    // Check X bounds
    if (bounds.min.x < this.worldBounds.min.x) {
      entity.transform.position.x += this.worldBounds.min.x - bounds.min.x;
    } else if (bounds.max.x > this.worldBounds.max.x) {
      entity.transform.position.x -= bounds.max.x - this.worldBounds.max.x;
    }
    
    // Check Z bounds
    if (bounds.min.z < this.worldBounds.min.z) {
      entity.transform.position.z += this.worldBounds.min.z - bounds.min.z;
    } else if (bounds.max.z > this.worldBounds.max.z) {
      entity.transform.position.z -= bounds.max.z - this.worldBounds.max.z;
    }
    
    // Check Y bounds (optional, for jumping/falling)
    if (bounds.min.y < this.worldBounds.min.y) {
      entity.transform.position.y += this.worldBounds.min.y - bounds.min.y;
    } else if (bounds.max.y > this.worldBounds.max.y) {
      entity.transform.position.y -= bounds.max.y - this.worldBounds.max.y;
    }
  }

  private resolveCollisions(entity: Entity, collisions: CollisionInfo[]): void {
    // Simple push-out resolution
    collisions.forEach((collision) => {
      entity.transform.position.x += collision.normal.x * collision.penetration;
      entity.transform.position.z += collision.normal.z * collision.penetration;
    });
  }

  public setWorldBounds(min: Vector3, max: Vector3): void {
    this.worldBounds.min = { ...min };
    this.worldBounds.max = { ...max };
  }

  public getWorldBounds(): { min: Vector3; max: Vector3 } {
    return {
      min: { ...this.worldBounds.min },
      max: { ...this.worldBounds.max }
    };
  }

  public getAllEntities(): Entity[] {
    return [...Array.from(this.entities.values()), ...Array.from(this.staticEntities.values())];
  }
}