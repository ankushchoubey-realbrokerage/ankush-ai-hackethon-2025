// Simple audio utility functions for UI sounds
export const playSound = (soundName: string, volume: number = 0.5) => {
  // TODO: Implement actual sound playing logic
  // For now, just log the sound request
  console.log(`Playing sound: ${soundName} at volume: ${volume}`);
  
  // In a real implementation, this would:
  // 1. Load the sound file from assets
  // 2. Create an Audio element or use Web Audio API
  // 3. Play the sound at the specified volume
  
  // Example implementation:
  // const audio = new Audio(`/sounds/${soundName}.mp3`);
  // audio.volume = volume;
  // audio.play().catch(err => console.error('Failed to play sound:', err));
};