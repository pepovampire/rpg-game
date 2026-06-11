# Simple RPG Game

A browser-based RPG game built with vanilla HTML, CSS, and JavaScript.

## Features

### Player Controls
- **Arrow Keys** - Move left/right and up/down
- **Z** - Jump
- **SPACE** - Interact with NPCs and attack enemies

### Game Mechanics
- **Multiple Areas**: Forest → Cave → Mountain (explore by moving to edges)
- **Combat System**: Press SPACE near enemies to attack
- **Level Up System**: Defeat enemies to gain EXP and level up
  - Increased HP, Damage, and higher EXP requirements
- **NPCs**: Friendly characters that provide hints and lore
- **Enemy Types**:
  - Goblins (Forest) - Weak enemies
  - Spiders (Cave) - Medium enemies
  - Dragons & Orcs (Mountain) - Strong enemies

### Progression
- **HP System**: Take damage from enemy attacks, lose the game if HP reaches 0
- **Experience Points**: Earn EXP by defeating enemies
- **Gold**: Collect gold from defeated enemies
- **Damage Scaling**: Increase your damage with each level up

## How to Play

1. Open `index.html` in your web browser
2. Use Arrow Keys to move around the map
3. Press Z to jump over obstacles
4. Press SPACE near enemies to attack them
5. Defeat enemies to gain experience and level up
6. Talk to NPCs for guidance (press SPACE when nearby)
7. Progress through different areas to face stronger enemies
8. If your HP reaches 0, press R to restart

## Game Areas

### Forest
- Starting area with weak Goblins
- Good for beginners to learn the game
- Elder NPC provides welcome message

### Cave
- More challenging with Spider enemies
- Dwarf NPC warns about the spiders
- Intermediate difficulty

### Mountain
- Hardest area with Dragons and Orcs
- Princess NPC needs your help
- High rewards for successful combat

## Tips

- Build up your level before facing the Mountain enemies
- Plan your path carefully - you can go back to easier areas
- Take advantage of jumping to avoid enemy attacks
- The stronger you get, the more gold you earn per defeat

## Technical Details

- Built with Vanilla JavaScript (no frameworks)
- Canvas-based rendering
- Real-time collision detection
- Simple AI for enemy movement
- Responsive dialog system
- Persistent player stats across areas

Enjoy your adventure! 🎮
