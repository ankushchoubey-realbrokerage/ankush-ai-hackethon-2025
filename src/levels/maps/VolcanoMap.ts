import * as THREE from 'three';
import { EnvironmentalHazard, Vector3 } from '../../types';

// STEP 35: Volcano Map with Lava Hazards

export class VolcanoMap {
  private scene: THREE.Scene;
  private groundMesh: THREE.Mesh | null = null;
  private lavaHazards: EnvironmentalHazard[] = [];
  private lavaPools: THREE.Mesh[] = [];
  private obstacles: THREE.Mesh[] = [];
  private ashParticles: THREE.Points | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  initialize(): void {
    this.createGround();
    this.createLavaPools();
    this.createVolcanicRocks();
    this.setupLighting();
    this.createAshParticles();
  }

  private createGround(): void {
    // Create rocky volcanic terrain
    const groundGeometry = new THREE.PlaneGeometry(50, 50, 50, 50);
    
    // Add height variation to simulate rocky terrain
    const vertices = groundGeometry.getAttribute('position');
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const z = vertices.getZ(i);
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      
      // Create crater-like terrain with higher edges
      let height = Math.max(0, distanceFromCenter * 0.1 - 1);
      
      // Add random rocky variations
      height += Math.random() * 0.5;
      
      vertices.setY(i, height);
    }
    
