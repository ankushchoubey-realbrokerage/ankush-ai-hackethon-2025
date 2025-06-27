import * as THREE from 'three';
import { Entity } from '../../types';
import { IHazard } from './IHazard';

// STEP 36: Visual warning system for hazards

export class HazardWarningSystem {
  private scene: THREE.Scene;
  private warnings: Map<string, WarningIndicator> = new Map();
  private dangerZoneMeshes: Map<string, THREE.LineSegments> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  updateWarnings(hazards: IHazard[], player: Entity): void {
    // Check each hazard for warning conditions
    hazards.forEach(hazard => {
      const shouldWarn = hazard.shouldShowWarning(player);
      const warningKey = `warning_${hazard.id}`;
      
      if (shouldWarn && !this.warnings.has(warningKey)) {
        // Create new warning
        const warning = this.createWarningIndicator(hazard);
        this.warnings.set(warningKey, warning);
      } else if (!shouldWarn && this.warnings.has(warningKey)) {
        // Remove warning
        const warning = this.warnings.get(warningKey)!;
        this.removeWarningIndicator(warning);
        this.warnings.delete(warningKey);
      }
    });
    
    // Update existing warnings
    this.warnings.forEach(warning => warning.update());
  }
  
  private createWarningIndicator(hazard: IHazard): WarningIndicator {
    const indicator = new WarningIndicator(this.scene, hazard);
    indicator.create();
    return indicator;
  }
  
  private removeWarningIndicator(warning: WarningIndicator): void {
    warning.cleanup();
  }
  
  createDangerZoneOutline(hazard: IHazard): void {
    const key = `danger_${hazard.id}`;
    if (this.dangerZoneMeshes.has(key)) return;
    
    const bounds = hazard.bounds;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    const depth = bounds.max.z - bounds.min.z;
    
    // Create outline geometry
    const geometry = new THREE.BoxGeometry(width + 0.1, height + 0.1, depth + 0.1);
    const edges = new THREE.EdgesGeometry(geometry);
    
    const visualInfo = hazard.getVisualIndicator?.() || { color: 0xff0000, intensity: 0.5 };
    const material = new THREE.LineBasicMaterial({ 
      color: visualInfo.color,
      linewidth: 2,
      transparent: true,
      opacity: visualInfo.intensity
    });
    
    const outline = new THREE.LineSegments(edges, material);
    outline.position.copy(hazard.position as THREE.Vector3);
    
    this.scene.add(outline);
    this.dangerZoneMeshes.set(key, outline);
  }
  
  cleanup(): void {
    this.warnings.forEach(warning => warning.cleanup());
    this.warnings.clear();
    
    this.dangerZoneMeshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.dangerZoneMeshes.clear();
  }
}

class WarningIndicator {
  private scene: THREE.Scene;
  private hazard: IHazard;
  private group: THREE.Group;
  private iconMesh: THREE.Mesh | null = null;
  private glowMesh: THREE.Mesh | null = null;
  private startTime: number;
  
  constructor(scene: THREE.Scene, hazard: IHazard) {
    this.scene = scene;
    this.hazard = hazard;
    this.group = new THREE.Group();
    this.startTime = Date.now();
  }
  
  create(): void {
    // Create warning icon (exclamation mark)
    const iconGeometry = new THREE.ConeGeometry(0.3, 1, 4);
    const iconMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00
    });
    
    this.iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
    this.iconMesh.position.y = 1;
    this.group.add(this.iconMesh);
    
    // Create glow effect
    const glowGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    this.glowMesh.position.y = 1;
    this.group.add(this.glowMesh);
    
    // Position warning above hazard
    this.group.position.set(
      this.hazard.position.x,
      this.hazard.bounds.max.y + 2,
      this.hazard.position.z
    );
    
    this.scene.add(this.group);
  }
  
  update(): void {
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    // Pulse effect
    const scale = 1 + Math.sin(elapsed * 4) * 0.2;
    this.group.scale.setScalar(scale);
    
    // Rotation
    this.group.rotation.y = elapsed * 2;
    
    // Opacity pulse
    if (this.glowMesh) {
      (this.glowMesh.material as THREE.MeshBasicMaterial).opacity = 
        0.2 + Math.sin(elapsed * 3) * 0.1;
    }
  }
  
  cleanup(): void {
    if (this.iconMesh) {
      this.iconMesh.geometry.dispose();
      (this.iconMesh.material as THREE.Material).dispose();
    }
    
    if (this.glowMesh) {
      this.glowMesh.geometry.dispose();
      (this.glowMesh.material as THREE.Material).dispose();
    }
    
    this.scene.remove(this.group);
  }
}