// Test sound generator - creates a simple beep sound
// This script generates a WAV file that can be used for testing

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sampleRate = audioContext.sampleRate;
const duration = 0.2; // 200ms beep
const frequency = 440; // A4 note

// Create buffer
const frameCount = sampleRate * duration;
const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
const channelData = buffer.getChannelData(0);

// Generate sine wave
for (let i = 0; i < frameCount; i++) {
  channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
}

// Convert to WAV
function bufferToWave(buffer) {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // RIFF chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // chunk length
  setUint16(1); // PCM
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg bytes/sec
  setUint16(buffer.numberOfChannels * 2); // block align
  setUint16(16); // bits per sample

  // Data sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return arrayBuffer;
}

// Convert buffer to WAV and create blob
const wavData = bufferToWave(buffer);
const blob = new Blob([wavData], { type: 'audio/wav' });
const url = URL.createObjectURL(blob);

// Create download link
const a = document.createElement('a');
a.href = url;
a.download = 'test-beep.wav';
a.textContent = 'Download test-beep.wav';
document.body.appendChild(a);