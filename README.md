# Survival Game - Full Implementation

A complete **2D top-down survival game** built with vanilla JavaScript and Canvas, inspired by Terraria and Don't Starve. Features procedural terrain generation, AI-powered crafting system, adaptive enemy AI, and dynamic mob behavior.

## 🎮 Features

### Layer 1: World & Terrain Generation
- **FFT-style Spectral Synthesis**: Generates smooth, organic terrain using Fourier decomposition
- **Biome System**: 7 distinct biomes based on Moisture × Temperature axes
  - Water, Sand, Grass, Forest, Jungle, Tundra, Mountain
- **Poisson Disc Sampling**: Trees distributed naturally with growth stages (Seedling → Sapling → Mature → Ancient)
- **Tree Modifiers**: 20% chance for Fruit-bearing or Hollow (storage) variants
- **Seeded Generation**: Reproducible worlds via seed string

### Layer 2: Player Controller & Movement
- **WASD Movement**: Smooth acceleration-based character control
- **Weight System**: Inventory weight reduces movement speed up to 50%
- **Context Cursor**: Detects nearest interactable object (trees, enemies, etc.)
- **Durability System**: Tools degrade with use; breaking yields "Scrap"
- **Stats Tracking**: Health, Hunger, Temperature, Experience per skill

### Layer 3: AI-Powered Crafting System
- **Natural Language Prompts**: Type "Iron Sword" to craft items directly
- **Item Analyzer**: Validates requests against inventory materials
- **Dynamic Asset Generation**: Integrates with **NanoBanana API** for pixel-art PNG generation
- **Caching System**: Memorizes identical crafts to avoid re-generation
- **Stat Calculation**: Items inherit stats from combined materials
  - Damage, Defense, Durability, Rarity (Common/Uncommon/Rare)

### Layer 4: Passive Mob System
Three generic types: **Sheep, Cow, Chicken**
- **Behavior**: Random wandering + herding
- **Drops**: Meat (1-2 pieces per kill)
- **Death**: Despawns, drops resources

### Layer 5: Adaptive Enemy AI
Three enemy types: **Goblin, Orc, Shadow Creature**
- **Perception**: Detect player within 120px range
- **Decision Tree**: Attack/Retreat/Idle based on:
  - Player fitness (health, gear, level)
  - Enemy aggression stat (0.0 → 1.0)
- **Learning**: Increases aggression after wins, decreases after losses
- **Scaling**: Higher difficulty as player progresses

## 📁 Project Structure

