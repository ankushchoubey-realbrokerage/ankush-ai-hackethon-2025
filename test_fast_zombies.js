// Test script for Fast Zombie implementation
// Run these commands in the browser console to test mixed zombie spawning

// Test 1: Spawn mixed zombie types manually
console.log("=== Test 1: Manual Mixed Zombie Spawning ===");
window.debugSpawnTestZombies = true;
console.log("Reload the page to see 3 normal and 2 fast zombies spawn");

// Test 2: Load City Streets level and start waves
console.log("\n=== Test 2: City Streets Level with Waves ===");
console.log("Run: window.debugLoadLevel = 2");
console.log("This will load City Streets and auto-start Wave 1 after 2 seconds");

// Test 3: Manually trigger next wave
console.log("\n=== Test 3: Manual Wave Trigger ===");
console.log("Run: window.debugStartWave = true");
console.log("This will start the next wave in the current level");

// Expected behavior:
// - Fast zombies (red-tinted) move 1.5x faster than normal zombies (green)
// - Fast zombies have 75 HP vs 100 HP for normal zombies
// - Fast zombies are 0.9x scale and have particle trail effects
// - City Streets level spawns correct percentages of fast zombies per wave:
//   - Wave 1: 0% fast (5 zombies total)
//   - Wave 2: 29% fast (7 zombies total, ~2 fast)
//   - Wave 3: 37% fast (8 zombies total, ~3 fast)

console.log("\n=== Visual Identification ===");
console.log("Normal Zombies: Green color, standard size");
console.log("Fast Zombies: Red color, smaller (0.9x), particle trails when moving");