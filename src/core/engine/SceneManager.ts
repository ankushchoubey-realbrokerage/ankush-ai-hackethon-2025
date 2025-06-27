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

  public setupScene(): void {
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
    
    // Create ground with grid texture
    this.createGroundWithGrid();
    
    // Add decorative elements
    this.addSceneDecorations();
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
    
    // Create a canvas texture for the grid
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;
    
    // Draw base color
    context.fillStyle = '#3a5f3a';
    context.fillRect(0, 0, 512, 512);
    
    // Draw grid lines
    context.strokeStyle = '#2a4f2a';
    context.lineWidth = 2;
    const gridSize = 512 / 50;
    
    for (let i = 0; i <= 50; i++) {
      const pos = i * gridSize;
      context.beginPath();
      context.moveTo(pos, 0);
      context.lineTo(pos, 512);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, pos);
      context.lineTo(512, pos);
      context.stroke();
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
    this.scene.add(ground);
  }

  private addSceneDecorations(): void {
    // Add some rocks or obstacles for visual interest
    const rockGeometry = new THREE.DodecahedronGeometry(1.5, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 1,
      metalness: 0
    });
    
    const rockPositions = [
      { x: 20, y: 0.75, z: 20 },
      { x: -25, y: 0.75, z: 15 },
      { x: 30, y: 0.75, z: -20 },
      { x: -20, y: 0.75, z: -25 }
    ];
    
    rockPositions.forEach(pos => {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(pos.x, pos.y, pos.z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.scale.setScalar(0.5 + Math.random() * 0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    });

    // Add boundary walls (visual indicators)
    this.addBoundaryWalls();
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
}