import { PlayerInput } from '../../types';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private isFiring: boolean = false;
  private canvas: HTMLCanvasElement;
  private weaponSwitch: number | null = null;
  private debugMode: boolean = false;
  private debugCollisions: boolean = false;
  private pauseToggled: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
    
    // Log input manager initialization
    if (import.meta.env.DEV) {
      console.log('InputManager initialized');
    }
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse events
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Prevent default for game keys
    if (['w', 'a', 's', 'd', ' ', 'W', 'A', 'S', 'D'].includes(e.key)) {
      e.preventDefault();
    }
    
    this.keys.set(e.key.toLowerCase(), true);
    
    // Handle weapon switching
    if (e.key >= '1' && e.key <= '4') {
      this.weaponSwitch = parseInt(e.key) - 1; // 0-indexed
    }
    
    // Toggle debug mode with F1
    if (e.key === 'F1') {
      this.debugMode = !this.debugMode;
      console.log('Debug mode:', this.debugMode);
    }
    
    // Toggle collision debug with F2
    if (e.key === 'F2') {
      this.debugCollisions = true;
    }
    
    // Toggle pause with ESC
    if (e.key === 'Escape') {
      this.pauseToggled = true;
    }
    
    // Log key presses in debug mode
    if (this.debugMode && import.meta.env.DEV) {
      console.log('Key pressed:', e.key);
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.set(e.key.toLowerCase(), false);
  };

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) { // Left click
      this.isFiring = true;
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.isFiring = false;
    }
  };

  public getInput(): PlayerInput {
    const input: PlayerInput = {
      movement: {
        up: this.keys.get('w') || false,
        down: this.keys.get('s') || false,
        left: this.keys.get('a') || false,
        right: this.keys.get('d') || false
      },
      mousePosition: this.mousePosition,
      isFiring: this.isFiring || (this.keys.get(' ') || false),
      weaponSwitch: this.weaponSwitch !== null ? this.weaponSwitch : undefined,
      debugCollisions: this.debugCollisions,
      pauseToggled: this.pauseToggled
    };
    
    // Clear weapon switch after reading
    if (this.weaponSwitch !== null) {
      this.weaponSwitch = null;
    }
    
    // Clear debug collision toggle after reading
    if (this.debugCollisions) {
      this.debugCollisions = false;
    }
    
    // Clear pause toggle after reading
    if (this.pauseToggled) {
      this.pauseToggled = false;
    }
    
    return input;
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }

  public getActiveKeys(): string[] {
    const activeKeys: string[] = [];
    this.keys.forEach((isPressed, key) => {
      if (isPressed) {
        activeKeys.push(key);
      }
    });
    return activeKeys;
  }

  public isDebugMode(): boolean {
    return this.debugMode;
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }
}