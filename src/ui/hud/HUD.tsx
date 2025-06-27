import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useCurrentWeapon } from '../../store/weaponStore';

export const HUD: React.FC = () => {
  const { gameStats, playerHealth, playerMaxHealth } = useGameStore();
  const currentWeapon = useCurrentWeapon();
  
  // Debug logging
  React.useEffect(() => {
    console.log(`HUD render - Health: ${playerHealth}/${playerMaxHealth}`);
  }, [playerHealth, playerMaxHealth]);
  
  const weaponName = currentWeapon?.name || 'None';
  const ammo = currentWeapon?.ammo || 0;
  const isUnlimited = currentWeapon?.isUnlimited || false;
  
  // Calculate health bar color based on health percentage
  const healthPercentage = (playerHealth / playerMaxHealth) * 100;
  const healthColor = healthPercentage > 60 ? '#4CAF50' : 
                     healthPercentage > 30 ? '#FFC107' : '#F44336';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '20px',
      pointerEvents: 'none',
      userSelect: 'none',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Health Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <span style={{ 
          color: 'white', 
          marginRight: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>Health:</span>
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
            backgroundColor: healthColor,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ 
          color: 'white', 
          marginLeft: '10px',
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>{playerHealth}/{playerMaxHealth}</span>
      </div>

      {/* Weapon Info */}
      <div style={{
        color: 'white',
        fontSize: '18px',
        marginBottom: '10px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        <span style={{ color: '#FFC107' }}>⚔️</span> {weaponName} {isUnlimited ? '(∞)' : `(${ammo})`}
      </div>

      {/* Score and Stats */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        textAlign: 'right',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div style={{ marginBottom: '5px' }}>🏆 Score: <span style={{ color: '#4CAF50' }}>{gameStats.score}</span></div>
        <div style={{ marginBottom: '5px' }}>🌊 Wave: <span style={{ color: '#FFC107' }}>{gameStats.waveNumber}</span></div>
        <div>💀 Zombies: <span style={{ color: '#F44336' }}>{gameStats.zombiesKilled}</span></div>
      </div>
    </div>
  );
};