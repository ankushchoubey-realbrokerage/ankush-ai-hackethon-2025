import { Vector3, Entity, DamagableEntity } from '../../types';

// STEP 35: Lava Hazard Implementation

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export class LavaHazard {
  private bounds: BoundingBox;
  private damagePerSecond: number = 20;
  private position: Vector3;
  private dimensions: Vector3;
  private affectedEntities: Map<string, number> = new Map();

  constructor(position: Vector3, dimensions: Vector3, damagePerSecond: number = 20) {
    this.position = position;
    this.dimensions = dimensions;
    this.damagePerSecond = damagePerSecond;
    
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
    // Check if entity is within lava bounds
    const entityPos = entity.transform.position;
    
    return (
      entityPos.x >= this.bounds.min.x &&
      entityPos.x <= this.bounds.max.x &&
      entityPos.y >= this.bounds.min.y &&
      entityPos.y <= this.bounds.max.y + 1 && // Allow some height tolerance
      entityPos.z >= this.bounds.min.z &&
      entityPos.z <= this.bounds.max.z
    );
  }

  applyDamage(entity: DamagableEntity, deltaTime: number): void {
    if (!this.checkCollision(entity)) {
      // Entity left the lava, remove from tracking
      this.affectedEntities.delete(entity.id);
      return;
    }

    // Track time in lava
    const currentTime = Date.now();
    const lastDamageTime = this.affectedEntities.get(entity.id) || currentTime;
    const timeSinceLastDamage = (currentTime - lastDamageTime) / 1000;

    // Apply damage based on time elapsed
    if (timeSinceLastDamage >= 0.1) { // Apply damage every 100ms
      const damage = this.damagePerSecond * 0.1;
      entity.health -= damage;
      this.affectedEntities.set(entity.id, currentTime);
    }
  }

  isEntityInLava(entity: Entity): boolean {
    return this.checkCollision(entity);
  }

  getDamagePerSecond(): number {
    return this.damagePerSecond;
  }

  getPosition(): Vector3 {
    return { ...this.position };
  }

  getDimensions(): Vector3 {
    return { ...this.dimensions };
  }

  getBounds(): BoundingBox {
    return {
      min: { ...this.bounds.min },
      max: { ...this.bounds.max }
    };
  }

  // Check if an entity is immune to lava damage
  isEntityImmune(entity: Entity): boolean {
    if ('zombieType' in entity) {
      const zombie = entity as any;
      return zombie.zombieType === 'fire-resistant';
    }
    return false;
  }

  update(entities: DamagableEntity[], deltaTime: number): void {
    entities.forEach(entity => {
      if (!this.isEntityImmune(entity)) {
        this.applyDamage(entity, deltaTime);
      }
    });
  }

  cleanup(): void {
    this.affectedEntities.clear();
  }
}