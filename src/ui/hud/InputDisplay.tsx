import React, { useEffect, useState } from 'react';

interface InputDisplayProps {
  getActiveKeys: () => string[];
  getMousePosition: () => { x: number; y: number };
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ getActiveKeys, getMousePosition }) => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKeys(getActiveKeys());
      setMousePos(getMousePosition());
    }, 50); // Update every 50ms for responsive feedback

    return () => clearInterval(interval);
  }, [getActiveKeys, getMousePosition]);

  if (!import.meta.env.DEV) return null;

  const keyStyle = (key: string, isActive: boolean) => ({
    display: 'inline-block',
    width: '30px',
    height: '30px',
    margin: '2px',
    backgroundColor: isActive ? '#00ff00' : '#333',
    color: isActive ? '#000' : '#888',
    border: '1px solid #555',
    borderRadius: '3px',
    textAlign: 'center' as const,
    lineHeight: '30px',
    fontWeight: 'bold',
    fontSize: '14px'
  });

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '15px',
      fontFamily: 'monospace',
      fontSize: '12px',
      borderRadius: '5px',
      pointerEvents: 'none',
      minWidth: '200px'
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
        Input Monitor
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <div style={{ marginBottom: '5px' }}>Movement Keys:</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
          <div style={keyStyle('W', activeKeys.includes('w'))}>W</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={keyStyle('A', activeKeys.includes('a'))}>A</div>
          <div style={keyStyle('S', activeKeys.includes('s'))}>S</div>
          <div style={keyStyle('D', activeKeys.includes('d'))}>D</div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div>Fire: {activeKeys.includes(' ') ? '🔥 SPACE' : '⭕ SPACE'}</div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div>Weapon Keys:</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {[1, 2, 3, 4].map(num => (
            <div key={num} style={keyStyle(num.toString(), activeKeys.includes(num.toString()))}>
              {num}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '5px' }}>
        <div>Mouse: ({mousePos.x.toFixed(0)}, {mousePos.y.toFixed(0)})</div>
      </div>

      <div style={{ fontSize: '10px', color: '#888', marginTop: '10px' }}>
        Press F1 to toggle debug mode
      </div>
    </div>
  );
};