import { Howl, Howler, HowlOptions } from 'howler';

// STEP 26: Audio Manager Setup

interface SoundConfig extends Partial<HowlOptions> {
  src: string[];
  pool?: number;
}

interface PlayingSoundInfo {
  id: number;
  soundName: string;
  startTime: number;
}

export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private playingSounds: Map<number, PlayingSoundInfo> = new Map();
  private soundPools: Map<string, number[]> = new Map();
  private masterVolume: number = 1.0;
  
  // Sound categories for organization
  private soundCategories = {
    weapon: new Set<string>(),
    zombie: new Set<string>(),
    ui: new Set<string>(),
    ambient: new Set<string>(),
    music: new Set<string>()
  };

  constructor() {
    // Initialize Howler global settings
    Howler.volume(this.masterVolume);
    
    // Enable audio context on first user interaction (for mobile)
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => {
        if (Howler.ctx && Howler.ctx.state === 'suspended') {
          Howler.ctx.resume();
        }
      }, { once: true });
    }
  }

  /**
   * Load a sound with configuration options
   */
  public loadSound(name: string, config: SoundConfig, category?: keyof typeof this.soundCategories): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set default configuration
      const soundConfig: SoundConfig = {
        preload: true,
        html5: false, // Use Web Audio API for better performance
        ...config,
        onload: () => {
          console.log(`Sound loaded: ${name}`);
          
          // Add to category if specified
          if (category && this.soundCategories[category]) {
            this.soundCategories[category].add(name);
          }
          
          // Initialize sound pool if specified
          if (config.pool && config.pool > 1) {
            this.soundPools.set(name, []);
          }
          
          resolve();
        },
        onloaderror: (_id: number, error: any) => {
          console.error(`Failed to load sound ${name}:`, error);
          reject(error);
        }
      };

      const sound = new Howl(soundConfig);
      this.sounds.set(name, sound);
    });
  }

  /**
   * Play a sound with optional volume and return the sound ID
   */
  public playSound(name: string, volume?: number): number | undefined {
    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound not found: ${name}`);
      return undefined;
    }

    // Set volume for this play instance
    const playVolume = volume !== undefined ? volume : 1.0;
    
    // Check if we need to use sound pooling
    const pool = this.soundPools.get(name);
    let id: number;
    
    if (pool !== undefined) {
      // Reuse an inactive sound from the pool or create a new one
      const inactiveId = pool.find(soundId => !sound.playing(soundId));
      
      if (inactiveId !== undefined) {
        sound.play(inactiveId);
        sound.volume(playVolume * this.masterVolume, inactiveId);
        id = inactiveId;
      } else {
        id = sound.play();
        sound.volume(playVolume * this.masterVolume, id);
        pool.push(id);
      }
    } else {
      id = sound.play();
      sound.volume(playVolume * this.masterVolume, id);
    }
    
    // Track playing sound
    this.playingSounds.set(id, {
      id,
      soundName: name,
      startTime: Date.now()
    });
    
    // Clean up when sound ends
    sound.once('end', () => {
      this.playingSounds.delete(id);
    }, id);
    
    return id;
  }

  /**
   * Stop a specific sound or all instances of a sound
   */
  public stopSound(name: string, id?: number): void {
    const sound = this.sounds.get(name);
    if (!sound) return;

    if (id !== undefined) {
      sound.stop(id);
      this.playingSounds.delete(id);
    } else {
      sound.stop();
      // Remove all instances from playing sounds
      this.playingSounds.forEach((info, soundId) => {
        if (info.soundName === name) {
          this.playingSounds.delete(soundId);
        }
      });
    }
  }

  /**
   * Pause a specific sound or all instances
   */
  public pauseSound(name: string, id?: number): void {
    const sound = this.sounds.get(name);
    if (!sound) return;
    
    sound.pause(id);
  }

  /**
   * Resume a specific sound or all instances
   */
  public resumeSound(name: string, id?: number): void {
    const sound = this.sounds.get(name);
    if (!sound) return;
    
    sound.play(id);
  }

  /**
   * Set the master volume (0.0 to 1.0)
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }

  /**
   * Get the current master volume
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set volume for a specific sound
   */
  public setSoundVolume(name: string, volume: number, id?: number): void {
    const sound = this.sounds.get(name);
    if (!sound) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (id !== undefined) {
      sound.volume(clampedVolume, id);
    } else {
      sound.volume(clampedVolume);
    }
  }

  /**
   * Fade a sound in or out
   */
  public fadeSound(name: string, from: number, to: number, duration: number, id?: number): void {
    const sound = this.sounds.get(name);
    if (!sound) return;
    
    sound.fade(from * this.masterVolume, to * this.masterVolume, duration, id);
  }

  /**
   * Set playback rate (pitch/speed)
   */
  public setPlaybackRate(name: string, rate: number, id?: number): void {
    const sound = this.sounds.get(name);
    if (!sound) return;
    
    sound.rate(rate, id);
  }

  /**
   * Check if a sound is currently playing
   */
  public isPlaying(name: string, id?: number): boolean {
    const sound = this.sounds.get(name);
    if (!sound) return false;
    
    return sound.playing(id);
  }

  /**
   * Get all sounds in a category
   */
  public getSoundsByCategory(category: keyof typeof this.soundCategories): string[] {
    return Array.from(this.soundCategories[category]);
  }

  /**
   * Stop all sounds in a category
   */
  public stopCategory(category: keyof typeof this.soundCategories): void {
    const sounds = this.soundCategories[category];
    sounds.forEach(soundName => this.stopSound(soundName));
  }

  /**
   * Mute/unmute all sounds
   */
  public mute(muted: boolean): void {
    Howler.mute(muted);
  }

  /**
   * Get information about currently playing sounds
   */
  public getPlayingSounds(): PlayingSoundInfo[] {
    return Array.from(this.playingSounds.values());
  }

  /**
   * Unload a specific sound to free memory
   */
  public unloadSound(name: string): void {
    const sound = this.sounds.get(name);
    if (!sound) return;
    
    sound.unload();
    this.sounds.delete(name);
    
    // Remove from categories
    Object.values(this.soundCategories).forEach(category => {
      category.delete(name);
    });
    
    // Remove from pools
    this.soundPools.delete(name);
  }

  /**
   * Clean up all sounds and resources
   */
  public destroy(): void {
    // Stop all sounds
    this.sounds.forEach(sound => sound.stop());
    
    // Unload all sounds
    this.sounds.forEach(sound => sound.unload());
    
    // Clear all collections
    this.sounds.clear();
    this.playingSounds.clear();
    this.soundPools.clear();
    Object.values(this.soundCategories).forEach(category => category.clear());
    
    // Reset Howler
    Howler.unload();
  }
}