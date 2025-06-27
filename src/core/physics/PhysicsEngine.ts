import { Entity, BoundingBox, Vector3 } from '../../types';

export class PhysicsEngine {
  private entities: Map<string, Entity> = new Map();

  public addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  public removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  public update(deltaTime: number): void {
    // Update physics for all entities
    // This will be expanded with collision detection
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
    
    return collisions;
  }
}