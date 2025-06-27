import React, { useState, useEffect } from 'react';
import './MainMenu.css';
import { SettingsMenu } from './SettingsMenu';

interface MainMenuProps {
  onStartGame: () => void;
}

type MenuScreen = 'main' | 'settings' | 'scores';

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [selectedButton, setSelectedButton] = useState(0);

  const handleBack = () => {
    setCurrentScreen('main');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== 'main') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedButton(prev => (prev - 1 + 3) % 3);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedButton(prev => (prev + 1) % 3);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedButton === 0) onStartGame();
          else if (selectedButton === 1) setCurrentScreen('settings');
          else if (selectedButton === 2) setCurrentScreen('scores');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, selectedButton, onStartGame]);

  if (currentScreen === 'settings') {
    return <SettingsMenu onBack={handleBack} />;
  }

  if (currentScreen === 'scores') {
    return (
      <div className="mainMenu">
        <h1 className="title">High Scores</h1>
        <div style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '2rem' 
        }}>
          <p style={{ color: '#999', fontSize: '1.2rem' }}>
            No scores yet. Be the first survivor!
          </p>
        </div>
        <button 
          className="menuButton settingsButton"
          onClick={handleBack}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="mainMenu">
      <h1 className="title">Zombie Apocalypse</h1>
      <h2 className="subtitle">Isometric Survival</h2>
      
      <div className="buttonContainer">
        <button
          onClick={onStartGame}
          className={`menuButton startButton ${selectedButton === 0 ? 'selected' : ''}`}
          onMouseEnter={() => setSelectedButton(0)}
        >
          Start Game
        </button>
        
        <button
          onClick={() => setCurrentScreen('settings')}
          className={`menuButton settingsButton ${selectedButton === 1 ? 'selected' : ''}`}
          onMouseEnter={() => setSelectedButton(1)}
        >
          Settings
        </button>
        
        <button
          onClick={() => setCurrentScreen('scores')}
          className={`menuButton scoresButton ${selectedButton === 2 ? 'selected' : ''}`}
          onMouseEnter={() => setSelectedButton(2)}
        >
          High Scores
        </button>
      </div>
    </div>
  );
};