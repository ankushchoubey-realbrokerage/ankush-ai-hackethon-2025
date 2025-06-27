export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private masterVolume: number = 1.0;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  public async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  public playSound(name: string, volume: number = 1.0): void {
    if (!this.audioContext) return;
    
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * this.masterVolume;
    
    source.start();
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}