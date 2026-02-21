Sat Feb 21 13:39:54 JST 2026

# Game Software Design Plan: Project "Aether-Side"

## Style

1. **Style:** 2D Side-Scrolling Survival (Terraria-style).
2. **Visual Aesthetic:** Multi-layered pixel art.
* **Parallax Backgrounds:** At least 3 layers (Far Mountains, Mid-range Trees, Near Foliage) moving at different speeds to create depth.
* **Lighting:** A "Tile-Based" light propagation system. Light levels (0-15) diminish as they move away from a source or deeper underground.
* **Dynamic Grass/Flora:** Shaders or simple rotation transforms to simulate wind.



## Gameplay

1. **Movement:** Horizontal  movement,  for jumping. Includes "Coyote Time" (allowing a jump for a few frames after leaving a ledge) and "Jump Buffering."
2. **Interaction:** Left-click to use tool/weapon toward cursor position; Right-click to place blocks/background walls.
3. **The Underworld:** Procedural cave systems that get progressively harder and darker the deeper the player digs ( coordinate decreases).

---

# Game World: LAYER-1 (Side-View)

## Terrain & Physics Logic

* **The Grid:** A 2D array `World[x][y]`. Each index contains a `TileID`.
* **Dual-Layer Tile System:**
* **Foreground:** Blocks with collision (Dirt, Stone, Ore).
* **Background:** Decorative walls with no collision, preventing enemy spawns.


* **Gravity & Velocity:**
* 
* Terminal velocity cap to prevent clipping through thin floors.


* **Collision Detection:** Check the 4 bounding box corners of the player against the tile grid. If a tile at  is solid, resolve the overlap by pushing the player back.

## Procedural World Generation

* **Surface Contour:** Use **1D Perlin Noise** to create the hills and valleys of the surface.


* **Cave Generation:** Use **Cellular Automata** (Moore Neighborhood).
1. Fill world with random noise ( wall,  empty).
2. Run "Smoothing" passes: If a tile has  neighbors, it becomes a wall; otherwise, it becomes empty.


* **Biomes:** Transition based on  coordinates (e.g.,  Forest,  Desert).

---

# Systems & Mechanics

## 1. Mining & Placement

* **Range Check:** Actions only occur if .
* **Mining Speed:** Tiles have `Health`. Picks reduce health by `ToolPower`.
* **Auto-Step:** The player automatically steps up 1-tile-high blocks to ensure smooth traversal.

## 2. Advanced Tree Logic (Side-View)

* **Structure:** Trees are multi-tile entities. Breaking the bottom "Trunk" tile triggers a recursive "Fell" animation or drops all logs from the connected tiles above.
* **Growth:** Saplings check for "Sky Access" (no foreground tiles above them) before progressing to the next growth stage.

## 3. Combat & AI

* **Slime AI (Basic):** Moves toward player horizontally; jumps if it hits a wall or randomly every  seconds.
* **Flyer AI:** Uses **Steering Behaviors** to hover and swoop at the player's coordinates.
* **Knockback:**  and  are modified away from the damage source upon hit.

---

# Technical Architecture (For Gemini-3.1)

| Module | Responsibility |
| --- | --- |
| **Camera Manager** | Follows player with "Lerp" (Linear Interpolation) for smoothness. Clamps to world bounds. |
| **Tile Map Renderer** | Only draws tiles within the current camera view (Frustum Culling) for performance. |
| **Inventory System** | Hotbar (keys 1-9) + Full Inventory. Supports "Auto-stacking" and "Quick-trash." |
| **Particle Engine** | Handles "Block Break" particles and "Muzzle Flashes" for ranged weapons. |

---

### Implementation Target

* **Gravity Constant:**  units/sec (scaled for pixels).
* **Tile Size:**  or  pixels.
* **Collision Layer:** Separate "Liquid" layer for water/lava physics (using Cellular Automata for flow).

