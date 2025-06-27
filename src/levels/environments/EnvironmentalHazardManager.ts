import { EnvironmentalHazard, DamagableEntity, Entity } from '../../types';
import { IHazard, HazardType } from './IHazard';
import { LavaHazard } from './LavaHazard';
import { DamageZone } from './DamageZone';
import { InstantDeathZone } from './InstantDeathZone';
import { SlowingZone } from './SlowingZone';
import { PushZone } from './PushZone';
import { HazardWarningSystem } from './HazardWarningSystem';
import { HazardEffectsSystem } from './HazardEffectsSystem';
import * as THREE from 'three';

// STEP 36: Updated Environmental Hazard Manager

export interface HazardConfig {
  id: string;
  type: HazardType;
  position: { x: number; y: number; z: number };
  dimensions: { x: number; y: number; z: number };
  properties?: {
    damage?: number;
    damageType?: string;
    slowFactor?: number;
    slowType?: 'mud' | 'tar' | 'ice' | 'quicksand';
    pushForce?: { x: number; y: number; z: number };
    pushType?: 'wind' | 'geyser' | 'conveyor' | 'fan';
    deathType?: 'pit' | 'crusher' | 'void';
  };
}

export class EnvironmentalHazardManager {
  private hazards: Map<string, IHazard> = new Map();
  private legacyLavaHazards: Map<string, LavaHazard> = new Map();
  private activeLevel: number = 0;
  private scene: THREE.Scene | null = null;
  private camera: THREE.Camera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private warningSystem: HazardWarningSystem | null = null;
  private effectsSystem: HazardEffectsSystem | null = null;
  private allEntities: Entity[] = [];

  initialize(levelId: number, environmentalHazards: EnvironmentalHazard[]): void {
    this.cleanup();
    this.activeLevel = levelId;

    // Handle legacy lava hazards from Step 35
    environmentalHazards.forEach((hazardData, index) => {
      const hazardId = `${levelId}_${hazardData.type}_${index}`;
      
      if (hazardData.type === 'lava') {
        const lavaHazard = new LavaHazard(
          hazardData.position,
          hazardData.dimensions,
          hazardData.damage || 20
        );
        this.legacyLavaHazards.set(hazardId, lavaHazard);
      }
    });
  }

  initializeExtended(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this.warningSystem = new HazardWarningSystem(scene);
    this.effectsSystem = new HazardEffectsSystem(scene, camera, renderer);
  }

  createHazard(config: HazardConfig): void {
    if (!this.scene) {
      console.error('Scene not initialized. Call initializeExtended first.');
      return;
    }

    let hazard: IHazard | null = null;

    switch (config.type) {
      case 'damage':
        const damageZone = new DamageZone(
          config.id,
          config.position,
          config.dimensions,
          config.properties?.damage || 10,
          config.properties?.damageType || 'environmental'
        );
        damageZone.initialize(this.scene);
        hazard = damageZone;
        break;

      case 'instant_death':
        const deathZone = new InstantDeathZone(
          config.id,
          config.position,
          config.dimensions,
          config.properties?.deathType || 'pit'
        );
        deathZone.initialize(this.scene);
        hazard = deathZone;
        break;

      case 'slow':
        const slowZone = new SlowingZone(
          config.id,
          config.position,
          config.dimensions,
          config.properties?.slowFactor || 0.5,
          config.properties?.slowType || 'mud'
        );
        slowZone.initialize(this.scene);
        hazard = slowZone;
        break;

      case 'push':
        if (config.properties?.pushForce) {
          const pushZone = new PushZone(
            config.id,
            config.position,
            config.dimensions,
            config.properties.pushForce,
            config.properties?.pushType || 'wind'
          );
          pushZone.initialize(this.scene);
          hazard = pushZone;
        }
        break;
    }

    if (hazard) {
      this.hazards.set(config.id, hazard);
      
      // Create danger zone outline
      if (this.warningSystem) {
        this.warningSystem.createDangerZoneOutline(hazard);
      }
    }
  }

  setEntities(entities: Entity[]): void {
    this.allEntities = entities;
    
    // Update entities for all hazards
    this.hazards.forEach(hazard => {
      if ('setEntities' in hazard) {
        (hazard as any).setEntities(entities);
      }
    });
  }

  update(entities: DamagableEntity[], deltaTime: number): void {
    this.setEntities(entities);
    
    // Update legacy lava hazards
    this.legacyLavaHazards.forEach(hazard => {
      hazard.update(entities, deltaTime);
    });

    // Update new hazard system
    this.hazards.forEach(hazard => {
      hazard.update(deltaTime);
      
      // Apply effects for entities in hazards
      entities.forEach(entity => {
        if (hazard.checkCollision(entity) && this.effectsSystem) {
          this.effectsSystem.applyHazardEffect(entity, hazard.type, 1);
        } else if (this.effectsSystem) {
          this.effectsSystem.removeHazardEffect(entity, hazard.type);
        }
      });
    });

    // Update warning system for player
    const player = entities.find(e => e.type === 'player');
    if (player && this.warningSystem) {
      this.warningSystem.updateWarnings(Array.from(this.hazards.values()), player);
    }

    // Update effects system
    if (this.effectsSystem) {
      this.effectsSystem.update(deltaTime);
    }
  }

  checkEntityInHazard(entity: Entity): { inHazard: boolean; hazardType?: string } {
    // Check legacy lava hazards
    for (const [hazardId, hazard] of this.legacyLavaHazards.entries()) {
      if (hazard.isEntityInLava(entity)) {
        return { inHazard: true, hazardType: 'lava' };
      }
    }
    
    // Check new hazards
    for (const [hazardId, hazard] of this.hazards.entries()) {
      if (hazard.checkCollision(entity)) {
        return { inHazard: true, hazardType: hazard.type };
      }
    }
    
    return { inHazard: false };
  }

  getActiveHazards(): IHazard[] {
    return Array.from(this.hazards.values());
  }

  getHazardAt(position: { x: number; y: number; z: number }): IHazard | null {
    const testEntity: Entity = {
      id: 'test',
      transform: { position, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
      type: 'player',
      boundingBox: { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } },
      active: true
    };
    
    for (const hazard of this.hazards.values()) {
      if (hazard.checkCollision(testEntity)) {
        return hazard;
      }
    }
    
    return null;
  }

  cleanup(): void {
    // Clean up legacy hazards
    this.legacyLavaHazards.forEach(hazard => hazard.cleanup());
    this.legacyLavaHazards.clear();
    
    // Clean up new hazards
    this.hazards.forEach(hazard => hazard.cleanup());
    this.hazards.clear();
    
    // Clean up systems
    if (this.warningSystem) {
      this.warningSystem.cleanup();
    }
    
    if (this.effectsSystem) {
      this.effectsSystem.cleanup();
    }
    
    this.activeLevel = 0;
  }

  getActiveLevel(): number {
    return this.activeLevel;
  }

  getHazardCount(): number {
    return this.hazards.size + this.legacyLavaHazards.size;
  }
}