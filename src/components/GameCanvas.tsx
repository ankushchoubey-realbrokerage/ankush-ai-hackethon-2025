import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameEngine } from '../core/engine/GameEngine';
import { InputDisplay } from '../ui/hud/InputDisplay';
import { DebugInfo } from '../ui/hud/DebugInfo';
import { useIsPaused } from '../store/gameStore';

interface GameCanvasProps {
  isPaused: boolean;
  onGameOver: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ isPaused, onGameOver }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const onGameOverRef = useRef(onGameOver);
  const [showDebug, setShowDebug] = useState(false);
  
  // Update ref when callback changes
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Only create engine if it doesn't exist
    if (!engineRef.current) {
      // Initialize game engine
      engineRef.current = new GameEngine(mountRef.current, () => onGameOverRef.current());
      engineRef.current.start();
    }

    // Handle window resize
    const handleResize = () => {
      engineRef.current?.handleResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Don't destroy on every unmount, only when component is truly unmounting
    };
  }, []); // Empty dependency array - only run once

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPaused(isPaused);
    }
  }, [isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowDebug(prev => !prev);
        engineRef.current?.toggleDebug();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getActiveKeys = () => {
    return engineRef.current?.getInputManager()?.getActiveKeys() || [];
  };

  const getMousePosition = () => {
    return engineRef.current?.getInputManager()?.getInput().mousePosition || { x: 0, y: 0 };
  };

  const getPlayerInfo = () => {
    const player = engineRef.current?.getPlayer();
    if (!player) return null;
    return {
      position: player.getPosition(),
      rotation: player.getRotation(),
      velocity: player.getVelocity ? player.getVelocity() : undefined
    };
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <>
      <div 
        ref={mountRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }} 
      />
      {showDebug && (
        <>
          <InputDisplay 
            getActiveKeys={getActiveKeys}
            getMousePosition={getMousePosition}
          />
          <DebugInfo getPlayerInfo={getPlayerInfo} />
        </>
      )}
    </>
  );
};