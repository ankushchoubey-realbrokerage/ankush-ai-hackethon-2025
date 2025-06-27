import { useEffect, useRef } from 'react';
import { AudioManager } from '../core/audio/AudioManager';
import { useSettings } from '../contexts/SettingsContext';

export const useAudioWithSettings = () => {
  const audioManagerRef = useRef<AudioManager | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = new AudioManager();
    }

    // Update master volume whenever settings change
    audioManagerRef.current.setMasterVolume(settings.masterVolume);
  }, [settings.masterVolume]);

  const playSound = (soundName: string, type: 'music' | 'sfx' = 'sfx') => {
    if (!audioManagerRef.current) return;
    
    const volumeMultiplier = type === 'music' ? settings.musicVolume : settings.sfxVolume;
    audioManagerRef.current.playSound(soundName, volumeMultiplier);
  };

  const cleanup = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.destroy();
      audioManagerRef.current = null;
    }
  };

  return {
    audioManager: audioManagerRef.current,
    playSound,
    cleanup
  };
};