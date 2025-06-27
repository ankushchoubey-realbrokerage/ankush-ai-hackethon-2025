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
    // Set background
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Add ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a5f3a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Add grid helper for development
    const gridHelper = new THREE.GridHelper(100, 50, 0x000000, 0x000000);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  public updateCameraPosition(playerPosition: Vector3): void {
    // Camera follows player with isometric offset
    this.camera.position.x = playerPosition.x + this.cameraOffset.x;
    this.camera.position.y = playerPosition.y + this.cameraOffset.y;
    this.camera.position.z = playerPosition.z + this.cameraOffset.z;
    this.camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
  }
}