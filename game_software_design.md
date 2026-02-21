
Sat Feb 21 11:36:22 JST 2026

# Game Software Design Plan

## Style 
1. Style: 2D Survival Adventure
2. 


## Gameplay
1. 


---
# Game World

## Terrain Generation


## Random Tree Generation 



---
# Player

## Player Movement (PlayerController Object)


## Player-World Interaction




---
# Items

## Item Categories


## AI Powered Crafting (Crafting Object)


## Item Request Analayzer (Analyer Object)


## Item Generator (Generator Object)


## Caching


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