```
Google_Hackathon/
├── index.html              # Main entry point, game UI
├── src/
│   ├── game.js             # Main game loop & orchestration
│   ├── terrain.js          # Terrain generation (biomes, trees)
│   ├── player.js           # Player class, controller, inventory
│   ├── crafting.js         # ItemGenerator, CraftingUI, ItemAnalyzer
│   ├── nanobanana_api.js   # NanoBanana API client & AssetManager
│   ├── mobs.js             # PassiveMob, EnemyMob, EnemyAI
│   ├── renderer.js         # Canvas rendering, camera system
│   └── utils.js            # Shared utilities (RNG, math)
├── game_software_design.md # Design spec
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern browser (Chrome, Firefox, Safari, Edge) with ES6 module support
- Local HTTP server (not file:// protocol due to CORS)

### Installation & Running

```bash
cd c:\Users\alonz\Desktop\Google_Hackathon
python -m http.server 8000 --bind 127.0.0.1
```

Then open **http://127.0.0.1:8000** in your browser.

## ⌨️ Controls

| Key | Action |
|-----|--------|
| **WASD** | Move character |
| **E** | Interact (chop trees, attack) |
| **GUI** | Craft items via text input |

## 🎨 Crafting System

### How to Craft

1. **Check inventory** for materials (starts with Wood + Stone)
2. **Type item name** in the "Crafting System" panel (e.g., "Iron Sword")
3. **Press "Craft Item"** button
4. System validates, generates stats, creates pixelated asset
5. **Item appears** in inventory if space available

### Example Recipes

- **Wood Axe** (wood materials) → Tool with Damage 2, Durability 150
- **Stone Shield** (stone materials) → Armor with Defense 3, Durability 200
- **Iron Sword** (any materials) → Weapon with Damage 5, Durability 250

## 🤖 NanoBanana Integration

### API Connection

The game uses **NanoBanana API** to generate realistic pixelated PNG item icons:

```javascript
const client = new NanoBananaClient(API_KEY);
const iconUrl = await client.generateItemIcon("Iron Sword", {
  type: "weapon",
  damage: 10,
  defense: 0,
  rarity: "uncommon"
});
```

### Without API Key

If no API key is provided, the system generates **pixel-art placeholder SVG icons** with:
- Colored backgrounds based on item type
- Item name labels
- Cached for performance

### Setup (Optional)

To use real NanoBanana generation:

1. Sign up at **https://nanobananai.com**
2. Get your API key
3. Modify `src/game.js` initialization:
   ```javascript
   const game = new Game(canvas, "YOUR_NANOBANANA_API_KEY");
   ```

## 🧬 Adaptive Enemy AI

### Player Fitness Calculation

```
Fitness = (Inventory Fullness × 0.4) + (Health % × 0.4) + (Level/20 × 0.2)
```

### AI Response

| Fitness | Behavior |
|---------|----------|
| **< 0.3** (weak) | Always attack |
| **0.3-0.7** (medium) | Attack if base aggression > 0.5 |
| **> 0.7** (strong) | Retreat or attack cautiously |

### Learning After Combat

- **Win**: `aggression += 0.1`, +5 max health, +2 damage
- **Loss**: `aggression -= 0.15` (min 0.2)

## 📊 Game Statistics

- **World Size**: 512 × 512 tiles (8192 × 8192 pixels)
- **Tile Size**: 16 × 16 pixels
- **Starting Passive Mobs**: 20 (sheep, cow, chicken)
- **Starting Enemy Mobs**: 8 (goblin, orc, shadow_creature)
- **Max Inventory Weight**: 100 units
- **Base Player Health**: 100 HP

## 🐛 Known Issues & Limitations

1. **Rendering**: Currently using simple filled rectangles for mobs/trees (no sprite graphics)
2. **NanoBanana**: Real API requires paid credits; placeholders work offline
3. **Performance**: No culling yet; rendering all objects regardless of camera view
4. **Combat**: Simplified melee system; no ranged weapons yet
5. **UI**: Minimal inventory management (no dragging/sorting)

## 🔮 Future Enhancements

- [ ] Sprite rendering system with actual pixel art
- [ ] Shadow Invasion mechanic (night waves of enemies)
- [ ] Base building & fortification
- [ ] Day/night cycle with dynamic lighting
- [ ] Hunger/temperature status effects
- [ ] More complex crafting recipes & skill trees
- [ ] Multiplayer networking (WebSocket)
- [ ] Mobile touch controls
- [ ] Save/load system
- [ ] Audio effects & music

## 📝 Architecture Overview

### Game Loop (`src/game.js`)

```javascript
function gameLoop() {
  // 1. Update player input
  playerController.update(gameObjects, deltaTime);

  // 2. Update mobs (passive & enemy AI)
  for (const mob of mobs) {
    mob.update(player, deltaTime);
  }

  // 3. Check collisions (attacks, item pickup)
  checkCollisions();

  // 4. Render frame
  renderer.updateCamera(player);
  renderer.render(player, mobs, trees);

  // 5. Request next frame
  requestAnimationFrame(gameLoop);
}
```

### Module Dependencies

```
index.html
  ├─ game.js
  │  ├─ terrain.js
  │  ├─ player.js
  │  ├─ crafting.js
  │  │  └─ nanobanana_api.js
  │  ├─ mobs.js
  │  ├─ renderer.js
  │  └─ utils.js
```

## 💾 Caching & Performance

The **CacheManager** (ItemGenerator.cache) stores generated items by:
- **Key**: `${prompt}:${materials.join('|')}`
- **Result**: Full item object with asset URL

This prevents re-requesting NanoBanana API for identical crafts and improves UI responsiveness.

## 📖 Design References

- **Terrain**: Perlin noise approximation with spectral synthesis
- **Biomes**: Whittaker diagram (Moisture × Temperature)
- **Trees**: Poisson disc sampling for natural distribution
- **AI**: Simple GOAP-style (Goal-Oriented Action Planning) decision tree
- **Crafting**: NLP-inspired natural language input + procedural generation

---

**Built for Google Hackathon 2026** | JavaScript + Canvas | No frameworks required
