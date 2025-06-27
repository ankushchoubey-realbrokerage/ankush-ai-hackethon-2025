import * as THREE from 'three';
import { Level } from '../../types';

export class ForestMap {
  private scene: THREE.Scene;
  private trees: THREE.Mesh[] = [];
  private bushes: THREE.Mesh[] = [];
  private fallenLogs: THREE.Mesh[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  load(): void {
    this.createTrees();
    this.createBushes();
    this.createFallenLogs();
    this.createClearings();
  }
  
  private createTrees(): void {
    const treeGeometry = new THREE.CylinderGeometry(0.8, 1.2, 6, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3c28 });
    
    const foliageGeometry = new THREE.ConeGeometry(3, 5, 8);
    const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x1e4620 });
    
    // Create dense forest with natural paths
    const treePositions = [
      // Forest perimeter
      ...this.generatePerimeterPositions(30, 25),
      // Inner clusters
      { x: -8, z: -8 }, { x: -7, z: -6 }, { x: -9, z: -5 },
      { x: 8, z: 8 }, { x: 7, z: 6 }, { x: 9, z: 5 },
      { x: -12, z: 4 }, { x: -11, z: 6 }, { x: -13, z: 5 },
      { x: 12, z: -4 }, { x: 11, z: -6 }, { x: 13, z: -5 },
      // Create natural paths by leaving gaps
      { x: -15, z: -10 }, { x: -14, z: -12 }, { x: -16, z: -11 },
      { x: 15, z: 10 }, { x: 14, z: 12 }, { x: 16, z: 11 },
      { x: -5, z: 15 }, { x: -3, z: 14 }, { x: -4, z: 16 },
      { x: 5, z: -15 }, { x: 3, z: -14 }, { x: 4, z: -16 }
    ];
    
    treePositions.forEach(pos => {
      const trunk = new THREE.Mesh(treeGeometry, trunkMaterial);
      trunk.position.set(pos.x, 3, pos.z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.set(pos.x, 7, pos.z);
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      
      this.scene.add(trunk);
      this.scene.add(foliage);
      this.trees.push(trunk);
    });
  }
  
  private createBushes(): void {
    const bushGeometry = new THREE.SphereGeometry(1.5, 8, 6);
    const bushMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5016 });
    
    const bushPositions = [
      { x: -3, z: -3 }, { x: 3, z: 3 }, { x: -6, z: 2 },
      { x: 6, z: -2 }, { x: 0, z: 5 }, { x: 0, z: -5 },
      { x: -10, z: 0 }, { x: 10, z: 0 }, { x: -2, z: 8 },
      { x: 2, z: -8 }, { x: -7, z: 7 }, { x: 7, z: -7 }
    ];
    
    bushPositions.forEach(pos => {
      const bush = new THREE.Mesh(bushGeometry, bushMaterial);
      bush.position.set(pos.x, 0.8, pos.z);
      bush.scale.y = 0.6; // Squash bushes vertically
      bush.castShadow = true;
      bush.receiveShadow = true;
      
      this.scene.add(bush);
      this.bushes.push(bush);
    });
  }
  
  private createFallenLogs(): void {
    const logGeometry = new THREE.CylinderGeometry(0.6, 0.6, 5, 8);
    const logMaterial = new THREE.MeshPhongMaterial({ color: 0x3e2c1a });
    
    const logConfigs = [
      { x: -5, z: 0, rotation: Math.PI / 2 },
      { x: 5, z: -10, rotation: Math.PI / 2 + 0.3 },
      { x: -8, z: 12, rotation: Math.PI / 2 - 0.2 },
      { x: 0, z: -7, rotation: Math.PI / 2 + 0.1 }
    ];
    
    logConfigs.forEach(config => {
      const log = new THREE.Mesh(logGeometry, logMaterial);
      log.position.set(config.x, 0.6, config.z);
      log.rotation.z = config.rotation;
      log.castShadow = true;
      log.receiveShadow = true;
      
      this.scene.add(log);
      this.fallenLogs.push(log);
    });
  }
  
  private createClearings(): void {
    // Combat clearings with rocks for cover
    const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
    const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x5a5a5a });
    
    const clearingRocks = [
      { x: -12, z: -12, scale: 1.2 },
      { x: 12, z: 12, scale: 1.5 },
      { x: -12, z: 12, scale: 1.0 },
      { x: 12, z: -12, scale: 1.3 }
    ];
    
    clearingRocks.forEach(config => {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(config.x, config.scale * 0.5, config.z);
      rock.scale.setScalar(config.scale);
      rock.rotation.y = Math.random() * Math.PI * 2;
      rock.castShadow = true;
      rock.receiveShadow = true;
      
      this.scene.add(rock);
    });
  }
  
  private generatePerimeterPositions(radius: number, count: number): { x: number; z: number }[] {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 4;
      positions.push({
        x: Math.cos(angle) * r,
        z: Math.sin(angle) * r
      });
    }
    return positions;
  }
  
  getObstacles(): THREE.Mesh[] {
    return [...this.trees, ...this.bushes, ...this.fallenLogs];
  }
}

export const forestLevelConfig: Level = {
  id: 4,
  name: 'Dark Forest',
  theme: 'forest',
  waves: [
    { 
      zombieCount: 6, 
      zombieTypes: [
        { type: 'basic', percentage: 50 },
        { type: 'camouflaged' as any, percentage: 50 }
      ], 
      spawnDelay: 2 
    },
    { 
      zombieCount: 8, 
      zombieTypes: [
        { type: 'basic', percentage: 25 },
        { type: 'camouflaged' as any, percentage: 50 },
        { type: 'fast', percentage: 25 }
      ], 
      spawnDelay: 2.5 
    },
    { 
      zombieCount: 10, 
      zombieTypes: [
        { type: 'camouflaged' as any, percentage: 60 },
        { type: 'fast', percentage: 30 },
        { type: 'armored', percentage: 10 }
      ], 
      spawnDelay: 3 
    }
  ],
  spawnPoints: [
    { x: 20, y: 0, z: 20 },
    { x: -20, y: 0, z: 20 },
    { x: 20, y: 0, z: -20 },
    { x: -20, y: 0, z: -20 },
    { x: 0, y: 0, z: 25 },
    { x: 0, y: 0, z: -25 }
  ],
  playerStartPosition: { x: 0, y: 0.5, z: 0 }
};