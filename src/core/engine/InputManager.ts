import { PlayerInput } from '../../types';

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private isFiring: boolean = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
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
    this.keys.set(e.key.toLowerCase(), true);
    
    // Handle weapon switching
    if (e.key >= '1' && e.key <= '4') {
      // Will be implemented with weapon switching
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
    return {
      movement: {
        up: this.keys.get('w') || false,
        down: this.keys.get('s') || false,
        left: this.keys.get('a') || false,
        right: this.keys.get('d') || false
      },
      mousePosition: this.mousePosition,
      isFiring: this.isFiring || (this.keys.get(' ') || false)
    };
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }
}