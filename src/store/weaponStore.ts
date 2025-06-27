import { create } from 'zustand';
import { Weapon } from '../types';

interface WeaponStore {
  currentWeapon: Weapon | null;
  currentWeaponIndex: number;
  weapons: Weapon[];
  
  setCurrentWeapon: (weapon: Weapon | null) => void;
  setCurrentWeaponIndex: (index: number) => void;
  setWeapons: (weapons: Weapon[]) => void;
  updateWeaponAmmo: (weaponId: string, ammo: number) => void;
}

export const useWeaponStore = create<WeaponStore>((set) => ({
  currentWeapon: null,
  currentWeaponIndex: 0,
  weapons: [],
  
  setCurrentWeapon: (weapon) => set({ currentWeapon: weapon }),
  setCurrentWeaponIndex: (index) => set({ currentWeaponIndex: index }),
  setWeapons: (weapons) => set({ weapons }),
  updateWeaponAmmo: (weaponId, ammo) => set((state) => ({
    weapons: state.weapons.map(w => 
      w.id === weaponId ? { ...w, ammo } : w
    ),
    currentWeapon: state.currentWeapon?.id === weaponId 
      ? { ...state.currentWeapon, ammo } 
      : state.currentWeapon
  }))
}));

// Selector hooks
export const useCurrentWeapon = () => useWeaponStore((state) => state.currentWeapon);
export const useWeapons = () => useWeaponStore((state) => state.weapons);