    vertices.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      roughness: 0.9,
      metalness: 0.1
    });

    this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

  private createLavaPools(): void {
    // Define lava pool positions
    const lavaPoolData: { position: Vector3; dimensions: Vector3 }[] = [
      { position: { x: -10, y: 0, z: -10 }, dimensions: { x: 8, y: 0.5, z: 8 } },
      { position: { x: 10, y: 0, z: 10 }, dimensions: { x: 6, y: 0.5, z: 6 } },
      { position: { x: -5, y: 0, z: 8 }, dimensions: { x: 4, y: 0.5, z: 4 } },
      { position: { x: 12, y: 0, z: -8 }, dimensions: { x: 5, y: 0.5, z: 5 } },
      { position: { x: 0, y: 0, z: 0 }, dimensions: { x: 10, y: 0.5, z: 10 } } // Central crater
    ];

    lavaPoolData.forEach((poolData, index) => {
      // Create lava visual
      const lavaGeometry = new THREE.BoxGeometry(
        poolData.dimensions.x,
        poolData.dimensions.y,
        poolData.dimensions.z
      );
      
      const lavaMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff2200,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.2
      });

      const lavaMesh = new THREE.Mesh(lavaGeometry, lavaMaterial);
      lavaMesh.position.set(
        poolData.position.x,
        poolData.position.y - 0.2,
        poolData.position.z
      );
      
      this.scene.add(lavaMesh);
      this.lavaPools.push(lavaMesh);

      // Create hazard data
      const hazard: EnvironmentalHazard = {
        type: 'lava',
        position: poolData.position,
        dimensions: poolData.dimensions,
        damage: 20 // 20 damage per second
      };
      
      this.lavaHazards.push(hazard);
    });
  }

  private createVolcanicRocks(): void {
    // Create volcanic rock obstacles
    const rockPositions = [
      { x: -15, y: 1, z: -15 },
      { x: 15, y: 1.2, z: -15 },
      { x: -15, y: 0.8, z: 15 },
      { x: 15, y: 1.5, z: 15 },
      { x: -8, y: 0.6, z: -5 },
      { x: 8, y: 0.9, z: 5 },
      { x: -20, y: 1.3, z: 0 },
      { x: 20, y: 1.1, z: 0 }
    ];

    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a0f08,
      roughness: 1,
      metalness: 0
    });

    rockPositions.forEach(pos => {
      const rockScale = 0.5 + Math.random() * 1.5;
      const rockGeometry = new THREE.SphereGeometry(rockScale, 8, 6);
      
      // Make rocks more irregular
      const vertices = rockGeometry.getAttribute('position');
      for (let i = 0; i < vertices.count; i++) {
        const x = vertices.getX(i);
        const y = vertices.getY(i);
        const z = vertices.getZ(i);
        
        const noise = (Math.random() - 0.5) * 0.3;
        vertices.setX(i, x * (1 + noise));
        vertices.setY(i, y * (1 + noise));
        vertices.setZ(i, z * (1 + noise));
      }
      
      vertices.needsUpdate = true;
      rockGeometry.computeVertexNormals();

      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(pos.x, pos.y, pos.z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      
      this.scene.add(rock);
      this.obstacles.push(rock);
    });
  }

  private setupLighting(): void {
    // Remove existing lights
    const existingLights = this.scene.children.filter(
      child => child instanceof THREE.Light
    );
    existingLights.forEach(light => this.scene.remove(light));

    // Ambient light with red/orange tint
    const ambientLight = new THREE.AmbientLight(0x442211, 0.3);
    this.scene.add(ambientLight);

    // Directional light (sun through ash)
    const directionalLight = new THREE.DirectionalLight(0xff8844, 0.6);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    // Point lights for lava glow
    this.lavaPools.forEach(pool => {
      const lavaLight = new THREE.PointLight(0xff4400, 1, 10);
      lavaLight.position.copy(pool.position);
      lavaLight.position.y += 0.5;
      this.scene.add(lavaLight);
    });
  }

  getLavaHazards(): EnvironmentalHazard[] {
    return this.lavaHazards;
  }

  getObstacles(): THREE.Mesh[] {
    return this.obstacles;
  }
  
  // STEP 35: Create ash particle effects
  private createAshParticles(): void {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    // Initialize particle positions
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;     // x
      positions[i3 + 1] = Math.random() * 20 + 5;     // y (5-25 units high)
      positions[i3 + 2] = (Math.random() - 0.5) * 60; // z
      
      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.2;     // x velocity
      velocities[i3 + 1] = -Math.random() * 0.5 - 0.1;  // y velocity (falling)
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2; // z velocity
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x333333,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    
    this.ashParticles = new THREE.Points(geometry, material);
    this.scene.add(this.ashParticles);
    
    // Animate ash particles
    this.animateAshParticles();
  }
  
  private animateAshParticles(): void {
    if (!this.ashParticles) return;
    
    const animate = () => {
      if (!this.ashParticles) return;
      
      const positions = this.ashParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const velocities = this.ashParticles.geometry.getAttribute('velocity') as THREE.BufferAttribute;
      
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        
        // Update positions
        positions.array[i3] += velocities.array[i3];
        positions.array[i3 + 1] += velocities.array[i3 + 1];
        positions.array[i3 + 2] += velocities.array[i3 + 2];
        
        // Reset particles that fall too low
        if (positions.array[i3 + 1] < -1) {
          positions.array[i3] = (Math.random() - 0.5) * 60;
          positions.array[i3 + 1] = Math.random() * 20 + 15;
          positions.array[i3 + 2] = (Math.random() - 0.5) * 60;
        }
      }
      
      positions.needsUpdate = true;
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  cleanup(): void {
    if (this.groundMesh) {
      this.scene.remove(this.groundMesh);
      this.groundMesh.geometry.dispose();
      (this.groundMesh.material as THREE.Material).dispose();
    }

    this.lavaPools.forEach(pool => {
      this.scene.remove(pool);
      pool.geometry.dispose();
      (pool.material as THREE.Material).dispose();
    });

    this.obstacles.forEach(obstacle => {
      this.scene.remove(obstacle);
      obstacle.geometry.dispose();
      (obstacle.material as THREE.Material).dispose();
    });

    // Remove point lights
    const pointLights = this.scene.children.filter(
      child => child instanceof THREE.PointLight
    );
    pointLights.forEach(light => this.scene.remove(light));
    
    // Clean up ash particles
    if (this.ashParticles) {
      this.scene.remove(this.ashParticles);
      this.ashParticles.geometry.dispose();
      (this.ashParticles.material as THREE.Material).dispose();
      this.ashParticles = null;
    }
  }
}