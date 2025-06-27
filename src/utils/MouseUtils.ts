import * as THREE from 'three';

export class MouseUtils {
  /**
   * Convert screen coordinates to world coordinates for isometric view
   * @param mouseX Screen X coordinate (0 to canvas width)
   * @param mouseY Screen Y coordinate (0 to canvas height)
   * @param camera The orthographic camera
   * @param container The canvas container element
   * @param playerY The Y position of the player (height)
   */
  public static screenToWorld(
    mouseX: number,
    mouseY: number,
    camera: THREE.OrthographicCamera,
    container: HTMLElement,
    playerY: number = 0
  ): THREE.Vector3 {
    // Create normalized device coordinates (-1 to 1)
    const rect = container.getBoundingClientRect();
    const ndcX = ((mouseX / rect.width) * 2) - 1;
    const ndcY = -((mouseY / rect.height) * 2) + 1;

    // Create a vector in NDC space
    const vector = new THREE.Vector3(ndcX, ndcY, 0);

    // Unproject the vector from screen space to world space
    vector.unproject(camera);

    // Since we're using an orthographic camera, we need to create a ray
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // Calculate the intersection with the player's Y plane
    const distance = (playerY - vector.y) / cameraDirection.y;
    const worldPosition = new THREE.Vector3(
      vector.x + cameraDirection.x * distance,
      playerY,
      vector.z + cameraDirection.z * distance
    );

    return worldPosition;
  }

  /**
   * Calculate the angle between player position and mouse world position
   * @param playerPosition Player's world position
   * @param mouseWorldPosition Mouse position in world coordinates
   */
  public static calculateAimAngle(
    playerPosition: THREE.Vector3,
    mouseWorldPosition: THREE.Vector3
  ): number {
    const direction = new THREE.Vector3(
      mouseWorldPosition.x - playerPosition.x,
      0,
      mouseWorldPosition.z - playerPosition.z
    );

    // Calculate angle in radians (0 is pointing along positive Z axis)
    const angle = Math.atan2(direction.x, direction.z);
    return angle;
  }

  /**
   * Get normalized aim direction vector
   * @param playerPosition Player's world position
   * @param mouseWorldPosition Mouse position in world coordinates
   */
  public static getAimDirection(
    playerPosition: THREE.Vector3,
    mouseWorldPosition: THREE.Vector3
  ): THREE.Vector3 {
    const direction = new THREE.Vector3(
      mouseWorldPosition.x - playerPosition.x,
      0,
      mouseWorldPosition.z - playerPosition.z
    );
    direction.normalize();
    return direction;
  }
}