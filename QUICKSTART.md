# Quick Start Guide

## 🚀 Launch the Game (2 minutes)

### Step 1: Start Web Server

Open PowerShell in the project directory and run:

```powershell
cd C:\Users\alonz\Desktop\Google_Hackathon
python -m http.server 8000 --bind 127.0.0.1
```

You should see:
```
Serving HTTP on 127.0.0.1 port 8000 (http://127.0.0.1:8000/) ...
```

### Step 2: Open Browser

Navigate to: **http://127.0.0.1:8000**

The game will load with:
- Canvas on the left showing the generated world
- Sidebar on the right with stats, crafting, and inventory

## 🎮 First 5 Minutes

1. **World Generates**: You'll see a colored terrain map
   - Blue = Water
   - Yellow = Sand
   - Green = Grass/Forest
   - Gray = Mountain
   - Light Blue = Tundra

2. **Player Spawns**: Red square in center view

3. **Move Around**: Press **WASD** to explore

4. **Check Stats**: Watch the right sidebar update:
   - Hunger decreases over time
   - Enemies appear on "Nearby Mobs" list

5. **Try Crafting**:
   - Your starting inventory has Wood and Stone
   - Type "Wooden Axe" in the crafting box
   - Press "Craft Item"
   - Axe appears in inventory!

## 🔧 Crafting Tips

### Materials You Start With
- ✓ **Wood** (weight 1)
- ✓ **Stone** (weight 1.5)

### Try These Recipes
| Recipe | Type | Stats |
|--------|------|-------|
| Wooden Sword | weapon | DMG 2, DUR 150 |
| Stone Axe | tool | DMG 3, DUR 200 |
| Wooden Shield | armor | DEF 2, DUR 180 |
| Stone Pickaxe | tool | DMG 4, DUR 250 |

**Tip**: Combine materials for better results!
- "Iron Sword" (multiple materials) = Rare quality

## 📊 Understanding the HUD

### Left Panel (Canvas)
- Rendered world with terrain biomes and mobs
- Red square = Your player
- Colored squares = Mobs (white=sheep, brown=cow, green=goblin, etc.)

### Right Panel (Stats)

**PLAYER STATS**
- Level: Increases with crafting
- Health: Decreases when enemies attack
- Hunger: Decreases over time (mechanic for future)
- Carrying: Current/max inventory weight
- Temp: Body temperature (affects future gameplay)

**CRAFTING SYSTEM**
- Text box: Type item name (freeform)
- "Craft Item" button: Generate item
- "Show Materials" button: List inventory

**NEARBY MOBS**
- Lists enemies within 150px
- Shows type, distance, health

## ⚠️ Current Limitations

### Version 0.1 (MVP)
- **No actual combat yet** - Enemies move but don't cause real damage
- **No tree interaction** - You can't actually chop trees for wood
- **Placeholder assets** - Generated items show colorful squares, not real icons
- **Simple AI** - Enemies follow but don't adapt much
- **No saves** - Game resets on page reload

### What Still Needs NanoBanana API
To enable AI-generated pixel art asset icons:

1. Get API key from **nanobananai.com** (requires account)
2. Modify `src/game.js` line 7:
   ```javascript
   const game = new Game(canvas, "sk-xxxxxxxxxxxxxxxx");
   ```
3. Reload page - items will now generate real PNG icons!

## 🐛 Troubleshooting

### "Canvas shows black screen"
- Page might still be loading
- Check browser console (F12) for errors
- Ensure JavaScript is enabled

### "Cannot POST to NanoBanana"
- Normal! API key not set
- Game uses placeholder generator (works fine)
- Optional: adds API key for real icons

### "Inventory says 'Empty'"
- Click "Show Materials" button to display items
- You should see "Wood" and "Stone"

### Game won't load at all
- Make sure web server is running
- Try hard-refresh: **Ctrl+Shift+R** or **Cmd+Shift+R**
- Check that all `/src/*.js` files exist

## 🎓 Exploring Code

### Main Entry Point
`index.html` - Contains game UI and initialization

### Core Systems
- `src/terrain.js` - World generation (biomes, trees)
- `src/player.js` - Character controller
- `src/mobs.js` - Enemy AI and behaviors
- `src/crafting.js` - Item generation and caching
- `src/game.js` - Main game loop

### Try These Experiments

1. **Change world seed** in `src/game.js`:
   ```javascript
   const seed = 'my_custom_seed_' + Date.now();
   ```

2. **Adjust enemy count**: In `game.js`:
   ```javascript
   this.mobs = spawnMobs(this.world, this.enemyAI, 20, 15); // 15 enemies instead of 8
   ```

3. **Tweak enemy aggression**: In `src/mobs.js`:
   ```javascript
   this.enemyAI = new EnemyAI(0.8); // Higher = more aggressive
   ```

## 📚 Next Steps to Enhance

1. **Add sprite rendering** - Replace rectangles with actual pixel art
2. **Implement combat** - Make enemy attacks actually damage player
3. **Tree interaction** - Click trees to gather wood
4. **Day/night cycle** - Ramp up enemy spawns at night
5. **More item types** - Potions, food, armor
6. **Sound effects** - Add audio feedback

---

**Have fun exploring!** The world is infinitely generated and unique. Try generating different seeds to see varied biomes!
