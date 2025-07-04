import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { playSound } from '../../utils/audioUtils';
import './MainMenu.css';

interface GameOverScreenProps {
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart, onMainMenu }) => {
  const { gameStats } = useGameStore();
  const { score, zombiesKilled, waveNumber } = gameStats;

  useEffect(() => {
    // Play game over sound
    playSound('gameOver');
  }, []);

  const playClick = () => playSound('menuClick');
  const playHover = () => playSound('menuHover');

  return (
    <div className="mainMenu gameOverScreen">
      <h1 className="title gameOverTitle">GAME OVER</h1>
      
      <div className="statsContainer">
        <div className="statItem">
          <span className="statLabel">Final Score</span>
          <span className="statValue">{score.toLocaleString()}</span>
        </div>
        <div className="statItem">
          <span className="statLabel">Zombies Killed</span>
          <span className="statValue">{zombiesKilled}</span>
        </div>
        <div className="statItem">
          <span className="statLabel">Waves Survived</span>
          <span className="statValue">{waveNumber - 1}</span>
        </div>
      </div>
      
      <div className="menuButtons">
        <button
          className="menuButton primaryButton"
          onClick={() => {
            playClick();
            onRestart();
          }}
          onMouseEnter={playHover}
        >
          Try Again
        </button>
        
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