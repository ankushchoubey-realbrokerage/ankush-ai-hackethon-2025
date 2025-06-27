import React from 'react';

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '40px' }}>Zombie Apocalypse</h1>
      <h2 style={{ fontSize: '24px', marginBottom: '60px' }}>Isometric Survival</h2>
      
      <button
        onClick={onStartGame}
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
        Start Game
      </button>
      
      <button
        style={{
          padding: '15px 40px',
          fontSize: '20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Settings
      </button>
      
      <button
        style={{
          padding: '15px 40px',
          fontSize: '20px',
          backgroundColor: '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        High Scores
      </button>
    </div>
  );
};