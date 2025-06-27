Fix these breaking issues:

src/core/audio/AudioManager.ts(371,9): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[23:01:36.959] src/core/audio/AudioManager.ts(500,11): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[23:01:36.959] src/core/audio/AudioManager.ts(516,11): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[23:01:36.959] src/core/audio/AudioManager.ts(531,9): error TS2353: Object literal may only specify known properties, and 'refDistance' does not exist in type 'SoundConfig'.
[23:01:36.960] src/levels/environments/EnvironmentalHazardManager.ts(87,9): error TS2322: Type 'DamageZone' is not assignable to type 'IHazard'.
[23:01:36.960]   Types of property 'initialize' are incompatible.
[23:01:36.960]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[23:01:36.960]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[23:01:36.960] src/levels/environments/EnvironmentalHazardManager.ts(98,9): error TS2322: Type 'InstantDeathZone' is not assignable to type 'IHazard'.
[23:01:36.964]   Types of property 'initialize' are incompatible.
[23:01:36.964]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[23:01:36.964]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[23:01:36.965] src/levels/environments/EnvironmentalHazardManager.ts(110,9): error TS2322: Type 'SlowingZone' is not assignable to type 'IHazard'.
[23:01:36.965]   Types of property 'initialize' are incompatible.
[23:01:36.966]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[23:01:36.966]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[23:01:36.966] src/levels/environments/EnvironmentalHazardManager.ts(123,11): error TS2322: Type 'PushZone' is not assignable to type 'IHazard'.
[23:01:36.966]   Types of property 'initialize' are incompatible.
[23:01:36.966]     Type '(scene: Scene) => void' is not assignable to type '() => void'.
[23:01:36.966]       Target signature provides too few arguments. Expected 1 or more, but got 0.
[23:01:36.966] src/levels/environments/HazardWarningSystem.ts(73,36): error TS2345: Argument of type 'LineSegments<EdgesGeometry<BoxGeometry>, LineBasicMaterial, Object3DEventMap>' is not assignable to parameter of type 'Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>'.
[23:01:36.967]   Type 'LineSegments<EdgesGeometry<BoxGeometry>, LineBasicMaterial, Object3DEventMap>' is missing the following properties from type 'Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>': isMesh, count, getVertexPosition
[23:01:36.967] src/levels/maps/CityStreetsMap.ts(14,3): error TS2353: Object literal may only specify known properties, and 'boundaries' does not exist in type 'Partial<LevelData>'.
[23:01:36.967] src/store/gameStore.ts(65,9): error TS2741: Property 'time' is missing in type '{ score: number; zombiesKilled: number; waveNumber: number; level: number; }' but required in type 'GameStats'.
[23:01:36.967] src/store/gameStore.ts(136,28): error TS2345: Argument of type '{ gameState: GameState; previousState: GameState | null; gameStats: { score: number; zombiesKilled: number; waveNumber: number; level: number; }; playerHealth: number; playerMaxHealth: number; }' is not assignable to parameter of type 'GameStore | Partial<GameStore> | ((state: GameStore) => GameStore | Partial<GameStore>)'.
[23:01:36.968]   Type '{ gameState: GameState; previousState: GameState | null; gameStats: { score: number; zombiesKilled: number; waveNumber: number; level: number; }; playerHealth: number; playerMaxHealth: number; }' is not assignable to type 'Partial<GameStore>'.
[23:01:36.968]     Types of property 'gameStats' are incompatible.
[23:01:36.970]       Property 'time' is missing in type '{ score: number; zombiesKilled: number; waveNumber: number; level: number; }' but required in type 'GameStats'.
[23:01:37.260] Error: Command "npm run build" exited with 2
[23:01:37.442] 
[23:01:40.688] Exiting build container