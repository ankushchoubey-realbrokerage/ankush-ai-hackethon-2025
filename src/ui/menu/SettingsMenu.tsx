import React, { useEffect } from 'react';
import './SettingsMenu.css';
import { useSettings } from '../../contexts/SettingsContext';

interface SettingsMenuProps {
  onBack: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack }) => {
  const { settings, updateSettings } = useSettings();

  const handleVolumeChange = (type: 'masterVolume' | 'musicVolume' | 'sfxVolume', value: number) => {
    updateSettings({ [type]: value });
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    updateSettings({ graphicsQuality: quality });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack();
    }
  };

  return (
    <div className="settingsMenu" onKeyDown={handleKeyDown} tabIndex={0}>
      <h1 className="settingsTitle">Settings</h1>
      
      <div className="settingsContainer">
        {/* Volume Controls */}
        <div className="settingsSection">
          <h2 className="sectionTitle">Audio</h2>
          
          <div className="settingRow">
            <label className="settingLabel">Master Volume</label>
            <div className="sliderContainer">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume * 100}
                onChange={(e) => handleVolumeChange('masterVolume', Number(e.target.value) / 100)}
                className="volumeSlider"
              />
              <span className="volumeValue">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
          </div>
          
          <div className="settingRow">
            <label className="settingLabel">Music Volume</label>
            <div className="sliderContainer">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume * 100}
                onChange={(e) => handleVolumeChange('musicVolume', Number(e.target.value) / 100)}
                className="volumeSlider"
              />
              <span className="volumeValue">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
          </div>
          
          <div className="settingRow">
            <label className="settingLabel">SFX Volume</label>
            <div className="sliderContainer">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sfxVolume * 100}
                onChange={(e) => handleVolumeChange('sfxVolume', Number(e.target.value) / 100)}
                className="volumeSlider"
              />
              <span className="volumeValue">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
          </div>
        </div>
        
        {/* Graphics Settings */}
        <div className="settingsSection">
          <h2 className="sectionTitle">Graphics</h2>
          
          <div className="settingRow">
            <label className="settingLabel">Quality</label>
            <div className="qualityButtons">
              <button
                className={`qualityButton ${settings.graphicsQuality === 'low' ? 'active' : ''}`}
                onClick={() => handleQualityChange('low')}
              >
                Low
              </button>
              <button
                className={`qualityButton ${settings.graphicsQuality === 'medium' ? 'active' : ''}`}
                onClick={() => handleQualityChange('medium')}
              >
                Medium
              </button>
              <button
                className={`qualityButton ${settings.graphicsQuality === 'high' ? 'active' : ''}`}
                onClick={() => handleQualityChange('high')}
              >
                High
              </button>
            </div>
          </div>
        </div>
        
        {/* Controls Info */}
        <div className="settingsSection">
          <h2 className="sectionTitle">Controls</h2>
          <div className="controlsList">
            <div className="controlItem">
              <span className="controlKey">WASD</span>
              <span className="controlAction">Move</span>
            </div>
            <div className="controlItem">
              <span className="controlKey">Mouse</span>
              <span className="controlAction">Aim</span>
            </div>
            <div className="controlItem">
              <span className="controlKey">Left Click</span>
              <span className="controlAction">Shoot</span>
            </div>
            <div className="controlItem">
              <span className="controlKey">1-3</span>
              <span className="controlAction">Switch Weapon</span>
            </div>
            <div className="controlItem">
              <span className="controlKey">ESC</span>
              <span className="controlAction">Pause</span>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="backButton"
        onClick={onBack}
      >
        Back to Menu
      </button>
    </div>
  );
};