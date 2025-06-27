import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const StateDebugPanel: React.FC = () => {
  const { 
    gameState, 
    previousState, 
    gameStats, 
    playerHealth,
    playerMaxHealth,
    startGame,
    pauseGame,
    resumeGame,
    gameOver,
    returnToMenu
  } = useGameStore();

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      left: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '5px',
      zIndex: 1000
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Game State Debug</h4>
      <div>Current State: <strong>{gameState}</strong></div>
      <div>Previous State: {previousState || 'none'}</div>
      <div>Score: {gameStats.score}</div>
      <div>Zombies Killed: {gameStats.zombiesKilled}</div>
      <div>Wave: {gameStats.waveNumber}</div>
      <div>Level: {gameStats.level}</div>
      <div>Health: {playerHealth}/{playerMaxHealth}</div>
      
      <div style={{ marginTop: '10px' }}>
        <button onClick={startGame} disabled={gameState === 'playing'}>Start</button>
        <button onClick={pauseGame} disabled={gameState !== 'playing'}>Pause</button>
        <button onClick={resumeGame} disabled={gameState !== 'paused'}>Resume</button>
        <button onClick={gameOver} disabled={gameState === 'gameOver'}>Game Over</button>
        <button onClick={returnToMenu}>Menu</button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        Press ESC to toggle pause
      </div>
    </div>
  );
};