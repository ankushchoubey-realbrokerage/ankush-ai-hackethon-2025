export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 0;
  private msPerFrame: number = 0;
  private updateInterval: number = 500; // Update every 500ms
  
  private fpsElement?: HTMLDivElement;
  private enabled: boolean = false;

  constructor(enabled: boolean = false) {
    this.enabled = enabled && import.meta.env.DEV;
    
    if (this.enabled) {
      this.createDisplay();
    }
  }

  private createDisplay(): void {
    this.fpsElement = document.createElement('div');
    this.fpsElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      padding: 10px;
      font-family: monospace;
      font-size: 14px;
      z-index: 10000;
      border-radius: 5px;
      pointer-events: none;
    `;
    document.body.appendChild(this.fpsElement);
  }

  public begin(): void {
    if (!this.enabled) return;
    this.frameCount++;
  }

  public end(): void {
    if (!this.enabled) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.updateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.msPerFrame = deltaTime / this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.fpsElement) {
        this.fpsElement.innerHTML = `
          FPS: ${this.fps}<br>
          MS: ${this.msPerFrame.toFixed(2)}<br>
          Memory: ${this.getMemoryInfo()}
        `;
      }
    }
  }

  private getMemoryInfo(): string {
    // Chrome-specific memory info
    const memory = (performance as any).memory;
    if (memory) {
      const used = (memory.usedJSHeapSize / 1048576).toFixed(2);
      const total = (memory.totalJSHeapSize / 1048576).toFixed(2);
      return `${used}/${total} MB`;
    }
    return 'N/A';
  }

  public destroy(): void {
    if (this.fpsElement && this.fpsElement.parentNode) {
      this.fpsElement.parentNode.removeChild(this.fpsElement);
    }
  }
}