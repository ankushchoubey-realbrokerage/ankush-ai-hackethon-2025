import * as THREE from 'three';
import { LevelData, LevelLoadResult, LevelTransitionData, WeaponPickup, LevelObstacle } from '../../types/level.types';
import { Vector3 } from '../../types/game.types';
import { levelConfigs } from '../maps/levelConfigs';

// STEP 31: Level System Architecture - Level Loading System
export class LevelLoader {
  private currentLevel: LevelData | null = null;
  private scene: THREE.Scene | null = null;
  private loadedObstacles: Map<string, THREE.Object3D> = new Map();
  private weaponPickupMeshes: Map<string, THREE.Mesh> = new Map();
  
  constructor(scene?: THREE.Scene) {
    if (scene) {
      this.scene = scene;
    }
  }
  
  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }
  
  /**
   * Load a level by ID
   */
  public async loadLevel(levelId: number): Promise<LevelLoadResult> {
    try {
      // Get level configuration
      const levelConfig = levelConfigs.get(levelId);
      if (!levelConfig) {
        return {
          success: false,
          error: `Level ${levelId} not found`
        };
      }
      
      // Clean up previous level
      this.cleanupLevel();
      
      // Convert to LevelData format with defaults
      const levelData: LevelData = {
        ...levelConfig,
        winConditions: levelConfig.winConditions || [{ type: 'kill_all' }],
        obstacles: levelConfig.obstacles || [],
        weaponPickups: levelConfig.weaponPickups || []
      };
      
      // Initialize level-specific entities
      this.initializeLevelEntities(levelData);
      
      // Set current level
      this.currentLevel = levelData;
      
      // Apply level-specific settings
      this.applyLevelSettings(levelData);
      
      return {
        success: true,
        level: levelData
      };
    } catch (error) {
      console.error('Error loading level:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Clean up current level resources
   */
  public cleanupLevel(): void {
    if (!this.scene) return;
    
    // Remove obstacles
    this.loadedObstacles.forEach(obstacle => {
      this.scene!.remove(obstacle);
      // Dispose of geometries and materials
      obstacle.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    });
    this.loadedObstacles.clear();
    
    // Remove weapon pickups
    this.weaponPickupMeshes.forEach(pickup => {
      this.scene!.remove(pickup);
      pickup.geometry.dispose();
      if (pickup.material instanceof THREE.Material) {
        pickup.material.dispose();
      }
    });
    this.weaponPickupMeshes.clear();
    
    // Reset fog
    this.scene.fog = null;
  }
  
  /**
   * Initialize level-specific entities
   */
  private initializeLevelEntities(levelData: LevelData): void {
    if (!this.scene) return;
    
    // Load obstacles
    if (levelData.obstacles) {
      levelData.obstacles.forEach(obstacle => {
        const mesh = this.createObstacleMesh(obstacle);
        if (mesh) {
          this.loadedObstacles.set(obstacle.id, mesh);
          this.scene!.add(mesh);
        }
      });
    }
    
    // Load weapon pickups
    if (levelData.weaponPickups) {
      levelData.weaponPickups.forEach((pickup, index) => {
        const mesh = this.createWeaponPickupMesh(pickup);
        if (mesh) {
          const id = `weapon_pickup_${index}`;
          this.weaponPickupMeshes.set(id, mesh);
          this.scene!.add(mesh);
        }
      });
    }
  }
  
  /**
   * Create obstacle mesh based on type
   */
  private createObstacleMesh(obstacle: LevelObstacle): THREE.Object3D | null {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    
    switch (obstacle.type) {
      case 'wall':
        geometry = new THREE.BoxGeometry(2, 3, 0.5);
        material = new THREE.MeshStandardMaterial({ color: 0x666666 });
        break;
      case 'car':
        // Simplified car shape
        const carGroup = new THREE.Group();
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0066cc });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        carGroup.add(body);
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.5, 0.8, 2);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x004499 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1.4;
        carGroup.add(roof);
        
        // Apply transforms
        carGroup.position.set(obstacle.position.x, obstacle.position.y, obstacle.position.z);
        carGroup.rotation.set(obstacle.rotation.x, obstacle.rotation.y, obstacle.rotation.z);
        carGroup.scale.set(obstacle.scale.x, obstacle.scale.y, obstacle.scale.z);
        
        return carGroup;
      case 'rock':
        geometry = new THREE.DodecahedronGeometry(1);
        material = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
        break;
      case 'tree':
        const treeGroup = new THREE.Group();
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2c2a });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        treeGroup.add(trunk);
        // Leaves
        const leavesGeometry = new THREE.ConeGeometry(1.5, 2, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3;
        treeGroup.add(leaves);
        
        // Apply transforms
        treeGroup.position.set(obstacle.position.x, obstacle.position.y, obstacle.position.z);
        treeGroup.rotation.set(obstacle.rotation.x, obstacle.rotation.y, obstacle.rotation.z);
        treeGroup.scale.set(obstacle.scale.x, obstacle.scale.y, obstacle.scale.z);
        
        return treeGroup;
      case 'debris':
        // Street debris - irregular shape
        geometry = new THREE.TetrahedronGeometry(0.8, 2);
        material = new THREE.MeshStandardMaterial({ 
          color: 0x444444, 
          roughness: 0.95,
          metalness: 0.1 
        });
        break;
      default:
        // Default box obstacle
        geometry = new THREE.BoxGeometry(1, 1, 1);
        material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    }
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(obstacle.position.x, obstacle.position.y, obstacle.position.z);
    mesh.rotation.set(obstacle.rotation.x, obstacle.rotation.y, obstacle.rotation.z);
    mesh.scale.set(obstacle.scale.x, obstacle.scale.y, obstacle.scale.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  /**
   * Create weapon pickup mesh
   */
  private createWeaponPickupMesh(pickup: WeaponPickup): THREE.Mesh {
    // Create a glowing cube for weapon pickups
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pickup.position.x, pickup.position.y + 0.5, pickup.position.z);
    
    // Add floating animation
    mesh.userData.floatTime = 0;
    mesh.userData.baseY = pickup.position.y + 0.5;
    
    return mesh;
  }
  
  /**
   * Apply level-specific settings
   */
  private applyLevelSettings(levelData: LevelData): void {
    if (!this.scene) return;
    
    // Apply fog if specified
    if (levelData.fogDensity && levelData.fogDensity > 0) {
      const fogColor = this.getFogColorForTheme(levelData.theme);
      this.scene.fog = new THREE.FogExp2(fogColor, levelData.fogDensity);
    } else {
      this.scene.fog = null;
    }
    
    // Apply theme-specific lighting adjustments
    this.applyThemeLighting(levelData.theme);
  }
  
  /**
   * Get fog color based on theme
   */
  private getFogColorForTheme(theme: string): number {
    switch (theme) {
      case 'volcano': return 0x663333;
      case 'forest': return 0x4a5c4a;
      case 'underwater': return 0x004466;
      case 'arctic': return 0xccddee;
      case 'hell': return 0x440000;
      default: return 0x888888;
    }
  }
  
  /**
   * Apply theme-specific lighting
   */
  private applyThemeLighting(theme: string): void {
    // This would adjust ambient light color based on theme
    // Implementation depends on how lighting is managed in the scene
  }
  
  /**
   * Get current level data
   */
  public getCurrentLevel(): LevelData | null {
    return this.currentLevel;
  }
  
  /**
   * Update weapon pickup animations
   */
  public updatePickups(deltaTime: number): void {
    this.weaponPickupMeshes.forEach(mesh => {
      if (mesh.userData.floatTime !== undefined) {
        mesh.userData.floatTime += deltaTime * 2;
        mesh.position.y = mesh.userData.baseY + Math.sin(mesh.userData.floatTime) * 0.2;
        mesh.rotation.y += deltaTime;
      }
    });
  }
  
  /**
   * Remove a specific weapon pickup
   */
  public removeWeaponPickup(pickupId: string): void {
    const mesh = this.weaponPickupMeshes.get(pickupId);
    if (mesh && this.scene) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      this.weaponPickupMeshes.delete(pickupId);
    }
  }
  
  /**
   * Get all weapon pickup positions for collision detection
   */
  public getWeaponPickups(): Array<{ id: string; position: Vector3; type: string }> {
    const pickups: Array<{ id: string; position: Vector3; type: string }> = [];
    
    if (this.currentLevel?.weaponPickups) {
      this.currentLevel.weaponPickups.forEach((pickup, index) => {
        const id = `weapon_pickup_${index}`;
        if (this.weaponPickupMeshes.has(id)) {
          pickups.push({
            id,
            position: pickup.position,
            type: pickup.weaponType
          });
        }
      });
    }
    
    return pickups;
  }
  
  /**
   * Create level transition data
   */
  public createTransitionData(
    fromLevel: number,
    toLevel: number,
    playerHealth: number,
    playerWeapons: string[],
    playerAmmo: Map<string, number>,
    score: number,
    time: number
  ): LevelTransitionData {
    return {
      fromLevel,
      toLevel,
      playerHealth,
      playerWeapons,
      playerAmmo,
      score,
      time
    };
  }
}