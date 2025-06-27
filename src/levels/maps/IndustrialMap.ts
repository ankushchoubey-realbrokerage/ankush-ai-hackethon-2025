import * as THREE from 'three';
import { Level } from '../../types';
import { ConveyorBelt } from '../mechanics/ConveyorBelt';
import { SteamVent, Crusher, ElectricalHazard, ToxicPool } from '../mechanics/IndustrialHazards';
import { ParticleSystem } from '../../effects/ParticleSystem';

export class IndustrialMap {
  private scene: THREE.Scene;
  private conveyorBelts: ConveyorBelt[] = [];
  private hazards: any[] = [];
  private obstacles: THREE.Mesh[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  load(particleSystem?: ParticleSystem): void {
    this.createFactoryFloor();
    this.createConveyorBelts();
    this.createIndustrialHazards(particleSystem);
    this.createMachinery();
    this.createCatwalks();
    this.createBossArena();
    this.createFactoryWalls();
  }
  
  private createFactoryFloor(): void {
    // Main factory floor
    const floorGeometry = new THREE.BoxGeometry(60, 0.5, 60);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.3,
      roughness: 0.7
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Floor markings
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const markingGeometry = new THREE.PlaneGeometry(2, 10);
    
    // Safety lines
    for (let i = -20; i <= 20; i += 10) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(i, 0.01, 0);
      this.scene.add(marking);
    }
  }
  
  private createConveyorBelts(): void {
    // Main assembly line conveyor
    const mainConveyor = new ConveyorBelt({
      position: { x: 0, y: 0.5, z: -10 },
      dimensions: { x: 30, y: 0.3, z: 3 },
      direction: { x: 1, y: 0, z: 0 },
      speed: 2
    });
    this.conveyorBelts.push(mainConveyor);
    this.scene.add(mainConveyor.getMesh());
    mainConveyor.getArrows().forEach(arrow => this.scene.add(arrow));
    
    // Cross conveyor
    const crossConveyor = new ConveyorBelt({
      position: { x: 15, y: 0.5, z: 0 },
      dimensions: { x: 3, y: 0.3, z: 20 },
      direction: { x: 0, y: 0, z: -1 },
      speed: 2.5
    });
    this.conveyorBelts.push(crossConveyor);
    this.scene.add(crossConveyor.getMesh());
    crossConveyor.getArrows().forEach(arrow => this.scene.add(arrow));
    
    // Return conveyor
    const returnConveyor = new ConveyorBelt({
      position: { x: 0, y: 0.5, z: 10 },
      dimensions: { x: 30, y: 0.3, z: 3 },
      direction: { x: -1, y: 0, z: 0 },
      speed: 2
    });
    this.conveyorBelts.push(returnConveyor);
    this.scene.add(returnConveyor.getMesh());
    returnConveyor.getArrows().forEach(arrow => this.scene.add(arrow));
  }
  
  private createIndustrialHazards(particleSystem?: ParticleSystem): void {
    // Steam vents along the main path
    const steamVentPositions = [
      { x: -10, y: 0, z: -5 },
      { x: 5, y: 0, z: -5 },
      { x: -5, y: 0, z: 5 },
      { x: 10, y: 0, z: 5 }
    ];
    
    steamVentPositions.forEach(pos => {
      const vent = new SteamVent({
        position: pos,
        type: 'steam_vent',
        damage: 10,
        interval: 4 + Math.random() * 2
      });
      if (particleSystem) {
        vent.setParticleSystem(particleSystem);
      }
      this.hazards.push(vent);
      this.scene.add(vent.getMesh());
    });
    
    // Crushers in narrow passages
    const crusherPositions = [
      { x: -15, y: 0, z: 0 },
      { x: 20, y: 0, z: -15 }
    ];
    
    crusherPositions.forEach(pos => {
      const crusher = new Crusher({
        position: pos,
        type: 'crusher',
        damage: 1000,
        interval: 3
      });
      this.hazards.push(crusher);
      this.scene.add(crusher.getMesh());
    });
    
    // Electrical hazards
    const electricalPositions = [
      { x: -20, y: 0, z: -20 },
      { x: 20, y: 0, z: 20 }
    ];
    
    electricalPositions.forEach(pos => {
      const electrical = new ElectricalHazard({
        position: pos,
        type: 'electrical',
        damage: 15,
        interval: 5
      });
      this.hazards.push(electrical);
      this.scene.add(electrical.getMesh());
    });
    
    // Toxic waste pools
    const toxicPool = new ToxicPool({
      position: { x: -10, y: 0, z: 15 },
      type: 'toxic_pool',
      damage: 5,
      dimensions: { x: 6, y: 0.2, z: 6 }
    });
    if (particleSystem) {
      toxicPool.setParticleSystem(particleSystem);
    }
    this.hazards.push(toxicPool);
    this.scene.add(toxicPool.getMesh());
  }
  
