import { create } from 'zustand';
import { IBoss } from '../entities/bosses/BossSystem';

interface BossState {
  currentBoss: IBoss | null;
  bossHealth: number;
  bossMaxHealth: number;
  bossPhase: number;
  bossName: string;
  isVisible: boolean;
  lastDamage: number;
  specialAttackWarning: string;
  
  // Actions
  setBoss: (boss: IBoss | null) => void;
  updateBossHealth: (health: number, damage?: number) => void;
  setBossPhase: (phase: number) => void;
  showSpecialAttackWarning: (warning: string) => void;
  clearWarning: () => void;
  hideBossUI: () => void;
}

export const useBossStore = create<BossState>((set) => ({
  currentBoss: null,
  bossHealth: 0,
  bossMaxHealth: 0,
  bossPhase: 1,
  bossName: '',
  isVisible: false,
  lastDamage: 0,
  specialAttackWarning: '',
  
  setBoss: (boss) => set({
    currentBoss: boss,
    bossHealth: boss?.health || 0,
    bossMaxHealth: boss?.maxHealth || 0,
    bossPhase: boss?.phase || 1,
    bossName: boss?.name || '',
    isVisible: !!boss,
    lastDamage: 0,
    specialAttackWarning: ''
  }),
  
  updateBossHealth: (health, damage) => set({
    bossHealth: health,
    lastDamage: damage || 0
  }),
  
  setBossPhase: (phase) => set({
    bossPhase: phase
  }),
  
  showSpecialAttackWarning: (warning) => {
    set({ specialAttackWarning: warning });
    // Auto-clear after 2 seconds
    setTimeout(() => {
      set({ specialAttackWarning: '' });
    }, 2000);
  },
  
  clearWarning: () => set({ specialAttackWarning: '' }),
  
  hideBossUI: () => set({
    isVisible: false,
    currentBoss: null
  })
}));