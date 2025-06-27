import React from 'react';

interface GameOverScreenProps {
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, onMainMenu }) => {
  // This will be connected to game state later
  const score = 0;
  const zombiesKilled = 0;
  const wavesCompleted = 0;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '40px', color: '#f44336' }}>GAME OVER</h1>
      
      <div style={{ fontSize: '24px', marginBottom: '40px', textAlign: 'center' }}>
        <div>Final Score: {score}</div>
        <div>Zombies Killed: {zombiesKilled}</div>
        <div>Waves Completed: {wavesCompleted}</div>
      </div>
      
      <button
        onClick={onRestart}
        style={{
          padding: '15px 40px',
          fontSize: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Try Again
      </button>
      
      <button
        onClick={onMainMenu}
        style={{
          padding: '15px 40px',
          fontSize: '20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Main Menu
      </button>
    </div>
  );
};