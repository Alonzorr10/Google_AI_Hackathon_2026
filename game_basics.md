# Game Software Design Plan

## Style

1. **Style:** 2D Top-Down Survival Adventure.
2. **Visual Aesthetic:** High-fidelity pixel art with a focus on **Atmospheric Depth**.
* **Dynamic Lighting:** Implement a radial light masking system. Light sources (torches, bioluminescent plants) create a "Safe Zone" that pushes back the darkness.
* **Particle Systems:** Falling leaves in forests, snow drifts in Tundra, and glowing embers during Shadow Invasions.
* **Z-Ordering:** Use a Y-sort algorithm to ensure the player correctly appears behind or in front of objects based on their vertical position.



## Gameplay

1. **Core Loop:** **Survive  Extract  Construct**.
* **The Hunger/Temp Meta:** Hunger depletes over time; low temperature (Night/Tundra) slows movement and eventually drains HP.


2. **Combat:** Real-time, stamina-based combat. Players have a dash-roll with i-frames (invincibility frames).
3. **Shadow Invasions:** Every 3rd night, the "Shadow Meter" fills. Entities spawn with high aggression and the ability to damage player-built structures.

---

# Game World: LAYER-1

## Terrain Generation & Logic

* **The Grid:** World is an infinite (or large-scale bounded) array of `Chunk` objects. Each chunk handles its own tile-data and entity-list.
* **Noise Functions:** Use **Perlin Noise** or **Simplex Noise** to determine elevation and biome density.
* 


* **Tile Interaction:** Each tile is an object with properties: `isWalkable`, `hardness`, `burnable`, and `dropItem`.

## Physics and Collision

* **AABB Collision:** Use Axis-Aligned Bounding Boxes for simple tile-to-player collision.
* **Raycasting:** Used for projectile trajectories and determining "Line of Sight" for enemy AI.
* **Velocity Math:** 


---

# Entity Component System (ECS)

To keep the game performant, Gemini-3.1 should structure the code using an ECS-like architecture:

| Component | Function |
| --- | --- |
| **HealthComponent** | Manages HP, damage mitigation, and death events. |
| **InventoryComponent** | An array of `Slot` objects (Item ID + Quantity). |
| **AIComponent** | State machine logic (Idle, Chase, Attack, Flee). |
| **PhysicsComponent** | Handles gravity (if applicable), velocity, and collision boxes. |

---

# Systems & Mechanics

## 1. Inventory & Crafting

* **Grid System:** A  player inventory.
* **Crafting Logic:** If `Player.Inventory` contains `RequiredItems[]`, enable the `Craft` button.
* **Durability:** Tools lose 1 point of durability per use. At 0, the item object is destroyed.

## 2. Advanced Tree & Resource Logic

* **Poisson Disc Sampling:** Ensures a minimum distance  between trees:


* **Lumber Mechanics:** Trees don't just disappear; they have a "Timber" state where they fall in the direction opposite to the player's last hit, potentially damaging enemies or the player.

## 3. The Shadow AI

* **Pathfinding:** Use the **A* (A-Star) Algorithm** for enemies to navigate around player-built walls.
* **Aggro Radius:** Enemies switch from `Wander` to `Pursue` when .

---

## Technical Constraints for Gemini-3.1

* **Language:** JavaScript (Canvas API) or Python (Pygame).
* **State Management:** Use a centralized `GameState` object to handle transitions between `Menu`, `Playing`, and `GameOver`.
* **Delta Time:** All movement must be multiplied by `dt` to ensure consistent speed regardless of frame rate.
