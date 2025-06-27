import { create } from 'zustand';
import { GameState, GameStats } from '../types';

interface GameStore {
  gameState: GameState;
  gameStats: GameStats;
  setGameState: (state: GameState) => void;
  updateGameStats: (stats: Partial<GameStats>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: 'menu',
  gameStats: {
    score: 0,
    zombiesKilled: 0,
    waveNumber: 1,
    level: 1
  },
  setGameState: (state) => set({ gameState: state }),
  updateGameStats: (stats) => set((state) => ({
    gameStats: { ...state.gameStats, ...stats }
  }))
}));