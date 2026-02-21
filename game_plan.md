Sat Feb 21 11:23:34 JST 2026

---
# Layer-1: World Generation and Player Initialization





---
# Layer-2: AI Powered Crafting: Tools, Weapons, Utilities, etc.






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
