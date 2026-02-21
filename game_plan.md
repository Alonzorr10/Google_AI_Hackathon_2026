Sat Feb 21 11:23:34 JST 2026

---
# Layer-1: World Generation and Player Initialization
### 1. World Generation
    - World will be generated using FFT
    - Random Generated Seed will be implemented to ensure varying world generation
    - Structures should also generate randomly as well
### 2. Player Intialization
    - Player will be intialized with the following abilities
        - Movement
        - Attack
        - Heal
    - Player will also be able to interact with the given world that's generated

---
# Layer-2: AI-Powered Crafting System (Tools, Weapons, Utilities)

### 1. Player Interface & Intent (Client-Side Crafting)
* **Crafting Table UI**: An interactive interface where players initiate the crafting process.
* **Prompt-Based Input**: Players use natural language (powered by the Gemini API) to describe what they want to craft based on their intent.
* **Inventory Integration**: The system registers the raw materials the player currently holds to use in the craft.

### 2. Game Logic & Validation (AI Analysis)
* **Context Verification**: The AI evaluates the player's crafting prompt against their available materials.
* **Failure State (Missing Materials)**: If the player lacks the logical materials for their requested item, the AI dynamically determines and communicates exactly what they still need to find.
* **Success State (Crafting Approved)**: If the materials and prompt align, the AI approves the request and defines the item outcome.

### 3. Procedural Item Engine ("Nanobanana" Generator)
* **Item Generation**: Dynamically constructs the functional in-game item (stats, durability, effects).
* **Smart Classification**: Automatically categorizes the generated item into the correct equipment slot or type (e.g., Sword, Pickaxe, Consumable).
* **Flavor Text**: Generates a rich, thematic item description based on the materials used and the player's original prompt.
* **Item Caching**: Saves the newly generated unique item profile. If another player attempts a functionally identical craft later, the system retrieves it from the cache to optimize performance and maintain consistency.
--- 
# Layer-3: Adaptive Enemy AI: Passive Mobs, Aggressive Enemy Mobs, etc.

## Passive Mobs
1. The game has passive mobs from which the player can get food resources from.
2. The list of behaviors these passive mobs exhibit are:
    - Walking around randomly
    - Moving in a crowd
3. Starting Passive mobs that should be included:
    - Sheep
    - Cows
    - Chickens
4. Each of these passive mobs drop the "Meat" resource which the player can use to craft food.

## Agressive Mobs
1. The game has aggressive enemy mobs that attack the player.
2. **ATTACKS**: These enemies can have melee and ranged weapons with which they attack the player. 
    - The enemies attack the player when they are close to the player.
3. These enemies are randomly generated, and meet the player at random times during the night.
4. These enemies have adaptive enemy AI that adapts to how the player is playing the game: More about this in the "Adaptive Enemy AI" section.

### Adaptive Enemy AI:
1. The enemies get better as the player gets better, has more resources, gets access to better tools, and as they play the game longer.
2. The enemies can also get worse if the player is struggling while playing and dies often.
