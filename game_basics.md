

# Game Software Design Plan

## Style

1. Style: 2D Survival Adventure similar too Terraria
2. Visual Aesthetic: Top-down pixel art with dynamic lighting. Think Core Keeper or Don't Starve. The environment should feel reactive—grass sways when walked upon, and trees cast shadows that grow longer as the day-night cycle progresses.

## Gameplay

1. Core Loop: Scavenge $\rightarrow$ Craft $\rightarrow$ Fortify. Players must manage hunger and temperature while gathering resources to build a base that can withstand nocturnal "Shadow Invasions."
2. Progression: Skill-based unlocking. Performing actions (mining, chopping, cooking) grants experience in that specific field, unlocking more efficient recipes.

---

# Game World: LAYER-1

## Terrain Generation

- The Grid: The world is divided into $16 \times 16$ tile chunks to optimize rendering. - Biomes: Generated using a "Moisture vs. Temperature" map. For example:
  - High Moisture + High Temp = Jungle.
  - Low Moisture + Low Temp = Tundra.
- Seeding: Every world has a unique seed string, ensuring players can share specific map layouts.

## Random Tree Generation

- Poisson Disc Sampling: This algorithm ensures trees are distributed naturally—close together in forests but never overlapping in a way that looks like a glitch.
- Growth Stages: Trees exist in four states: Seedling, Sapling, Mature, and Ancient.
- Variations: Each tree type (Oak, Pine, Willow) has a $20\%$ chance to spawn with a "Fruit-bearing" or "Hollow" (storable space) modifier.
