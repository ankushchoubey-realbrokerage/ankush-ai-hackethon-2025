For some reason zombies are not visible

***

disable typescripts strict mode so that these build errors go away. 

[22:56:50.593] Running build in Washington, D.C., USA (East) – iad1
[22:56:50.594] Build machine configuration: 2 cores, 8 GB
[22:56:50.608] Cloning github.com/ankushchoubey-realbrokerage/ankush-ai-hackethon-2025 (Branch: main, Commit: 5005afc)
[22:56:51.104] Cloning completed: 496.000ms
[22:56:51.654] Restored build cache from previous deployment (AqymPGDknTPkRWfXCGWb4FEpRkCm)
[22:56:52.014] Running "vercel build"
[22:56:52.456] Vercel CLI 43.3.0
[22:56:53.149] Installing dependencies...
[22:56:54.255] 
[22:56:54.256] up to date in 834ms
[22:56:54.256] 
[22:56:54.256] 51 packages are looking for funding
[22:56:54.256]   run `npm fund` for details
[22:56:54.288] Running "npm run build"
[22:56:54.400] 
[22:56:54.400] > vite-react@0.0.0 build
[22:56:54.400] > tsc -b && vite build
[22:56:54.401] 
[22:56:58.444] src/core/audio/AudioManager.ts(371,9): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[22:56:58.451] src/core/audio/AudioManager.ts(500,11): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[22:56:58.452] src/core/audio/AudioManager.ts(516,11): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[22:56:58.453] src/core/audio/AudioManager.ts(531,9): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[22:56:58.453] src/core/engine/GameEngine.ts(411,11): error TS6133: 'loadLevelSimple' is declared but its value is never read.
[22:56:58.454] src/core/engine/GameEngine.ts(1114,29): error TS6133: 'deltaTime' is declared but its value is never read.
[22:56:58.457] src/core/physics/PhysicsEngine.ts(32,17): error TS6133: 'deltaTime' is declared but its value is never read.
[22:56:58.457] src/effects/Explosion.ts(2,36): error TS6133: 'Entity' is declared but its value is never read.
[22:56:58.457] src/effects/Explosion.ts(266,39): error TS6133: 'index' is declared but its value is never read.
[22:56:58.458] src/entities/enemies/ZombieManager.ts(12,11): error TS6133: 'particleSystem' is declared but its value is never read.
[22:56:58.458] src/entities/enemies/ZombieManager.ts(158,27): error TS6133: 'zombie' is declared but its value is never read.
[22:56:58.458] src/entities/player/Player.ts(10,11): error TS6133: 'instanceId' is declared but its value is never read.
[22:56:58.458] src/entities/player/Player.ts(47,11): error TS6133: 'boundaries' is declared but its value is never read.
[22:56:58.459] src/entities/player/Player.ts(510,19): error TS2345: Argument of type 'Group<Object3DEventMap> | null' is not assignable to parameter of type 'Object3D<Object3DEventMap>'.
[22:56:58.459]   Type 'null' is not assignable to type 'Object3D<Object3DEventMap>'.
[22:56:58.459] src/entities/player/Player.ts(513,30): error TS6133: 'mouseWorld' is declared but its value is never read.
[22:56:58.459] src/entities/projectiles/ProjectileManager.ts(12,11): error TS6133: 'particleSystem' is declared but its value is never read.
[22:56:58.459] src/entities/projectiles/Rocket.ts(2,10): error TS6133: 'Entity' is declared but its value is never read.
[22:56:58.459] src/entities/projectiles/Rocket.ts(2,27): error TS6133: 'BoundingBox' is declared but its value is never read.
[22:56:58.459] src/entities/projectiles/Rocket.ts(153,11): error TS6133: 'particle' is declared but its value is never read.
[22:56:58.459] src/levels/environments/EnvironmentalHazardManager.ts(35,11): error TS6133: 'camera' is declared but its value is never read.
[22:56:58.459] src/levels/environments/EnvironmentalHazardManager.ts(36,11): error TS6133: 'renderer' is declared but its value is never read.
[22:56:58.459] src/levels/environments/EnvironmentalHazardManager.ts(39,11): error TS6133: 'allEntities' is declared but its value is never read.
[22:56:58.460] src/levels/environments/EnvironmentalHazardManager.ts(87,9): error TS2322: Type 'DamageZone' is not assignable to type 'IHazard'.
[22:56:58.460]   Types of property 'initialize' are incompatible.
[22:56:58.460]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[22:56:58.460]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[22:56:58.460] src/levels/environments/EnvironmentalHazardManager.ts(98,9): error TS2322: Type 'InstantDeathZone' is not assignable to type 'IHazard'.
[22:56:58.460]   Types of property 'initialize' are incompatible.
[22:56:58.460]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[22:56:58.464]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[22:56:58.467] src/levels/environments/EnvironmentalHazardManager.ts(110,9): error TS2322: Type 'SlowingZone' is not assignable to type 'IHazard'.
[22:56:58.467]   Types of property 'initialize' are incompatible.
[22:56:58.467]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[22:56:58.467]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[22:56:58.468] src/levels/environments/EnvironmentalHazardManager.ts(123,11): error TS2322: Type 'PushZone' is not assignable to type 'IHazard'.
[22:56:58.468]   Types of property 'initialize' are incompatible.
[22:56:58.468]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[22:56:58.468]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[22:56:58.468] src/levels/environments/EnvironmentalHazardManager.ts(185,17): error TS6133: 'hazardId' is declared but its value is never read.
[22:56:58.468] src/levels/environments/EnvironmentalHazardManager.ts(192,17): error TS6133: 'hazardId' is declared but its value is never read.
[22:56:58.469] src/levels/environments/HazardEffectsSystem.ts(18,11): error TS6133: 'renderer' is declared but its value is never read.
[22:56:58.469] src/levels/environments/HazardEffectsSystem.ts(264,10): error TS6133: 'deltaTime' is declared but its value is never read.
[22:56:58.469] src/levels/environments/HazardWarningSystem.ts(73,36): error TS2345: Argument of type 'LineSegments<EdgesGeometry<BoxGeometry>, LineBasicMaterial, Object3DEventMap>' is not assignable to parameter of type 'Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>'.
[22:56:58.469]   Type 'LineSegments<EdgesGeometry<BoxGeometry>, LineBasicMaterial, Object3DEventMap>' is missing the following properties from type 'Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>': isMesh, count, getVertexPosition
[22:56:58.469] src/levels/environments/HazardZone.ts(51,10): error TS6133: 'deltaTime' is declared but its value is never read.
[22:56:58.470] src/levels/environments/HazardZone.ts(77,34): error TS6133: 'state' is declared but its value is never read.
[22:56:58.470] src/levels/environments/IHazard.ts(1,18): error TS6133: 'DamagableEntity' is declared but its value is never read.
[22:56:58.470] src/levels/environments/InstantDeathZone.ts(116,26): error TS6133: 'deltaTime' is declared but its value is never read.
[22:56:58.470] src/levels/environments/InstantDeathZone.ts(123,10): error TS6133: 'entity' is declared but its value is never read.
[22:56:58.470] src/levels/environments/PushZone.ts(16,11): error TS6133: 'lastActivationTime' is declared but its value is never read.
[22:56:58.471] src/levels/environments/SlowingZone.ts(145,26): error TS6133: 'deltaTime' is declared but its value is never read.
[22:56:58.471] src/levels/level-system/LevelLoader.ts(276,30): error TS6133: 'theme' is declared but its value is never read.
[22:56:58.471] src/levels/level-system/LevelManager.ts(13,11): error TS6133: 'remainingZombiesInWave' is declared but its value is never read.
[22:56:58.471] src/levels/maps/CityStreetsMap.ts(14,3): error TS2353: Object literal may only specify known properties, and 'boundaries' does not exist in type 'Partial<LevelData>'.
[22:56:58.471] src/levels/maps/VolcanoMap.ts(71,37): error TS6133: 'index' is declared but its value is never read.
[22:56:58.472] src/store/gameStore.ts(65,9): error TS2741: Property 'time' is missing in type '{ score: number; zombiesKilled: number; waveNumber: number; level: number; }' but required in type 'GameStats'.
[22:56:58.472] src/store/gameStore.ts(136,28): error TS2345: Argument of type '{ gameState: GameState; previousState: GameState | null; gameStats: { score: number; zombiesKilled: number; waveNumber: number; level: number; }; playerHealth: number; playerMaxHealth: number; }' is not assignable to parameter of type 'GameStore | Partial<GameStore> | ((state: GameStore) => GameStore | Partial<GameStore>)'.
[22:56:58.472]   Type '{ gameState: GameState; previousState: GameState | null; gameStats: { score: number; zombiesKilled: number; waveNumber: number; level: number; }; playerHealth: number; playerMaxHealth: number; }' is not assignable to type 'GameStore | Partial<GameStore>'.
[22:56:58.472]     Type '{ gameState: GameState; previousState: GameState | null; gameStats: { score: number; zombiesKilled: number; waveNumber: number; level: number; }; playerHealth: number; playerMaxHealth: number; }' is not assignable to type 'Partial<GameStore>'.
[22:56:58.472]       Types of property 'gameStats' are incompatible.
[22:56:58.473]         Property 'time' is missing in type '{ score: number; zombiesKilled: number; waveNumber: number; level: number; }' but required in type 'GameStats'.
[22:56:58.473] src/ui/components/LevelDebugPanel.tsx(2,1): error TS6133: 'useGameStore' is declared but its value is never read.
[22:56:58.473] src/ui/hud/InputDisplay.tsx(23,21): error TS6133: 'key' is declared but its value is never read.
[22:56:58.473] src/ui/menu/SettingsMenu.tsx(1,17): error TS6133: 'useEffect' is declared but its value is never read.
[22:56:58.473] src/utils/CollisionDebugger.ts(2,18): error TS6133: 'BoundingBox' is declared but its value is never read.
[22:56:58.474] src/weapons/Shotgun.ts(41,10): error TS2341: Property 'lastFireTime' is private and only accessible within class 'BaseWeapon'.
[22:56:58.753] Error: Command "npm run build" exited with 2
[22:56:58.943] 
[22:57:02.449] Exiting build container