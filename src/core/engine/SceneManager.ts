import * as THREE from 'three';
import { Vector3 } from '../../types';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private cameraOffset: THREE.Vector3;
  private readonly ISOMETRIC_DISTANCE = 30;

  constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    this.scene = scene;
    this.camera = camera;
    this.cameraOffset = new THREE.Vector3();
    this.setupIsometricCamera();
  }

  private setupIsometricCamera(): void {
    // True isometric angle: 45° rotation around Y axis, 35.264° tilt down
    const angleY = Math.PI / 4; // 45 degrees
    const angleX = Math.atan(1 / Math.sqrt(2)); // ~35.264 degrees
    
    // Calculate camera offset for isometric view
    this.cameraOffset.x = Math.sin(angleY) * Math.cos(angleX) * this.ISOMETRIC_DISTANCE;
    this.cameraOffset.y = Math.sin(angleX) * this.ISOMETRIC_DISTANCE;
    this.cameraOffset.z = Math.cos(angleY) * Math.cos(angleX) * this.ISOMETRIC_DISTANCE;
    
    // Set initial camera position
    this.camera.position.copy(this.cameraOffset);
    this.camera.lookAt(0, 0, 0);
  }

  public setupScene(theme?: string): void {
    // Set up fog for depth
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
    
    // Create gradient background
    this.createGradientBackground();
    
    // Setup enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 100;
    // Add shadow bias to prevent acne
    directionalLight.shadow.bias = -0.0005;
    directionalLight.shadow.normalBias = 0.02;
    this.scene.add(directionalLight);
    
    // Add hemisphere light for better ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x3a5f3a, 0.4);
    this.scene.add(hemisphereLight);
    
    // Create ground and decorations based on theme
    if (theme === 'city-streets') {
      this.createCityStreets();
    } else {
      // Default simple map
      this.createGroundWithGrid();
      this.addSceneDecorations();
    }
  }

  private createGradientBackground(): void {
    // Create a gradient background using a large sphere
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x87CEEB) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
  }

  private createGroundWithGrid(): void {
    // Create ground plane with grid texture
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    
    // Create a canvas texture for the grid with more detail
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d')!;
    
    // Create gradient background for ground
    const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, '#4a6f4a');
    gradient.addColorStop(0.5, '#3a5f3a');
    gradient.addColorStop(1, '#2a4f2a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);
    
    // Add some noise/texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const brightness = Math.random() * 20 - 10;
      context.fillStyle = `rgba(${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${brightness > 0 ? 255 : 0}, ${Math.abs(brightness) / 100})`;
      context.fillRect(x, y, 2, 2);
    }
    
    // Draw grid lines with varying opacity
    const gridSize = 1024 / 50;
    
    // Main grid lines
    for (let i = 0; i <= 50; i++) {
      const pos = i * gridSize;
      
      // Vary line opacity based on position
      const opacity = i % 5 === 0 ? 0.3 : 0.15;
      context.strokeStyle = `rgba(42, 79, 42, ${opacity})`;
      context.lineWidth = i % 5 === 0 ? 2 : 1;
      
      // Vertical lines
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, 1024);
      context.stroke();
      
      // Horizontal lines
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(1024, pos);
      context.stroke();
    }
    
    // Add grass patches
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 5 + Math.random() * 15;
      
      const grassGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      grassGradient.addColorStop(0, 'rgba(90, 140, 90, 0.3)');
      grassGradient.addColorStop(1, 'rgba(90, 140, 90, 0)');
      
      context.fillStyle = grassGradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add dirt patches
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const width = 10 + Math.random() * 30;
      const height = 10 + Math.random() * 30;
      
      context.fillStyle = `rgba(${110 + Math.random() * 20}, ${90 + Math.random() * 20}, ${60 + Math.random() * 20}, 0.2)`;
      context.fillRect(x - width/2, y - height/2, width, height);
    }
    
    const gridTexture = new THREE.CanvasTexture(canvas);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: gridTexture,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01; // Slightly lower to prevent z-fighting
    ground.receiveShadow = true;
    ground.userData.groundPlane = true;
    this.scene.add(ground);
  }

  private addSceneDecorations(): void {
    // Add various rock types
    const rockGeometries = [
      new THREE.DodecahedronGeometry(1.5, 0),
      new THREE.SphereGeometry(1.2, 8, 6),
      new THREE.BoxGeometry(1.8, 1.2, 1.4)
    ];
    
    // Rock materials with variations
    const rockMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0x5a5a5a,
        roughness: 0.9,
        metalness: 0.1
      }),
      new THREE.MeshStandardMaterial({
        color: 0x6b6b6b,
        roughness: 0.95,
        metalness: 0.05
      }),
      new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.85,
        metalness: 0.15
      })
    ];
    
    // Add more rocks in clusters
    const rockClusters = [
      { center: { x: 20, z: 20 }, count: 5 },
      { center: { x: -25, z: 15 }, count: 4 },
      { center: { x: 30, z: -20 }, count: 6 },
      { center: { x: -20, z: -25 }, count: 3 },
      { center: { x: 0, z: 35 }, count: 4 },
      { center: { x: -35, z: 0 }, count: 5 }
    ];
    
    rockClusters.forEach(cluster => {
      for (let i = 0; i < cluster.count; i++) {
        const geometry = rockGeometries[Math.floor(Math.random() * rockGeometries.length)];
        const material = rockMaterials[Math.floor(Math.random() * rockMaterials.length)].clone();
        
        const rock = new THREE.Mesh(geometry, material);
        
        // Position rocks in cluster
        const angle = (i / cluster.count) * Math.PI * 2;
        const distance = Math.random() * 3;
        rock.position.set(
          cluster.center.x + Math.cos(angle) * distance,
          0.3 + Math.random() * 0.5,
          cluster.center.z + Math.sin(angle) * distance
        );
        
        rock.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        
        const scale = 0.3 + Math.random() * 0.7;
        rock.scale.setScalar(scale);
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);
      }
    });
    
    // Add grass patches
    this.addGrassPatches();
    
    // Add trees or bushes
    this.addVegetation();

    // Add boundary walls (visual indicators)
    this.addBoundaryWalls();
  }
  
  private addGrassPatches(): void {
    const grassGeometry = new THREE.PlaneGeometry(2, 2);
    const grassTexture = this.createGrassTexture();
    
    for (let i = 0; i < 20; i++) {
      const grassMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture,
        color: new THREE.Color(0.3 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 0.3),
        roughness: 0.8,
        metalness: 0,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      grass.position.set(
        (Math.random() - 0.5) * 80,
        0.1,
        (Math.random() - 0.5) * 80
      );
      grass.rotation.x = -Math.PI / 2;
      grass.rotation.z = Math.random() * Math.PI;
      grass.scale.setScalar(0.5 + Math.random() * 1);
      grass.receiveShadow = true;
      this.scene.add(grass);
    }
  }
  
  private createGrassTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    
    // Create grass blade pattern
    context.fillStyle = 'rgba(50, 100, 50, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const height = 10 + Math.random() * 20;
      
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x - 1, y - height);
      context.lineTo(x + 1, y - height);
      context.closePath();
      context.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  private addVegetation(): void {
    // Add simple trees/bushes
    const treePositions = [
      { x: 15, z: -30 },
      { x: -30, z: 25 },
      { x: 35, z: 10 },
      { x: -15, z: -35 },
      { x: 25, z: 30 },
      { x: -35, z: -10 }
    ];
    
    treePositions.forEach(pos => {
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3020,
        roughness: 0.9,
        metalness: 0
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(pos.x, 1.5, pos.z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      this.scene.add(trunk);
      
      // Tree foliage (simple sphere clusters)
      const foliageGroup = new THREE.Group();
      const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 6);
      const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        roughness: 0.8,
        metalness: 0
      });
      
      // Main foliage
      const mainFoliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliageGroup.add(mainFoliage);
      
      // Additional foliage spheres for fuller look
      for (let i = 0; i < 3; i++) {
        const extraFoliage = new THREE.Mesh(
          new THREE.SphereGeometry(1, 6, 5),
          foliageMaterial.clone()
        );
        extraFoliage.position.set(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 2
        );
        foliageGroup.add(extraFoliage);
      }
      
      foliageGroup.position.set(pos.x, 4, pos.z);
      foliageGroup.scale.setScalar(0.8 + Math.random() * 0.4);
      foliageGroup.castShadow = true;
      foliageGroup.receiveShadow = true;
      this.scene.add(foliageGroup);
    });
  }

  private addBoundaryWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.5,
      depthWrite: false, // Prevent depth buffer conflicts
      side: THREE.DoubleSide // Render both sides
    });

    const wallHeight = 5;
    const wallThickness = 0.5;
    const boundarySize = 45;

    // North wall
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(boundarySize * 2, wallHeight, wallThickness),
      wallMaterial
    );
    northWall.position.set(0, wallHeight / 2, -boundarySize);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    this.scene.add(northWall);

    // South wall
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(boundarySize * 2, wallHeight, wallThickness),
      wallMaterial
    );
    southWall.position.set(0, wallHeight / 2, boundarySize);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    this.scene.add(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, boundarySize * 2),
      wallMaterial
    );
    eastWall.position.set(boundarySize, wallHeight / 2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);

    // West wall
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, boundarySize * 2),
      wallMaterial
    );
    westWall.position.set(-boundarySize, wallHeight / 2, 0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    this.scene.add(westWall);
  }

  public updateCameraPosition(playerPosition: Vector3): void {
    // Camera follows player with isometric offset
    this.camera.position.x = playerPosition.x + this.cameraOffset.x;
    this.camera.position.y = playerPosition.y + this.cameraOffset.y;
    this.camera.position.z = playerPosition.z + this.cameraOffset.z;
    this.camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
  }
  
  private createCityStreets(): void {
    // Create asphalt ground with road texture
    const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    
    // Create city street texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d')!;
    
    // Asphalt base
    const asphaltGradient = context.createLinearGradient(0, 0, 1024, 1024);
    asphaltGradient.addColorStop(0, '#2a2a2a');
    asphaltGradient.addColorStop(0.5, '#1f1f1f');
    asphaltGradient.addColorStop(1, '#2a2a2a');
    context.fillStyle = asphaltGradient;
    context.fillRect(0, 0, 1024, 1024);
    
    // Add asphalt texture
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const brightness = Math.random() * 30;
      context.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.3)`;
      context.fillRect(x, y, 1, 1);
    }
    
    // Draw road markings
    context.strokeStyle = '#ffcc00';
    context.lineWidth = 6;
    context.setLineDash([40, 20]);
    
    // Center lanes (vertical)
    context.beginPath();
    context.moveTo(512, 0);
    context.lineTo(512, 1024);
    context.stroke();
    
    // Center lanes (horizontal)
    context.beginPath();
    context.moveTo(0, 512);
    context.lineTo(1024, 512);
    context.stroke();
    
    // Side lanes
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 4;
    context.setLineDash([]);
    
    // Vertical lanes
    context.beginPath();
    context.moveTo(256, 0);
    context.lineTo(256, 1024);
    context.stroke();
    
    context.beginPath();
    context.moveTo(768, 0);
    context.lineTo(768, 1024);
    context.stroke();
    
    // Horizontal lanes
    context.beginPath();
    context.moveTo(0, 256);
    context.lineTo(1024, 256);
    context.stroke();
    
    context.beginPath();
    context.moveTo(0, 768);
    context.lineTo(1024, 768);
    context.stroke();
    
    // Add crosswalk patterns
    context.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const crosswalkWidth = 80;
    const stripeWidth = 10;
    
    // Crosswalks at intersections
    for (let i = 0; i < 8; i++) {
      // Vertical crosswalk
      context.fillRect(512 - crosswalkWidth/2 + i * 12, 256 - 40, stripeWidth, 80);
      context.fillRect(512 - crosswalkWidth/2 + i * 12, 768 - 40, stripeWidth, 80);
      
      // Horizontal crosswalk
      context.fillRect(256 - 40, 512 - crosswalkWidth/2 + i * 12, 80, stripeWidth);
      context.fillRect(768 - 40, 512 - crosswalkWidth/2 + i * 12, 80, stripeWidth);
    }
    
    // Add oil stains and cracks
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 10 + Math.random() * 30;
      
      const stainGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      stainGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
      stainGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      context.fillStyle = stainGradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    const streetTexture = new THREE.CanvasTexture(canvas);
    streetTexture.wrapS = THREE.RepeatWrapping;
    streetTexture.wrapT = THREE.RepeatWrapping;
    
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      map: streetTexture,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    ground.userData.groundPlane = true;
    this.scene.add(ground);
    
    // Add city decorations
    this.addCityDecorations();
    
    // Add boundary walls
    this.addBoundaryWalls();
  }
  
  private addCityDecorations(): void {
    // Add street lights
    const streetLightPositions = [
      { x: 15, z: 15 },
      { x: -15, z: 15 },
      { x: 15, z: -15 },
      { x: -15, z: -15 },
      { x: 0, z: 30 },
      { x: 0, z: -30 },
      { x: 30, z: 0 },
      { x: -30, z: 0 }
    ];
    
    streetLightPositions.forEach(pos => {
      // Light pole
      const poleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 6);
      const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.7,
        metalness: 0.8
      });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(pos.x, 3, pos.z);
      pole.castShadow = true;
      pole.receiveShadow = true;
      pole.userData.decorative = true;
      this.scene.add(pole);
      
      // Light fixture
      const lightGeometry = new THREE.BoxGeometry(1, 0.5, 1);
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
      });
      const lightFixture = new THREE.Mesh(lightGeometry, lightMaterial);
      lightFixture.position.set(pos.x, 5.5, pos.z);
      lightFixture.castShadow = true;
      lightFixture.userData.decorative = true;
      this.scene.add(lightFixture);
      
      // Add actual point light
      const pointLight = new THREE.PointLight(0xffaa00, 0.5, 15);
      pointLight.position.set(pos.x, 5, pos.z);
      pointLight.castShadow = true;
      pointLight.userData.decorative = true;
      this.scene.add(pointLight);
    });
    
    // Add fire hydrants
    const hydrantPositions = [
      { x: 10, z: 5 },
      { x: -10, z: -5 },
      { x: -5, z: 10 },
      { x: 5, z: -10 }
    ];
    
    hydrantPositions.forEach(pos => {
      const hydrantGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1);
      const hydrantMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc0000,
        roughness: 0.3,
        metalness: 0.7
      });
      const hydrant = new THREE.Mesh(hydrantGeometry, hydrantMaterial);
      hydrant.position.set(pos.x, 0.5, pos.z);
      hydrant.castShadow = true;
      hydrant.receiveShadow = true;
      hydrant.userData.decorative = true;
      this.scene.add(hydrant);
      
      // Add cap on top
      const capGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.2);
      const cap = new THREE.Mesh(capGeometry, hydrantMaterial);
      cap.position.set(pos.x, 1.1, pos.z);
      cap.castShadow = true;
      cap.userData.decorative = true;
      this.scene.add(cap);
    });
    
    // Add trash cans
    const trashCanPositions = [
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 12, z: 12 },
      { x: -12, z: -12 }
    ];
    
    trashCanPositions.forEach(pos => {
      const canGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.5);
      const canMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a5a3a,
        roughness: 0.8,
        metalness: 0.3
      });
      const trashCan = new THREE.Mesh(canGeometry, canMaterial);
      trashCan.position.set(pos.x, 0.75, pos.z);
      trashCan.castShadow = true;
      trashCan.receiveShadow = true;
      trashCan.userData.decorative = true;
      this.scene.add(trashCan);
    });
    
    // Add road barriers/cones
    const conePositions = [
      { x: 5, z: 0 },
      { x: -5, z: 0 },
      { x: 0, z: 5 },
      { x: 0, z: -5 }
    ];
    
    conePositions.forEach(pos => {
      const coneGeometry = new THREE.ConeGeometry(0.4, 1, 6);
      const coneMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600,
        roughness: 0.5,
        metalness: 0.1
      });
      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      cone.position.set(pos.x, 0.5, pos.z);
      cone.castShadow = true;
      cone.receiveShadow = true;
      cone.userData.decorative = true;
      this.scene.add(cone);
      
      // Add reflective stripes
      const stripeGeometry = new THREE.RingGeometry(0.35, 0.4, 6);
      const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.2
      });
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.set(pos.x, 0.7, pos.z);
      stripe.rotation.x = -Math.PI / 2;
      stripe.userData.decorative = true;
      this.scene.add(stripe);
    });
  }
}