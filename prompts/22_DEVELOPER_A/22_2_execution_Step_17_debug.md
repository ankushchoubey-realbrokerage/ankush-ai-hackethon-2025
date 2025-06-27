
whe player it damanged the HUD keeps displaying 100%. 
  also each touch should yeild in 10 damage

***

for some it keeps getting reset
 
 here are logs
 
HUD render - Health: 90/100
InputManager.ts:19 InputManager initialized
Player.ts:57 Creating new Player instance: 1751037570759
Player.ts:428 Player 1751037570759 getHealth() called: 100
GameEngine.ts:124 Game initialized - Player health: 100/100
LevelManager.ts:15 Loaded level 1: Simple Map
Player.ts:428 Player 1751037570759 getHealth() called: 100
HUD.tsx:11 HUD render - Health: 100/100
104Player.ts:428 Player 1751037570759 getHealth() called: 100
Player.ts:303 Player invulnerability ended
628Player.ts:428 Player 1751037570759 getHealth() called: 100
Player.ts:428 Player 1751037570759 getHealth() called: 100
GameEngine.ts:518 Before damage - Player health: 100
Player.ts:293 Player 1751037570759 took 10 damage. Health: 100 -> 90
Player.ts:428 Player 1751037570759 getHealth() called: 90
GameEngine.ts:523 Zombie zombie-1751037570765-0.9439964891417794 attacked player for 10 damage! Player health now: 90
Player.ts:428 Player 1751037570759 getHealth() called: 90
GameEngine.ts:264 Health update: Player=90, Store=100 -> updating store
gameStore.ts:132 Store setPlayerHealth: 90 (clamped to 90), max: 100
InputManager.ts:19 InputManager initialized
Player.ts:57 Creating new Player instance: 1751037576939
Player.ts:428 Player 1751037576939 getHealth() called: 100
GameEngine.ts:124 Game initialized - Player health: 100/100
LevelManager.ts:15 Loaded level 1: Simple Map
Player.ts:428 Player 1751037576939 getHealth() called: 100
GameEngine.ts:264 Health update: Player=100, Store=90 -> updating store
gameStore.ts:132 Store setPlayerHealth: 100 (clamped to 100), max: 100
HUD.tsx:11 HUD render - Health: 90/100
InputManager.ts:19 InputManager initialized
Player.ts:57 Creating new Player instance: 1751037577001
Player.ts:428 Player 1751037577001 getHealth() called: 100
GameEngine.ts:124 Game initialized - Player health: 100/100
LevelManager.ts:15 Loaded level 1: Simple Map
Player.ts:428 Player 1751037577001 getHealth() called: 100
HUD.tsx:11 HUD render - Health: 100/100
84Player.ts:428 Player 1751037577001 getHealth() called: 100
Player.ts:303 Player invulnerability ended
629Player.ts:428 Player 1751037577001 getHealth() called: 100