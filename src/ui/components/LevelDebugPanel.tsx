import React from 'react';
import { useGameStore } from '../../store/gameStore';

// STEP 31: Level System Architecture - Debug Panel for Testing
export const LevelDebugPanel: React.FC = () => {
  const gameEngine = (window as any).gameEngine;
  
  const handleLoadLevel = async (levelId: number) => {
    if (!gameEngine) {
      console.error('Game engine not initialized');
      return;
    }
    
    const success = await gameEngine.loadLevel(levelId);
    if (success) {
      console.log(`Successfully loaded level ${levelId}`);
    } else {
      console.error(`Failed to load level ${levelId}`);
    }
  };
  
  const handleTransitionNext = async () => {
    if (!gameEngine) {
      console.error('Game engine not initialized');
      return;
    }
    
    const success = await gameEngine.transitionToNextLevel();
    if (success) {
      console.log('Successfully transitioned to next level');
    } else {
      console.error('Failed to transition to next level');
    }
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Level Debug Panel</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Load Level:</strong>
        <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
          <button onClick={() => handleLoadLevel(1)} style={buttonStyle}>1</button>
          <button onClick={() => handleLoadLevel(2)} style={buttonStyle}>2</button>
          <button onClick={() => handleLoadLevel(3)} style={buttonStyle}>3</button>
          <button onClick={() => handleLoadLevel(4)} style={buttonStyle}>4</button>
          <button onClick={() => handleLoadLevel(5)} style={buttonStyle}>5</button>
        </div>
      </div>
      
      <div>
        <button 
          onClick={handleTransitionNext} 
          style={{ ...buttonStyle, width: '100%' }}
        >
          Transition to Next Level
        </button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Press keys 1-5 to load levels directly
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '5px 10px',
  background: '#444',
  color: 'white',
  border: '1px solid #666',
  borderRadius: '3px',
  cursor: 'pointer',
  fontSize: '12px'
};