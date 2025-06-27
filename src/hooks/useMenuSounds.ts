import { useCallback, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

// Simple sound generation using Web Audio API
class MenuSoundGenerator {
  private audioContext: AudioContext;
  
  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  // Dark, ominous hover sound
  playHoverSound(volume: number = 1): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Low frequency for dark atmosphere
    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1 * volume, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
  
  // Heavy, impactful click sound
  playClickSound(volume: number = 1): void {
    // Create multiple oscillators for richness
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Connect audio nodes
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Configure filter for darker tone
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(10, this.audioContext.currentTime);
    
    // Base frequency (low thud)
    oscillator1.frequency.setValueAtTime(40, this.audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.15);
    
    // Harmonic for texture
    oscillator2.frequency.setValueAtTime(60, this.audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.15);
    
    // Envelope
    gainNode.gain.setValueAtTime(0.3 * volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    
    oscillator1.start(this.audioContext.currentTime);
    oscillator2.start(this.audioContext.currentTime);
    oscillator1.stop(this.audioContext.currentTime + 0.15);
    oscillator2.stop(this.audioContext.currentTime + 0.15);
    
    // Add a subtle click transient
    const clickOsc = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();
    
    clickOsc.connect(clickGain);
    clickGain.connect(this.audioContext.destination);
    
    // White noise simulation with high frequency
    clickOsc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    clickGain.gain.setValueAtTime(0.05 * volume, this.audioContext.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.005);
    
    clickOsc.start(this.audioContext.currentTime);
    clickOsc.stop(this.audioContext.currentTime + 0.005);
  }
  
  // Special sound for dangerous actions (quit, etc)
  playDangerSound(volume: number = 1): void {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Bandpass filter for growl effect
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
    filter.Q.setValueAtTime(20, this.audioContext.currentTime);
    
    // Descending tone
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.15 * volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }
}

export const useMenuSounds = () => {
  const { getEffectiveVolume } = useSettings();
  const soundGeneratorRef = useRef<MenuSoundGenerator | null>(null);
  
  // Initialize sound generator on first use
  if (!soundGeneratorRef.current) {
    soundGeneratorRef.current = new MenuSoundGenerator();
  }
  
  const playHover = useCallback(() => {
    const volume = getEffectiveVolume('sfx');
    soundGeneratorRef.current?.playHoverSound(volume);
  }, [getEffectiveVolume]);
  
  const playClick = useCallback(() => {
    const volume = getEffectiveVolume('sfx');
    soundGeneratorRef.current?.playClickSound(volume);
  }, [getEffectiveVolume]);
  
  const playDanger = useCallback(() => {
    const volume = getEffectiveVolume('sfx');
    soundGeneratorRef.current?.playDangerSound(volume);
  }, [getEffectiveVolume]);
  
  return {
    playHover,
    playClick,
    playDanger
  };
};