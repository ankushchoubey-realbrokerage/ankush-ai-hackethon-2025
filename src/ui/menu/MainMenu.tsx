import React, { useState, useEffect } from 'react';
import './MainMenu.css';
import { SettingsMenu } from './SettingsMenu';
import { useMenuSounds } from '../../hooks/useMenuSounds';
import { levelConfigs } from '../../levels/maps/levelConfigs';

interface MainMenuProps {
  onStartGame: (levelId?: number) => void;
}

type MenuScreen = 'main' | 'settings' | 'scores' | 'levelSelect';

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [currentScreen, setCurrentScreen] = useState<MenuScreen>('main');
  const [selectedButton, setSelectedButton] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const { playHover, playClick } = useMenuSounds();

  // Get available levels
  const levels = Array.from(levelConfigs.entries()).map(([id, config]) => ({
    id,
    name: config.name,
    theme: config.theme,
    description: getThemeDescription(config.theme)
  }));

  function getThemeDescription(theme: string): string {
    switch (theme) {
      case 'simple-map':
        return 'A simple training ground';
      case 'city-streets':
        return 'Urban environment with abandoned cars';
      case 'volcano':
        return 'Dangerous volcanic terrain with lava hazards';
      case 'forest':
        return 'Dense foggy forest with limited visibility';
      case 'industrial':
        return 'Factory complex with conveyor belts and hazards';
      default:
        return 'Unknown environment';
    }
  }

  const handleBack = () => {
    setCurrentScreen('main');
    setSelectedButton(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen === 'main') {
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
            if (selectedButton === 0) setCurrentScreen('levelSelect');
            else if (selectedButton === 1) setCurrentScreen('settings');
            else if (selectedButton === 2) setCurrentScreen('scores');
            break;
        }
      } else if (currentScreen === 'levelSelect') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            playHover();
            setSelectedLevel(prev => (prev - 1 + levels.length) % levels.length);
            break;
          case 'ArrowDown':
            e.preventDefault();
            playHover();
            setSelectedLevel(prev => (prev + 1) % levels.length);
            break;
          case 'Enter':
            e.preventDefault();
            playClick();
            onStartGame(levels[selectedLevel].id);
            break;
          case 'Escape':
            e.preventDefault();
            playClick();
            handleBack();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, selectedButton, selectedLevel, levels, onStartGame, playHover, playClick]);

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

  if (currentScreen === 'levelSelect') {
    return (
      <div className="mainMenu">
        <h1 className="title">Select Level</h1>
        
        <div className="levelSelectContainer" style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '1rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          {levels.map((level, index) => (
            <div
              key={level.id}
              className={`levelSelectItem ${selectedLevel === index ? 'selected' : ''}`}
              onClick={() => {
                playClick();
                onStartGame(level.id);
              }}
              onMouseEnter={() => {
                if (selectedLevel !== index) playHover();
                setSelectedLevel(index);
              }}
              style={{
                padding: '1rem',
                margin: '0.5rem 0',
                backgroundColor: selectedLevel === index ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: selectedLevel === index ? '2px solid #00ff00' : '2px solid transparent'
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                color: '#00ff00',
                marginBottom: '0.5rem'
              }}>
                Level {level.id}: {level.name}
              </h3>
              <p style={{
                color: '#aaa',
                fontSize: '1rem'
              }}>
                {level.description}
              </p>
            </div>
          ))}
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
            setCurrentScreen('levelSelect');
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