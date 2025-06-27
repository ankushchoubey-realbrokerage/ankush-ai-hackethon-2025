import * as THREE from 'three';
import { Entity, BoundingBox } from '../types';

export class CollisionDebugger {
  private scene: THREE.Scene;
  private debugMeshes: Map<string, THREE.LineSegments> = new Map();
  private enabled: boolean = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  public updateDebugBox(entity: Entity): void {
    if (!this.enabled) return;

    // Remove old debug mesh if exists
    const oldMesh = this.debugMeshes.get(entity.id);
    if (oldMesh) {
      this.scene.remove(oldMesh);
    }

    // Create world-space bounding box
    const worldBox = {
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

    // Create box helper
    const size = new THREE.Vector3(
      worldBox.max.x - worldBox.min.x,
      worldBox.max.y - worldBox.min.y,
      worldBox.max.z - worldBox.min.z
    );
    const center = new THREE.Vector3(
      (worldBox.min.x + worldBox.max.x) / 2,
      (worldBox.min.y + worldBox.max.y) / 2,
      (worldBox.min.z + worldBox.max.z) / 2
    );

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const edges = new THREE.EdgesGeometry(geometry);
    
    const color = entity.type === 'player' ? 0x00ff00 : 
                  entity.type === 'obstacle' ? 0xff0000 : 
                  entity.type === 'zombie' ? 0xff00ff : 0xffff00;
    
    const material = new THREE.LineBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.5
    });
    
    const mesh = new THREE.LineSegments(edges, material);
    mesh.position.copy(center);
    
    this.scene.add(mesh);
    this.debugMeshes.set(entity.id, mesh);
  }

  public removeDebugBox(entityId: string): void {
    const mesh = this.debugMeshes.get(entityId);
    if (mesh) {
      this.scene.remove(mesh);
      this.debugMeshes.delete(entityId);
    }
  }

  public clear(): void {
    this.debugMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.debugMeshes.clear();
  }

  public toggleDebug(): void {
    this.setEnabled(!this.enabled);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}