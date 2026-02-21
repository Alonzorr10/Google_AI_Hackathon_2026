// src/game.js
// Main game loop and orchestration for Terraria-style game

import { TerrainGenerator, BlockType } from './terrain.js';
import { Player, PlayerController } from './player.js';
import { ItemGenerator, CraftingUI } from './crafting.js';
import { PassiveMob, EnemyMob, EnemyAI, spawnMobs } from './mobs.js';
import { Renderer } from './renderer.js';

export class Game {
  constructor(canvas, nanoBananaApiKey = null) {
    console.log('🎮 Game constructor called');
    this.canvas = canvas;
    this.nanoBananaApiKey = nanoBananaApiKey;
    this.running = false;
  }

  async initialize() {
    console.log('🎮 Initializing game systems...');

    // Set canvas internal resolution to match display size or fixed size
    this.canvas.width = 800;
    this.canvas.height = 600;
    console.log(`📏 Canvas resolution set to ${this.canvas.width}x${this.canvas.height}`);

    // Generate world
    const terrainGen = new TerrainGenerator('default_seed_' + Date.now());
    console.log('🌍 Generating block world...');
    this.world = terrainGen.generateWorld();
    console.log('✓ World generated:', this.world.width, 'x', this.world.height, 'blocks');

    // Initialize player at a safe spot
    const playerX = 100 * 16;
    const playerY = 40 * 16;
    const player = new Player(playerX, playerY);
    this.playerController = new PlayerController(player);
    this.player = player;
    console.log('✓ Player initialized at', Math.round(playerX), Math.round(playerY));

    // Initialize mobs
    this.enemyAI = new EnemyAI(0.5);
    this.mobs = spawnMobs(this.world, this.enemyAI, 10, 5);
    console.log('✓ Mobs spawned:', this.mobs.length);

    // Initialize crafting
    this.itemGenerator = new ItemGenerator(this.nanoBananaApiKey);
    this.craftingUI = new CraftingUI(player, this.itemGenerator);

    // Give starting equipment
    player.addToInventory({ name: 'wood', weight: 0.1, type: 'resource' });
    player.addToInventory({ name: 'stone', weight: 0.1, type: 'resource' });
    const pickaxe = { name: 'Starter Pickaxe', damage: 15, weight: 1.0, type: 'tool', durability: 500 };
    player.addToInventory(pickaxe);
    player.equipItem(player.inventory.indexOf(pickaxe));

    // Initialize renderer
    this.renderer = new Renderer(this.canvas, this.world);

    // Initial camera snap to player
    this.renderer.cameraX = player.x - this.canvas.width / 2;
    this.renderer.cameraY = player.y - this.canvas.height / 2;

    console.log('🚀 Game initialization complete!');
  }

  async start() {
    this.running = true;
    this.gameLoop();
  }

  gameLoop = () => {
    if (!this.running) return;

    try {
      const deltaTime = 0.016; // 60 FPS

      // Update camera
      this.renderer.updateCamera(this.player);

      // Update player
      this.playerController.update(this.world, this.player, deltaTime);

      // Range check for interactions
      const INTERACTION_RANGE = 80;

      // Handle block mining (Left Click)
      if (window.lastClickPos) {
        const worldPos = this.renderer.screenToWorld(window.lastClickPos.x, window.lastClickPos.y);
        const dist = Math.hypot(worldPos.x * 16 - this.player.x, worldPos.y * 16 - this.player.y);

        if (dist < INTERACTION_RANGE) {
          const mined = this.renderer.mineBlock(
            this.world.blocks,
            this.world.width,
            this.world.height,
            this.renderer.cameraX,
            this.renderer.cameraY,
            window.lastClickPos.x,
            window.lastClickPos.y,
            this.player.equippedTool?.damage || 10
          );
          if (mined) {
            this.player.addExperience('mining', 5);
            // Add block to inventory
            const blockX = Math.floor(worldPos.x);
            const blockY = Math.floor(worldPos.y);
            // Re-acquire block type if needed or just use the one from mineBlock's internal logic
            // (Simplified: always add 'dirt' or 'stone' for now based on what was there)
            this.player.addToInventory({ name: 'dirt', weight: 0.1, type: 'resource' });
          }
        }
        window.lastClickPos = null;
      }

      // Handle block placing (Right Click)
      if (window.lastRightClickPos) {
        const worldPos = this.renderer.screenToWorld(window.lastRightClickPos.x, window.lastRightClickPos.y);
        const dist = Math.hypot(worldPos.x * 16 - this.player.x, worldPos.y * 16 - this.player.y);

        if (dist < INTERACTION_RANGE) {
          // Find a resource in inventory to place
          const resourceIdx = this.player.inventory.findIndex(item => item.type === 'resource' && (item.name === 'dirt' || item.name === 'stone' || item.name === 'wood'));

          if (resourceIdx !== -1) {
            const resource = this.player.inventory[resourceIdx];
            const placed = this.renderer.placeBlock(
              this.world.blocks,
              this.world.width,
              this.world.height,
              this.renderer.cameraX,
              this.renderer.cameraY,
              window.lastRightClickPos.x,
              window.lastRightClickPos.y,
              resource.name // use resource name as block type
            );

            if (placed) {
              this.player.removeFromInventory(resourceIdx);
              this.player.addExperience('building', 2);
            }
          }
        }
        window.lastRightClickPos = null;
      }

      // Update mobs (simplified for now)
      for (const mob of this.mobs) {
        if (mob instanceof EnemyMob) {
          mob.update(this.player, deltaTime);
        } else {
          mob.update(deltaTime);
        }
      }

      // Death check
      if (this.player.health <= 0) {
        alert('You died! Game Over.');
        this.running = false;
        return;
      }

      // Render
      this.renderer.render(this.player, this.mobs, deltaTime);

      requestAnimationFrame(this.gameLoop);
    } catch (error) {
      console.error('❌ Game loop error:', error);
      this.running = false;
    }
  };

  async doCraft(prompt) {
    const result = await this.craftingUI.requestCraft(prompt);
    return result;
  }

  stop() {
    this.running = false;
  }
}
