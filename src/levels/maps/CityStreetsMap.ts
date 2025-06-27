import { LevelData } from '../../types/level.types';
import { Vector3 } from '../../types/game.types';

/**
 * City Streets Level Configuration
 * Urban environment with abandoned cars, street debris, and strategic choke points
 */
export const CityStreetsConfig: Partial<LevelData> = {
  // Environmental atmosphere
  fogDensity: 0.02,
  ambientSound: 'city-ambience',
  
  // Street grid layout with building boundaries
  boundaries: [
    // North buildings
    { position: { x: 0, y: 5, z: 30 }, scale: { x: 60, y: 10, z: 1 } },
    // South buildings  
    { position: { x: 0, y: 5, z: -30 }, scale: { x: 60, y: 10, z: 1 } },
    // East buildings
    { position: { x: 30, y: 5, z: 0 }, scale: { x: 1, y: 10, z: 60 } },
    // West buildings
    { position: { x: -30, y: 5, z: 0 }, scale: { x: 1, y: 10, z: 60 } }
  ],
  
  // Street layout details
  streetGrid: {
    mainStreets: [
      { start: { x: -30, y: 0, z: 0 }, end: { x: 30, y: 0, z: 0 }, width: 8 },
      { start: { x: 0, y: 0, z: -30 }, end: { x: 0, y: 0, z: 30 }, width: 8 }
    ],
    intersections: [
      { x: 0, y: 0, z: 0 },     // Center intersection
      { x: 20, y: 0, z: 20 },   // NE intersection
      { x: -20, y: 0, z: 20 },  // NW intersection
      { x: 20, y: 0, z: -20 },  // SE intersection
      { x: -20, y: 0, z: -20 }  // SW intersection
    ]
  },
  
  // Additional atmospheric elements
  streetLights: [
    { position: { x: 10, y: 0, z: 10 }, height: 4, lightColor: 0xffaa44 },
    { position: { x: -10, y: 0, z: 10 }, height: 4, lightColor: 0xffaa44 },
    { position: { x: 10, y: 0, z: -10 }, height: 4, lightColor: 0xffaa44 },
    { position: { x: -10, y: 0, z: -10 }, height: 4, lightColor: 0xffaa44 }
  ],
  
  // Destructible car positions (optional enhancement)
  destructibleCars: ['car1', 'car3', 'car5'],
  
  // Strategic notes for gameplay
  gameplayNotes: {
    chokePoints: [
      { position: { x: 0, y: 0, z: 12 }, description: 'North street narrowing' },
      { position: { x: 15, y: 0, z: 0 }, description: 'East street blockage' }
    ],
    coverPositions: [
      { position: { x: 8, y: 0, z: 5 }, description: 'Behind car1' },
      { position: { x: -6, y: 0, z: -8 }, description: 'Behind car2' }
    ]
  }
};

// Export spawn point strategy for street intersections
export const getStreetIntersectionSpawnPoints = (): Vector3[] => {
  return [
    { x: 20, y: 0, z: 20 },   // NE intersection
    { x: -20, y: 0, z: 20 },  // NW intersection  
    { x: 20, y: 0, z: -20 },  // SE intersection
    { x: -20, y: 0, z: -20 }, // SW intersection
    { x: 0, y: 0, z: 25 },    // North street end
    { x: 0, y: 0, z: -25 }    // South street end
  ];
};

// Wave spawn strategy for city streets
export const cityWaveStrategy = {
  wave1: {
    description: 'Initial scout wave - zombies emerge from north and south',
    spawnPattern: 'linear',
    preferredSpawnIndices: [4, 5] // North and south street ends
  },
  wave2: {
    description: 'Flanking wave - zombies from all corners',
    spawnPattern: 'surround',
    preferredSpawnIndices: [0, 1, 2, 3] // Corner intersections
  },
  wave3: {
    description: 'Final assault - overwhelming from all directions',
    spawnPattern: 'random',
    preferredSpawnIndices: [0, 1, 2, 3, 4, 5] // All spawn points
  }
};