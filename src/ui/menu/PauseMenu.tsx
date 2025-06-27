import React from 'react';

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onQuit }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ color: 'white', fontSize: '36px', marginBottom: '40px' }}>PAUSED</h2>
      
      <button
        onClick={onResume}
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
        Resume
      </button>
      
      <button
        onClick={onQuit}
        style={{
          padding: '15px 40px',
          fontSize: '20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Quit to Main Menu
      </button>
    </div>
  );
};