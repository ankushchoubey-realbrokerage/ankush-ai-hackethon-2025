import React, { useEffect, useState } from 'react';

interface DebugInfoProps {
  getPlayerInfo: () => { 
    position: { x: number; y: number; z: number }; 
    rotation: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
  } | null;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ getPlayerInfo }) => {
  const [info, setInfo] = useState<{ 
    position: { x: number; y: number; z: number }; 
    rotation: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const playerInfo = getPlayerInfo();
      if (playerInfo) {
        setInfo(playerInfo);
      }
    }, 50); // Update every 50ms for smoother display

    return () => clearInterval(interval);
  }, [getPlayerInfo]);

  if (!info || !import.meta.env.DEV) return null;

  const speed = info.velocity 
    ? Math.sqrt(info.velocity.x ** 2 + info.velocity.z ** 2)
    : 0;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#00ff00',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '5px',
      pointerEvents: 'none',
      minWidth: '250px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Player Debug Info</div>
      <div>Position: X: {info.position.x.toFixed(2)}, Y: {info.position.y.toFixed(2)}, Z: {info.position.z.toFixed(2)}</div>
      <div>Rotation: X: {(info.rotation.x * 180 / Math.PI).toFixed(0)}°, Y: {(info.rotation.y * 180 / Math.PI).toFixed(0)}°, Z: {(info.rotation.z * 180 / Math.PI).toFixed(0)}°</div>
      {info.velocity && (
        <>
          <div>Velocity: X: {info.velocity.x.toFixed(2)}, Z: {info.velocity.z.toFixed(2)}</div>
          <div>Speed: {speed.toFixed(2)} units/s</div>
        </>
      )}
    </div>
  );
};