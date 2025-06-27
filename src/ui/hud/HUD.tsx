import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const HUD: React.FC = () => {
  const { gameStats, playerHealth, playerMaxHealth } = useGameStore();
  
  // TODO: Connect weapon info when weapon system is implemented
  const currentWeapon = 'Pistol';
  const ammo = -1; // -1 for unlimited

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '20px',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      {/* Health Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <span style={{ color: 'white', marginRight: '10px' }}>Health:</span>
        <div style={{
          width: '200px',
          height: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid white',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(playerHealth / playerMaxHealth) * 100}%`,
            height: '100%',
            backgroundColor: '#4CAF50',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ color: 'white', marginLeft: '10px' }}>{playerHealth}/{playerMaxHealth}</span>
      </div>

      {/* Weapon Info */}
      <div style={{
        color: 'white',
        fontSize: '18px',
        marginBottom: '10px'
      }}>
        Weapon: {currentWeapon} {ammo >= 0 ? `(${ammo})` : '(∞)'}
      </div>

      {/* Score and Stats */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        textAlign: 'right',
        color: 'white',
        fontSize: '18px'
      }}>
        <div>Score: {gameStats.score}</div>
        <div>Wave: {gameStats.waveNumber}</div>
        <div>Zombies Killed: {gameStats.zombiesKilled}</div>
      </div>
    </div>
  );
};