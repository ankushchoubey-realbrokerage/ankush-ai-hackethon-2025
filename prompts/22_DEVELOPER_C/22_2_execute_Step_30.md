# Step 30: Main Menu Implementation

## Overview
Enhance the existing main menu with better UI, settings functionality, and volume controls.

## Task Details
From EXECUTION_PLAN.md Step 30:
- Create main menu UI with React
- Implement Start Game button
- Add Settings submenu
- Add volume controls in settings

## Implementation Requirements

### 1. Enhance Main Menu
In `src/ui/menu/MainMenu.tsx`:
- The basic structure already exists
- Add hover effects and transitions
- Implement proper button styling
- Add background image or animated background
- Make it responsive for different screen sizes

### 2. Create Settings Menu
Create new file `src/ui/menu/SettingsMenu.tsx`:
- Volume sliders (Master, Music, SFX)
- Graphics quality options (if applicable)
- Control remapping display
- Back button to main menu

### 3. Implement Menu Navigation
- Add state management for menu screens
- Smooth transitions between menus
- Keyboard navigation support (arrow keys, Enter)
- ESC key to go back

### 4. Volume Control Integration
- Connect to AudioManager for volume changes
- Save settings to localStorage
- Load settings on game start
- Real-time preview (play sound when adjusting)

### 5. Visual Polish
- Add CSS animations and transitions
- Use consistent color scheme
- Add subtle particle effects or animations
- Ensure good contrast and readability

## Merge Conflict Prevention Tips
1. **UI is isolated**:
   - You're working on UI components only
   - No conflicts with game logic or audio system
   - Keep changes within UI folder

2. **AudioManager integration**:
   - Only read/write volume values
   - Don't modify AudioManager implementation
   - Use the public API that Developer B creates

3. **State management**:
   - Keep menu state separate from game state
   - Use React state or context for menu navigation
   - Don't modify game store for menu logic

## Testing Requirements
1. Test all menu navigation paths
2. Verify settings save and load correctly
3. Test volume controls affect game audio
4. Check responsive design on different screen sizes
5. Verify keyboard navigation works
6. Test transition animations are smooth

## Expected Behavior
- Menu loads quickly and looks polished
- All buttons have clear hover/active states
- Settings changes apply immediately
- Volume changes persist between sessions
- Navigation feels smooth and intuitive
- Professional, game-ready appearance

## UI/UX Guidelines
- Dark theme fitting zombie apocalypse
- Red accents for danger/action
- Clean, readable typography
- Smooth animations (not jarring)
- Accessible design (clear contrast)
- Mobile-friendly if needed

## Settings Menu Example Structure
```typescript
interface SettingsMenuProps {
  onBack: () => void;
  audioManager: AudioManager;
}

interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
}
```

## CSS Suggestions
- Use CSS modules or styled-components
- Add glow effects for zombie theme
- Subtle animations on hover
- Blood splatter decorations (subtle)
- Torn paper or distressed textures

Remember: The menu is the first thing players see. Make it impressive and set the mood for the zombie apocalypse!