import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameEngine } from '../core/engine/GameEngine';

interface GameCanvasProps {
  isPaused: boolean;
  onGameOver: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ isPaused, onGameOver }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize game engine
    engineRef.current = new GameEngine(mountRef.current, onGameOver);
    engineRef.current.start();

    // Handle window resize
    const handleResize = () => {
      engineRef.current?.handleResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engineRef.current?.destroy();
    };
  }, [onGameOver]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPaused(isPaused);
    }
  }, [isPaused]);

  return (
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
  );
};