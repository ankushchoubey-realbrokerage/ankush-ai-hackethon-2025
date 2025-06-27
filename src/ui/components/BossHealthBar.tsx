import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossHealthBarProps {
  bossName: string;
  currentHealth: number;
  maxHealth: number;
  phase: number;
  visible: boolean;
  lastDamage?: number;
  specialAttackWarning?: string;
}

export const BossHealthBar: React.FC<BossHealthBarProps> = ({
  bossName,
  currentHealth,
  maxHealth,
  phase,
  visible,
  lastDamage,
  specialAttackWarning
}) => {
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; damage: number; x: number }>>([]);
  const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100);
  
  // Add damage number when damage is dealt
  useEffect(() => {
    if (lastDamage && lastDamage > 0) {
      const newDamageNumber = {
        id: Date.now(),
        damage: lastDamage,
        x: 45 + Math.random() * 10 // Random position near health bar
      };
      
      setDamageNumbers(prev => [...prev, newDamageNumber]);
      
      // Remove after animation
      setTimeout(() => {
        setDamageNumbers(prev => prev.filter(d => d.id !== newDamageNumber.id));
      }, 2000);
    }
  }, [lastDamage]);
  
  // Get phase color
  const getPhaseColor = () => {
    switch (phase) {
      case 1: return 'bg-red-600';
      case 2: return 'bg-orange-600';
      case 3: return 'bg-purple-600';
      default: return 'bg-red-600';
    }
  };
  
  // Get phase name
  const getPhaseName = () => {
    switch (phase) {
      case 1: return 'Phase I';
      case 2: return 'Phase II - Enraged';
      case 3: return 'Phase III - Berserk';
      default: return '';
    }
  };
  
  if (!visible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 w-[600px] z-50"
    >
      {/* Boss Name */}
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-white shadow-lg">
          {bossName}
        </h2>
        <p className="text-lg text-gray-300">{getPhaseName()}</p>
      </div>
      
      {/* Health Bar Container */}
      <div className="relative bg-gray-800 h-12 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
        {/* Phase indicators */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r-2 border-gray-600 opacity-30" />
          <div className="flex-1 border-r-2 border-gray-600 opacity-30" />
          <div className="flex-1" />
        </div>
        
        {/* Health Bar Fill */}
        <motion.div
          className={`absolute left-0 top-0 h-full ${getPhaseColor()} transition-all duration-300`}
          initial={{ width: '100%' }}
          animate={{ width: `${healthPercentage}%` }}
          style={{
            background: `linear-gradient(to right, ${
              phase === 3 ? '#9333ea' : phase === 2 ? '#ea580c' : '#dc2626'
            }, ${
              phase === 3 ? '#c084fc' : phase === 2 ? '#fb923c' : '#ef4444'
            })`
          }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
        </motion.div>
        
        {/* Health Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg drop-shadow-lg">
            {currentHealth} / {maxHealth}
          </span>
        </div>
      </div>
      
      {/* Phase Markers */}
      <div className="relative mt-1 flex justify-between text-xs text-gray-400">
        <span>Phase I</span>
        <span>Phase II (66%)</span>
        <span>Phase III (33%)</span>
      </div>
      
      {/* Damage Numbers */}
      <AnimatePresence>
        {damageNumbers.map(({ id, damage, x }) => (
          <motion.div
            key={id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ 
              opacity: 0, 
              y: -50, 
              scale: 1.5,
              x: x + (Math.random() - 0.5) * 20
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-16 text-4xl font-bold text-yellow-400 drop-shadow-lg"
            style={{ left: `${x}%` }}
          >
            -{damage}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Special Attack Warning */}
      <AnimatePresence>
        {specialAttackWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-red-800 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            <span className="animate-pulse font-bold">{specialAttackWarning}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};