import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { playSound } from '../../utils/audioUtils';
import './MainMenu.css';

interface LevelCompleteScreenProps {
  onNextLevel: () => void;
  onMainMenu: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ 
  onNextLevel, 
  onMainMenu,
  hasNextLevel 
}) => {
  const { gameStats } = useGameStore();
  const { score, zombiesKilled, waveNumber, level } = gameStats;

  useEffect(() => {
    // Play victory sound
    playSound('levelComplete');
  }, []);

  const playClick = () => playSound('menuClick');
  const playHover = () => playSound('menuHover');

  return (
    <div className="mainMenu levelCompleteScreen">
      <h1 className="title successTitle">LEVEL COMPLETE!</h1>
      
      <div className="levelInfo">
        <h2>Level {level} Cleared</h2>
      </div>
      
      <div className="statsContainer">
        <div className="statItem">
          <span className="statLabel">Score</span>
          <span className="statValue">{score.toLocaleString()}</span>
        </div>
        <div className="statItem">
          <span className="statLabel">Zombies Killed</span>
          <span className="statValue">{zombiesKilled}</span>
        </div>
        <div className="statItem">
          <span className="statLabel">Waves Completed</span>
          <span className="statValue">{waveNumber}</span>
        </div>
      </div>
      
      <div className="menuButtons">
        {hasNextLevel && (
          <button
            className="menuButton primaryButton"
            onClick={() => {
              playClick();
              onNextLevel();
            }}
            onMouseEnter={playHover}
          >
            Next Level
          </button>
        )}
        
        <button
          className="menuButton secondaryButton"
          onClick={() => {
            playClick();
            onMainMenu();
          }}
          onMouseEnter={playHover}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};