import React, { useEffect, useRef, useState } from 'react';
import { GameState } from '../types';
import { MainMenu } from '../ui/menu/MainMenu';
import { GameCanvas } from './GameCanvas';
import { HUD } from '../ui/hud/HUD';
import { PauseMenu } from '../ui/menu/PauseMenu';
import { GameOverScreen } from '../ui/menu/GameOverScreen';

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState === 'playing') {
        setIsPaused(prev => !prev);
        setGameState(isPaused ? 'playing' : 'paused');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, isPaused]);

  const handleStartGame = () => {
    setGameState('playing');
    setIsPaused(false);
  };

  const handleResumeGame = () => {
    setGameState('playing');
    setIsPaused(false);
  };

  const handleGameOver = () => {
    setGameState('game-over');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setIsPaused(false);
  };

  return (
    <div className="game-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {gameState === 'menu' && (
        <MainMenu onStartGame={handleStartGame} />
      )}
      
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <GameCanvas 
            isPaused={isPaused} 
            onGameOver={handleGameOver}
          />
          <HUD />
          {gameState === 'paused' && (
            <PauseMenu 
              onResume={handleResumeGame}
              onQuit={handleBackToMenu}
            />
          )}
        </>
      )}
      
      {gameState === 'game-over' && (
        <GameOverScreen 
          onRestart={handleStartGame}
          onMainMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};