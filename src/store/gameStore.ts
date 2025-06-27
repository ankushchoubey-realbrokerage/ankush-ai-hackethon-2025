import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GameState, GameStats } from '../types';

interface GameStore {
  // Game state
  gameState: GameState;
  previousState: GameState | null;
  
  // Game stats
  gameStats: GameStats;
  
  // Player stats
  playerHealth: number;
  playerMaxHealth: number;
  
  // State transition actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  returnToMenu: () => void;
  
  // Stat update actions
  updateGameStats: (stats: Partial<GameStats>) => void;
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  incrementZombiesKilled: () => void;
  setWaveNumber: (wave: number) => void;
  setLevel: (level: number) => void;
  setPlayerHealth: (health: number, maxHealth?: number) => void;
  
  // Reset
  resetGame: () => void;
}

const initialState = {
  gameState: 'menu' as GameState,
  previousState: null as GameState | null,
  gameStats: {
    score: 0,
    zombiesKilled: 0,
    waveNumber: 1,
    level: 1
  },
  playerHealth: 100,
  playerMaxHealth: 100,
};

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // State transition actions
      setGameState: (state) => set((prev) => ({ 
        gameState: state,
        previousState: prev.gameState 
      })),
      
      startGame: () => set({ 
        gameState: 'playing',
        previousState: 'menu',
        gameStats: {
          score: 0,
          zombiesKilled: 0,
          waveNumber: 1,
          level: 1
        },
        playerHealth: 100,
        playerMaxHealth: 100
      }),
      
      pauseGame: () => {
        const currentState = get().gameState;
        if (currentState === 'playing') {
          set({ 
            gameState: 'paused',
            previousState: currentState 
          });
        }
      },
      
      resumeGame: () => {
        const currentState = get().gameState;
        if (currentState === 'paused') {
          set({ 
            gameState: 'playing',
            previousState: currentState 
          });
        }
      },
      
      gameOver: () => set({ 
        gameState: 'gameOver',
        previousState: 'playing' 
      }),
      
      returnToMenu: () => set({ 
        gameState: 'menu',
        previousState: get().gameState 
      }),
      
      // Stat update actions
      updateGameStats: (stats) => set((state) => ({
        gameStats: { ...state.gameStats, ...stats }
      })),
      
      setScore: (score) => set((state) => ({
        gameStats: { ...state.gameStats, score }
      })),
      
      addScore: (points) => set((state) => ({
        gameStats: { ...state.gameStats, score: state.gameStats.score + points }
      })),
      
      incrementZombiesKilled: () => set((state) => ({
        gameStats: { ...state.gameStats, zombiesKilled: state.gameStats.zombiesKilled + 1 }
      })),
      
      setWaveNumber: (wave) => set((state) => ({
        gameStats: { ...state.gameStats, waveNumber: wave }
      })),
      
      setLevel: (level) => set((state) => ({
        gameStats: { ...state.gameStats, level }
      })),
      
      setPlayerHealth: (health, maxHealth) => set((state) => {
        const newHealth = Math.max(0, Math.min(health, maxHealth || state.playerMaxHealth));
        console.log(`Store setPlayerHealth: ${health} (clamped to ${newHealth}), max: ${maxHealth || state.playerMaxHealth}`);
        return { 
          playerHealth: newHealth,
          playerMaxHealth: maxHealth || state.playerMaxHealth 
        };
      }),
      
      // Reset
      resetGame: () => set(initialState),
    }),
    {
      name: 'game-store',
    }
  )
);

// Selector hooks for common patterns
export const useGameState = () => useGameStore((state) => state.gameState);
export const useIsPlaying = () => useGameStore((state) => state.gameState === 'playing');
export const useIsPaused = () => useGameStore((state) => state.gameState === 'paused');
export const useIsGameOver = () => useGameStore((state) => state.gameState === 'gameOver');
export const useIsInMenu = () => useGameStore((state) => state.gameState === 'menu');