import React, { useState, useEffect } from 'react';
import './PauseMenu.css';
import { SettingsMenu } from './SettingsMenu';

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume, onQuit }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedButton, setSelectedButton] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onResume();
          break;
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
          if (selectedButton === 0) onResume();
          else if (selectedButton === 1) setShowSettings(true);
          else if (selectedButton === 2) onQuit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, selectedButton, onResume, onQuit]);

  if (showSettings) {
    return (
      <div className="pauseOverlay">
        <SettingsMenu onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="pauseOverlay">
      <div className="pauseContainer">
        <h2 className="pauseTitle">PAUSED</h2>
        
        <div className="pauseButtonContainer">
          <button
            onClick={onResume}
            className={`pauseButton resumeButton ${selectedButton === 0 ? 'selected' : ''}`}
            onMouseEnter={() => setSelectedButton(0)}
          >
            Resume
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className={`pauseButton settingsButtonPause ${selectedButton === 1 ? 'selected' : ''}`}
            onMouseEnter={() => setSelectedButton(1)}
          >
            Settings
          </button>
          
          <button
            onClick={onQuit}
            className={`pauseButton quitButton ${selectedButton === 2 ? 'selected' : ''}`}
            onMouseEnter={() => setSelectedButton(2)}
          >
            Quit to Main Menu
          </button>
        </div>
        
        <p className="pauseHint">Press ESC to resume</p>
      </div>
    </div>
  );
};