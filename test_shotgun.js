// Test script for Shotgun weapon implementation
// Run these commands in the browser console to test the shotgun

// Test 1: Give player a shotgun
console.log("=== Test 1: Give Player Shotgun ===");
console.log("Run: window.debugGiveShotgun = true");
console.log("This will add a shotgun to the player's inventory and auto-switch to it");

// Test 2: Spawn zombies to test spread damage
console.log("\n=== Test 2: Spawn Test Zombies ===");
console.log("Run: window.debugSpawnTestZombies = true");
console.log("Then reload the page to spawn test zombies");

// Test 3: Load City Streets level with waves
console.log("\n=== Test 3: City Streets with Shotgun ===");
console.log("1. Run: window.debugLoadLevel = 2");
console.log("2. Wait for level to load");
console.log("3. Run: window.debugGiveShotgun = true");
console.log("4. Test shotgun against zombie waves");

// Expected behavior:
// - Shotgun fires 5 pellets per shot
// - Each pellet does 20 damage (100 total if all hit)
// - Pellets spread in a cone pattern:
//   - 1 center pellet (straight)
//   - 4 outer pellets (spread pattern)
// - Fire rate: ~1.2 seconds between shots (pump-action)
// - 8 shells capacity
// - Effective at close range, less effective at distance
// - Should kill normal zombies (100 HP) in 1 shot if all pellets hit
// - Should damage fast zombies (75 HP) significantly

console.log("\n=== Visual/Audio ===");
console.log("- Wider muzzle flash than pistol");
console.log("- Louder shotgun sound effect");
console.log("- Multiple projectiles visible");

console.log("\n=== Weapon Switching ===");
console.log("Press 1: Switch to Pistol");
console.log("Press 2: Switch to Shotgun (if acquired)");