  private createMachinery(): void {
    // Large industrial machines
    const machineGeometry = new THREE.BoxGeometry(4, 6, 4);
    const machineMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.7,
      roughness: 0.3
    });
    
    const machinePositions = [
      { x: -20, y: 3, z: -10 },
      { x: -20, y: 3, z: 10 },
      { x: 20, y: 3, z: -10 },
      { x: 20, y: 3, z: 10 }
    ];
    
    machinePositions.forEach(pos => {
      const machine = new THREE.Mesh(machineGeometry, machineMaterial);
      machine.position.set(pos.x, pos.y, pos.z);
      machine.castShadow = true;
      machine.receiveShadow = true;
      this.scene.add(machine);
      this.obstacles.push(machine);
      
      // Add pipes
      const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
      const pipeMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.2
      });
      const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
      pipe.position.set(pos.x, pos.y + 3, pos.z);
      pipe.rotation.z = Math.PI / 2;
      this.scene.add(pipe);
    });
  }
  
  private createCatwalks(): void {
    // Elevated walkways
    const walkwayGeometry = new THREE.BoxGeometry(20, 0.2, 2);
    const walkwayMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.5,
      roughness: 0.5
    });
    
    // Main catwalk
    const catwalk1 = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
    catwalk1.position.set(0, 5, -20);
    catwalk1.castShadow = true;
    catwalk1.receiveShadow = true;
    this.scene.add(catwalk1);
    
    // Cross catwalk
    const catwalk2 = new THREE.Mesh(walkwayGeometry, walkwayMaterial);
    catwalk2.position.set(0, 5, 20);
    catwalk2.rotation.y = Math.PI / 2;
    catwalk2.castShadow = true;
    catwalk2.receiveShadow = true;
    this.scene.add(catwalk2);
    
    // Railings
    const railGeometry = new THREE.BoxGeometry(20, 1, 0.1);
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.7,
      roughness: 0.3
    });
    
    // Add railings to catwalks
    [-1, 1].forEach(side => {
      const rail1 = new THREE.Mesh(railGeometry, railMaterial);
      rail1.position.set(0, 5.5, -20 + side);
      this.scene.add(rail1);
      
      const rail2 = new THREE.Mesh(railGeometry, railMaterial);
      rail2.position.set(side, 5.5, 20);
      rail2.rotation.y = Math.PI / 2;
      this.scene.add(rail2);
    });
    
    // Support pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.6,
      roughness: 0.4
    });
    
    const pillarPositions = [
      { x: -8, z: -20 },
      { x: 8, z: -20 },
      { x: 0, z: 12 },
      { x: 0, z: 28 }
    ];
    
    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.set(pos.x, 2.5, pos.z);
      pillar.castShadow = true;
      this.scene.add(pillar);
    });
  }
  
  private createBossArena(): void {
    // Large open area for Tank Zombie boss fight
    const arenaX = 0;
    const arenaZ = -30;
    const arenaSize = 20;
    
    // Arena floor with different texture
    const arenaFloorGeometry = new THREE.BoxGeometry(arenaSize, 0.5, arenaSize);
    const arenaFloorMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.4,
      roughness: 0.6,
      map: this.createArenaTexture()
    });
    const arenaFloor = new THREE.Mesh(arenaFloorGeometry, arenaFloorMaterial);
    arenaFloor.position.set(arenaX, 0.25, arenaZ);
    arenaFloor.receiveShadow = true;
    this.scene.add(arenaFloor);
    
    // Destructible cover (barrels and crates)
    const coverPositions = [
      { x: arenaX - 7, z: arenaZ - 7 },
      { x: arenaX + 7, z: arenaZ - 7 },
      { x: arenaX - 7, z: arenaZ + 7 },
      { x: arenaX + 7, z: arenaZ + 7 },
      { x: arenaX, z: arenaZ }
    ];
    
    coverPositions.forEach(pos => {
      // Barrel
      const barrelGeometry = new THREE.CylinderGeometry(1, 1, 2, 8);
      const barrelMaterial = new THREE.MeshStandardMaterial({
        color: 0x886644,
        metalness: 0.3,
        roughness: 0.7
      });
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
      barrel.position.set(pos.x, 1, pos.z);
      barrel.castShadow = true;
      barrel.receiveShadow = true;
      this.scene.add(barrel);
      this.obstacles.push(barrel);
      
      // Crate
      if (Math.random() > 0.5) {
        const crateGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const crateMaterial = new THREE.MeshStandardMaterial({
          color: 0x664422,
          metalness: 0.1,
          roughness: 0.9
        });
        const crate = new THREE.Mesh(crateGeometry, crateMaterial);
        crate.position.set(pos.x + 2, 0.75, pos.z);
        crate.rotation.y = Math.random() * Math.PI;
        crate.castShadow = true;
        crate.receiveShadow = true;
        this.scene.add(crate);
        this.obstacles.push(crate);
      }
    });
    
    // Arena walls (partial, with gaps for entry/exit)
    const wallHeight = 8;
    const wallThickness = 1;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.5,
      roughness: 0.5
    });
    
    // Back wall with gap
    const backWall1 = new THREE.Mesh(
      new THREE.BoxGeometry(arenaSize * 0.4, wallHeight, wallThickness),
      wallMaterial
    );
    backWall1.position.set(arenaX - arenaSize * 0.3, wallHeight / 2, arenaZ - arenaSize / 2);
    this.scene.add(backWall1);
    
    const backWall2 = new THREE.Mesh(
      new THREE.BoxGeometry(arenaSize * 0.4, wallHeight, wallThickness),
      wallMaterial
    );
    backWall2.position.set(arenaX + arenaSize * 0.3, wallHeight / 2, arenaZ - arenaSize / 2);
    this.scene.add(backWall2);
    
    // Side walls (partial)
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize * 0.7);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(arenaX - arenaSize / 2, wallHeight / 2, arenaZ);
    this.scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(arenaX + arenaSize / 2, wallHeight / 2, arenaZ);
    this.scene.add(rightWall);
    
    // Warning signs around arena
    const warningSignGeometry = new THREE.PlaneGeometry(2, 2);
    const warningSignMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide
    });
    
    const signPositions = [
      { x: arenaX - 10, y: 3, z: arenaZ - 10, ry: Math.PI / 4 },
      { x: arenaX + 10, y: 3, z: arenaZ - 10, ry: -Math.PI / 4 },
      { x: arenaX, y: 3, z: arenaZ + 10, ry: 0 }
    ];
    
    signPositions.forEach(pos => {
      const sign = new THREE.Mesh(warningSignGeometry, warningSignMaterial);
      sign.position.set(pos.x, pos.y, pos.z);
      sign.rotation.y = pos.ry;
      this.scene.add(sign);
    });
  }
  
  private createArenaTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Base color
    ctx.fillStyle = '#444444';
    ctx.fillRect(0, 0, 512, 512);
    
    // Grid pattern
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    for (let i = 0; i < 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    
    // Center circle
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 128, 0, Math.PI * 2);
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.repeat.set(1, 1);
    
    return texture;
  }
  
  private createFactoryWalls(): void {
    // Factory boundary walls
    const wallHeight = 12;
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x404040,
      metalness: 0.3,
      roughness: 0.8
    });
    
    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(60, wallHeight, 1),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -30);
    this.scene.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(60, wallHeight, 1),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, 30);
    this.scene.add(southWall);
    
    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, wallHeight, 60),
      wallMaterial
    );
    eastWall.position.set(30, wallHeight / 2, 0);
    this.scene.add(eastWall);
    
    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(1, wallHeight, 60),
      wallMaterial
    );
    westWall.position.set(-30, wallHeight / 2, 0);
    this.scene.add(westWall);
  }
  
  public getConveyorBelts(): ConveyorBelt[] {
    return this.conveyorBelts;
  }
  
  public getHazards(): any[] {
    return this.hazards;
  }
  
  public getObstacles(): THREE.Mesh[] {
    return this.obstacles;
  }
  
  public update(deltaTime: number): void {
    // Update conveyor belts
    this.conveyorBelts.forEach(belt => belt.update(deltaTime));
    
    // Update hazards
    this.hazards.forEach(hazard => hazard.update(deltaTime));
  }
}

