import React from 'react';
import { useGameStore, useGameState } from '../store/gameStore';
import { MainMenu } from '../ui/menu/MainMenu';
import { GameCanvas } from './GameCanvas';
import { HUD } from '../ui/hud/HUD';
import { PauseMenu } from '../ui/menu/PauseMenu';
import { GameOverScreen } from '../ui/menu/GameOverScreen';
import { StateDebugPanel } from '../ui/debug/StateDebugPanel';

export const Game: React.FC = () => {
  const gameState = useGameState();
  const { startGame, resumeGame, returnToMenu } = useGameStore();

  const handleStartGame = () => {
    startGame();
  };

  const handleResumeGame = () => {
    resumeGame();
  };

  const handleGameOver = () => {
    // GameEngine handles this internally
  };

  const handleBackToMenu = () => {
    returnToMenu();
  };

  return (
    <div className="game-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {gameState === 'menu' && (
        <MainMenu onStartGame={handleStartGame} />
      )}
      
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <GameCanvas 
            isPaused={gameState === 'paused'} 
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
      
      {gameState === 'gameOver' && (
        <GameOverScreen 
          onRestart={handleStartGame}
          onMainMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};