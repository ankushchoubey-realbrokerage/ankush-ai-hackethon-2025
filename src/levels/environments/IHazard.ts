import { Entity, DamagableEntity, Vector3 } from '../../types';
import { BoundingBox } from './LavaHazard';

// STEP 36: Base hazard interface and types

export type HazardType = 'damage' | 'instant_death' | 'slow' | 'push';

export interface IHazard {
  id: string;
  type: HazardType;
  position: Vector3;
  bounds: BoundingBox;
  active: boolean;
  
  // Lifecycle methods
  initialize?(): void;
  update(deltaTime: number): void;
  cleanup(): void;
  
  // Entity interaction methods
  checkCollision(entity: Entity): boolean;
  onEnter?(entity: Entity): void;
  onStay?(entity: Entity, deltaTime: number): void;
  onExit?(entity: Entity): void;
  
  // Visual indicator methods
  getVisualIndicator?(): { color: number; intensity: number };
  shouldShowWarning(entity: Entity): boolean;
}

// Track entities currently in hazard zones
export interface HazardEntityState {
  entityId: string;
  timeEntered: number;
  lastUpdateTime: number;
  customData?: any;
}