export const industrialLevelConfig: Level = {
  id: 5,
  name: 'Industrial Complex',
  theme: 'industrial',
  waves: [
    { 
      zombieCount: 8, 
      zombieTypes: [
        { type: 'basic', percentage: 50 },
        { type: 'armored', percentage: 50 }
      ], 
      spawnDelay: 2 
    },
    { 
      zombieCount: 10, 
      zombieTypes: [
        { type: 'basic', percentage: 30 },
        { type: 'armored', percentage: 50 },
        { type: 'fast', percentage: 20 }
      ], 
      spawnDelay: 2.5 
    },
    { 
      zombieCount: 12, 
      zombieTypes: [
        { type: 'armored', percentage: 60 },
        { type: 'fast', percentage: 30 },
        { type: 'basic', percentage: 10 }
      ], 
      spawnDelay: 3 
    }
  ],
  spawnPoints: [
    { x: -25, y: 0, z: -25 },
    { x: 25, y: 0, z: -25 },
    { x: -25, y: 0, z: 25 },
    { x: 25, y: 0, z: 25 },
    { x: 0, y: 5, z: -20 }, // Catwalk spawn
    { x: 0, y: 5, z: 20 }   // Catwalk spawn
  ],
  playerStartPosition: { x: 0, y: 0.5, z: 0 },
  boss: 'tank-boss' as any // Tank zombie boss for arena
};