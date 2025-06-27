import React, { useCallback, useState } from 'react';
import { useGameStore, useGameState } from '../store/gameStore';
import { MainMenu } from '../ui/menu/MainMenu';
import { GameCanvas } from './GameCanvas';
import { HUD } from '../ui/hud/HUD';
import { PauseMenu } from '../ui/menu/PauseMenu';
import { GameOverScreen } from '../ui/menu/GameOverScreen';
// import { StateDebugPanel } from '../ui/debug/StateDebugPanel';

export const Game: React.FC = () => {
  const gameState = useGameState();
  const { startGame, resumeGame, returnToMenu } = useGameStore();
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

  const handleStartGame = (levelId?: number) => {
    if (levelId !== undefined) {
      setSelectedLevelId(levelId);
    }
    startGame();
  };

  const handleResumeGame = () => {
    resumeGame();
  };

  const handleGameOver = useCallback(() => {
    // GameEngine handles this internally
  }, []);

  const handleBackToMenu = () => {
    returnToMenu();
  };

  return (
    <div className="gameContainer">
      {/* Uncomment to debug state */}
      {/* <StateDebugPanel /> */}
      
      {gameState === 'menu' && <MainMenu onStartGame={handleStartGame} />}
      
      {(gameState === 'playing' || gameState === 'paused') && (
        <>
          <GameCanvas 
            isPaused={gameState === 'paused'} 
            onGameOver={handleGameOver}
            levelId={selectedLevelId}
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
          onRestart={() => handleStartGame(selectedLevelId)}
          onMainMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};