import React, { useState, useEffect } from 'react';
import './MainMenu.css';
import { SettingsMenu } from './SettingsMenu';
import { useMenuSounds } from '../../hooks/useMenuSounds';

interface MainMenuProps {
  onStartGame: () => void;
}

type MenuScreen = 'main' | 'settings' | 'scores';

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [selectedButton, setSelectedButton] = useState(0);
  const { playHover, playClick } = useMenuSounds();

  const handleBack = () => {
    setCurrentScreen('main');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== 'main') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          playHover();
          setSelectedButton(prev => (prev - 1 + 3) % 3);
          break;
        case 'ArrowDown':
          e.preventDefault();
          playHover();
          setSelectedButton(prev => (prev + 1) % 3);
          break;
        case 'Enter':
          e.preventDefault();
          playClick();
          if (selectedButton === 0) onStartGame();
          else if (selectedButton === 1) setCurrentScreen('settings');
          else if (selectedButton === 2) setCurrentScreen('scores');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, selectedButton, onStartGame, playHover, playClick]);

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
          onClick={() => {
            playClick();
            handleBack();
          }}
          onMouseEnter={playHover}
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
          onClick={() => {
            playClick();
            onStartGame();
          }}
          className={`menuButton startButton ${selectedButton === 0 ? 'selected' : ''}`}
          onMouseEnter={() => {
            if (selectedButton !== 0) playHover();
            setSelectedButton(0);
          }}
        >
          Start Game
        </button>
        
        <button
          onClick={() => {
            playClick();
            setCurrentScreen('settings');
          }}
          className={`menuButton settingsButton ${selectedButton === 1 ? 'selected' : ''}`}
          onMouseEnter={() => {
            if (selectedButton !== 1) playHover();
            setSelectedButton(1);
          }}
        >
          Settings
        </button>
        
        <button
          onClick={() => {
            playClick();
            setCurrentScreen('scores');
          }}
          className={`menuButton scoresButton ${selectedButton === 2 ? 'selected' : ''}`}
          onMouseEnter={() => {
            if (selectedButton !== 2) playHover();
            setSelectedButton(2);
          }}
        >
          High Scores
        </button>
      </div>
    </div>
  );
};