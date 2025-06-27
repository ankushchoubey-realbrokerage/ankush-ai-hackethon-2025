import * as THREE from 'three';
import { Vector3 } from '../../types';

export class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;

  constructor(scene: THREE.Scene, camera: THREE.OrthographicCamera) {
    this.scene = scene;
    this.camera = camera;
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
    this.scene.add(directionalLight);
    
    // Setup isometric camera position
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(0, 0, 0);
    
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
    this.camera.position.x = playerPosition.x + 20;
    this.camera.position.y = 20;
    this.camera.position.z = playerPosition.z + 20;
    this.camera.lookAt(playerPosition.x, playerPosition.y, playerPosition.z);
  }
}