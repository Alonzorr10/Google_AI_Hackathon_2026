Sat Feb 21 11:36:22 JST 2026

# Game Software Design Plan

## Style

1. Style: 2D Survival Adventure
2. Visual Aesthetic: Top-down pixel art with dynamic lighting. Think Core Keeper or Don't Starve. The environment should feel reactive—grass sways when walked upon, and trees cast shadows that grow longer as the day-night cycle progresses.

## Gameplay

1. Core Loop: Scavenge $\rightarrow$ Craft $\rightarrow$ Fortify. Players must manage hunger and temperature while gathering resources to build a base that can withstand nocturnal "Shadow Invasions."
2. Progression: Skill-based unlocking. Performing actions (mining, chopping, cooking) grants experience in that specific field, unlocking more efficient recipes.

---

# Game World

## Terrain Generation

- The Grid: The world is divided into $16 \times 16$ tile chunks to optimize rendering. - Biomes: Generated using a "Moisture vs. Temperature" map. For example:
  - High Moisture + High Temp = Jungle.
  - Low Moisture + Low Temp = Tundra.
- Seeding: Every world has a unique seed string, ensuring players can share specific map layouts.

## Random Tree Generation

- Poisson Disc Sampling: This algorithm ensures trees are distributed naturally—close together in forests but never overlapping in a way that looks like a glitch.
- Growth Stages: Trees exist in four states: Seedling, Sapling, Mature, and Ancient.
- Variations: Each tree type (Oak, Pine, Willow) has a $20\%$ chance to spawn with a "Fruit-bearing" or "Hollow" (storable space) modifier.

---

# Player

## Player Movement (PlayerController Object)

- Input handling: WASD controls

## Player-World Interaction

- The "Context Cursor": The game detects which object is closest to the mouse/reticle.
  - Hovering over a Tree: Shows "Chop" icon (requires Axe).
  - Hovering over Ground: Shows "Dig" or "Plant."
- Durability System: Tools lose health per use. When a tool breaks, it drops "Scrap," allowing for partial resource recovery.
- Inventory: A grid-based system with "Weight" constraints. Carrying too much reduces the player's $Acceleration$ by up to $50\%$.

---

# Items

## Item Categories

Items are classified into distinct categories to organize interactions, rendering, and stats:

- **Tools, Weapons, & Armor** (Equipment)
- **Building Blocks & Decorative Items** (Structures)
- **Redstone & Utility Components** (Mechanics)
- **Food, Consumables, & Potions** (Buffs & Healing)
- **Transportation Items** (Traversal)

## AI Powered Crafting (`CraftingUI` Object)

- **Function:** Serves as the player-facing interface, functioning similarly to a traditional crafting table.
- **Mechanic:** Instead of using fixed crafting grids, the player interacts via a prompt box, inputting exactly what they want to craft in natural language.

## Item Request Analyzer (`Analyzer` Object)

- **Function:** Acts as the validation bridge between the player's input and the item generation.
- **Mechanic:** Analyzes the player's natural language request alongside their current inventory materials. It determines whether the crafting request is logically valid or impossible, communicating failure states if necessary.

## Item Generator (`Generator` Object)

- **Function:** The core procedural generation engine using Nanobanana
- **Mechanic:** Upon a valid request, this object dynamically constructs the requested item. It assigns a unique name, an AI-generated description (flavor text), and functional in-game stats based on the input materials and prompt.

## Caching System (`CacheManager` Object)

- **Function:** Optimizes performance and ensures consistency.
- **Mechanic:** Memorizes every uniquely generated item profile. If a player attempts a functionally identical craft using the same prompt and materials later, the system retrieves and returns the globally cached item instead of generating it again.

---

# Mobs (Mob object)

## Passive Mobs (PassiveMob Object)

1. Each Passive mob is an instance of the PassiveMob object.
2. Passive mobs exhibit these following behaviors:
   - moveRandom(): the passive mob roams picks a direction (left or right) and moves in that direction for a while.
   - followHerd(): the passive mob follows the herd its in and moves along with the other passive mobs of the same type.
3. Generic Passive mob types:
   - sheep
   - cow
   - chicken
4. Generic mobs can be KILLED by the player to drop meat resources. When killed:
   - Passive Mobs drop meat resources.
   - Passive Mobs despawn

## Enemy Mobs (EnemyMob Object)

1. Each enemy mob is an instance of the EnemyMob object.
2. Each enemy mob's decisions are influenced by the **EnemyAI object**.
3. Enemy mobs exhibit these following behaviors:
   - attackPlayer(): enemy mobs will attack the player with whatever weapons (melee or ranged) that they spawn with.
   - followPlayer(): once enemy mobs detect the player, they will follow follow them around trying to attack them.
4. When killed by the player:
   - Enemy mobs drop a number of any resource type.
   - Enemy mobs award some amount of experience to the player.
   - Enemy mobs despawn.

## Adaptive Enemy AI (EnemyAI Object)

1. This object influences the AI and decisions of each enemy mob.
2. How the Enemy AI in the game adapts to the player:
   - The Enemy AI gets worse if the player is struggling and dies often.
   - The Enemy AI gets better and adapts to defeat the player if they are get better and have better equipment.
3. Measuring player fitness and Adaptive AI:
   - The player is doing **WORSE** at the game if they die or restart often or if they have poor equipment and limited resources.
     - Spawn enemy mobs with slightly less health.
     - Decrease enemy weapon damage.
   - The player is doing **GOOD** at the game if they have numerous resources and don't die as often. If the player is defeating enemy mobs easily. Then, the goal becomes:
     - Spawn enemy mobs with more health.
     - Spawn enemy mobs with weapons that do more damage.
     - Spawn enemy mobs with weapons that directly counter those of the player.
       - Example: A shield (defensive) if the player has a bow (ranged), a bow (ranged) if the player has a sword (melee), etc.
