import * as THREE from 'three';
import { Zombie } from './Zombie';
import { Vector3 } from '../../types';
import { FogSystem } from '../../effects/FogSystem';

export class CamoZombie extends Zombie {
  private baseMaterial: THREE.MeshStandardMaterial;
  private camoMaterial: THREE.MeshStandardMaterial;
  private transparentMaterial: THREE.MeshStandardMaterial;
  private bodyMesh: THREE.Mesh | null = null;
  private headMesh: THREE.Mesh | null = null;
  private armMeshes: THREE.Mesh[] = [];
  
  private isRevealed: boolean = false;
  private revealDistance: number = 5; // Distance at which camo starts to fail
  private fullRevealDistance: number = 3; // Distance at which zombie is fully visible
  private wasHit: boolean = false;
  private hitRevealDuration: number = 3; // Seconds to stay revealed after being hit
  private hitRevealTimer: number = 0;
  
  private fogSystem: FogSystem | null = null;
  private lastNoiseTime: number = 0;
  private noiseInterval: number = 5; // Seconds between close-range noises
  
  zombieType: any = 'camouflaged'; // Override zombie type
  
  constructor(position: Vector3) {
    super(position);
    
    // Dies in one hit like all zombies
    this.health = 1;
    this.maxHealth = 1;
    
    // Slightly slower movement for balance
    this.speed = 1.8;
    
    // Create camouflage materials
    this.baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5016,
      metalness: 0.1,
      roughness: 0.9
    });
    
    // Forest camouflage colors
    this.camoMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a4a2e, // Muted forest green
      metalness: 0.05,
      roughness: 0.95,
      opacity: 0.8,
      transparent: true
    });
    
    // Transparent material for stealth
    this.transparentMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a4a2e,
      metalness: 0.05,
      roughness: 0.95,
      opacity: 0.2,
      transparent: true
    });
    
    // Apply camouflage appearance
    this.applyCamouflage();
  }
  
  private applyCamouflage(): void {
    const mesh = this.getMesh();
    
    // Find and modify body parts
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.Material;
        
        // Identify body parts by their position/size
        const geometry = child.geometry;
        const box = new THREE.Box3().setFromObject(child);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        // Body (largest box)
        if (size.x > 0.7 && size.y > 0.9) {
          this.bodyMesh = child;
          child.material = this.camoMaterial.clone();
        }
        // Head (medium box, higher position)
        else if (size.x > 0.5 && size.x < 0.7 && child.position.y > 1) {
          this.headMesh = child;
          child.material = this.camoMaterial.clone();
        }
        // Arms (smaller boxes)
        else if (size.x < 0.4 && size.y > 0.7) {
          this.armMeshes.push(child);
          child.material = this.camoMaterial.clone();
        }
        // Eyes - make them dimmer
        else if (material instanceof THREE.MeshBasicMaterial && 
                 (material.color.getHex() === 0xff0000)) {
          material.color.setHex(0x660000); // Darker red
          // MeshBasicMaterial doesn't have emissive properties
        }
      }
    });
  }
  
  public setFogSystem(fogSystem: FogSystem): void {
    this.fogSystem = fogSystem;
  }
  
  public update(deltaTime: number, playerPosition: Vector3): void {
    super.update(deltaTime, playerPosition);
    
    if (this.isDead) return;
    
    // Calculate distance to player
    const dx = playerPosition.x - this.transform.position.x;
    const dz = playerPosition.z - this.transform.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    // Update reveal timer if hit
    if (this.wasHit) {
      this.hitRevealTimer -= deltaTime;
      if (this.hitRevealTimer <= 0) {
        this.wasHit = false;
      }
    }
    
    // Determine visibility based on distance and fog
    const shouldReveal = this.wasHit || distance < this.fullRevealDistance;
    const partialReveal = distance < this.revealDistance;
    
    // Check fog visibility if fog system is available
    let fogVisibility = 1;
    if (this.fogSystem) {
      const zombiePos = new THREE.Vector3(
        this.transform.position.x,
        this.transform.position.y,
        this.transform.position.z
      );
      const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
      
      if (!this.fogSystem.isPositionVisible(playerPos, zombiePos)) {
        fogVisibility = 0.3; // Very hard to see in fog
      }
    }
    
    // Update material opacity based on visibility
    this.updateVisibility(shouldReveal, partialReveal, distance, fogVisibility);
    
    // Make noise when very close
    if (distance < 3 && Date.now() - this.lastNoiseTime > this.noiseInterval * 1000) {
      this.makeCloseRangeNoise();
      this.lastNoiseTime = Date.now();
    }
  }
  
  private updateVisibility(fullReveal: boolean, partialReveal: boolean, distance: number, fogVisibility: number): void {
    const allMeshes = [this.bodyMesh, this.headMesh, ...this.armMeshes].filter(m => m !== null);
    
    allMeshes.forEach(mesh => {
      if (!mesh || !mesh.material) return;
      
      const material = mesh.material as THREE.MeshStandardMaterial;
      
      if (fullReveal) {
        // Fully visible
        material.opacity = 1.0 * fogVisibility;
        material.color.setHex(0x2d5016); // Normal zombie green
      } else if (partialReveal) {
        // Partially visible - fade in based on distance
        const fadeAmount = 1 - ((distance - this.fullRevealDistance) / 
                               (this.revealDistance - this.fullRevealDistance));
        material.opacity = (0.2 + (0.6 * fadeAmount)) * fogVisibility;
        
        // Blend color from camo to normal
        const camoColor = new THREE.Color(0x3a4a2e);
        const normalColor = new THREE.Color(0x2d5016);
        material.color.lerpColors(camoColor, normalColor, fadeAmount);
      } else {
        // Nearly invisible
        material.opacity = 0.2 * fogVisibility;
        material.color.setHex(0x3a4a2e); // Full camo
      }
    });
    
    // Update health bar visibility
    const healthBar = this.getMesh().children.find(child => 
      child instanceof THREE.Group && child.position.y > 2
    );
    if (healthBar) {
      healthBar.visible = fullReveal || (partialReveal && distance < 4);
    }
  }
  
  public takeDamage(damage: number): void {
    super.takeDamage(damage);
    
    // Reveal when hit
    if (!this.isDead) {
      this.wasHit = true;
      this.hitRevealTimer = this.hitRevealDuration;
      this.isRevealed = true;
    }
  }
  
  private makeCloseRangeNoise(): void {
    // Play a subtle noise when very close
    const audioManager = this.getAudioManager();
    if (audioManager) {
      // Use a quieter groan or rustling sound
      audioManager.playSound3D('zombie_groan', this.transform.position, 0.2);
    }
  }
  
  private getAudioManager(): any {
    // Access the audio manager through reflection (not ideal but works)
    return (this as any).audioManager;
  }
  
  // Override attack to make it more surprising
  public attack(): void {
    super.attack();
    // Fully reveal when attacking
    this.wasHit = true;
    this.hitRevealTimer = 1; // Brief reveal after attack
  }
}