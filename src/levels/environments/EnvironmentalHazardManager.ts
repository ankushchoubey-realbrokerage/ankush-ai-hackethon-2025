import { EnvironmentalHazard, DamagableEntity, Entity } from '../../types';
import { LavaHazard } from './LavaHazard';

// STEP 35: Environmental Hazard Manager

export class EnvironmentalHazardManager {
  private hazards: Map<string, LavaHazard> = new Map();
  private activeLevel: number = 0;

  initialize(levelId: number, hazards: EnvironmentalHazard[]): void {
    this.cleanup();
    this.activeLevel = levelId;

    hazards.forEach((hazardData, index) => {
      const hazardId = `${levelId}_${hazardData.type}_${index}`;
      
      switch (hazardData.type) {
        case 'lava':
          const lavaHazard = new LavaHazard(
            hazardData.position,
            hazardData.dimensions,
            hazardData.damage || 20
          );
          this.hazards.set(hazardId, lavaHazard);
          break;
        // Other hazard types can be added here in future steps
        case 'ice':
        case 'quicksand':
        case 'low-gravity':
        case 'fire-pit':
        case 'teleporter':
          // Placeholder for future hazard types
          console.log(`Hazard type ${hazardData.type} not yet implemented`);
          break;
      }
    });
  }

  update(entities: DamagableEntity[], deltaTime: number): void {
    // Update all active hazards
    this.hazards.forEach(hazard => {
      hazard.update(entities, deltaTime);
    });
  }

  checkEntityInHazard(entity: Entity): { inHazard: boolean; hazardType?: string } {
    for (const [hazardId, hazard] of this.hazards.entries()) {
      if (hazard.isEntityInLava(entity)) {
        return { inHazard: true, hazardType: 'lava' };
      }
    }
    return { inHazard: false };
  }

  getActiveHazards(): LavaHazard[] {
    return Array.from(this.hazards.values());
  }

  getHazardAt(position: { x: number; y: number; z: number }): LavaHazard | null {
    for (const hazard of this.hazards.values()) {
      if (hazard.checkCollision({ 
        id: 'test', 
        transform: { position, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
        type: 'player',
        boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
        active: true 
      })) {
        return hazard;
      }
    }
    return null;
  }

  cleanup(): void {
    this.hazards.forEach(hazard => hazard.cleanup());
    this.hazards.clear();
    this.activeLevel = 0;
  }

  getActiveLevel(): number {
    return this.activeLevel;
  }

  getHazardCount(): number {
    return this.hazards.size;
  }
}