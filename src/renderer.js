// src/renderer.js
// Terraria-style 2D side-scroller renderer with blocks

import { BlockType } from './terrain.js';

const BLOCK_COLORS = {
  [BlockType.AIR]: '#000000',
  [BlockType.GRASS]: '#2a8a2a',
  [BlockType.DIRT]: '#6b4423',
  [BlockType.STONE]: '#808080',
  [BlockType.SAND]: '#c9b76d',
  [BlockType.WATER]: '#4488ff',
  [BlockType.WOOD]: '#8b6914',
  [BlockType.LEAF]: '#228b22',
};

export class Renderer {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraPanSpeed = 5;
  }

  updateCamera(player) {
    const TILE_SIZE = 16;
    const targetX = player.x - this.canvas.width / 2;
    const targetY = player.y - this.canvas.height / 2;

    // Smooth camera follow
    this.cameraX += (targetX - this.cameraX) * 0.1;
    this.cameraY += (targetY - this.cameraY) * 0.1;

    // Clamp camera to world bounds
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.world.width * TILE_SIZE - this.canvas.width));
    this.cameraY = Math.max(0, Math.min(this.cameraY, this.world.height * TILE_SIZE - this.canvas.height));
  }

  render(player, mobs, deltaTime) {
    const TILE_SIZE = 16;

    // Clear canvas with sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#4facfe'); // Sky blue top
    gradient.addColorStop(1, '#00f2fe'); // Cyan bottom
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render distant mountains/background (optional future)
    this.renderBackgroundElements();

    // Render blocks
    const startX = Math.floor(this.cameraX / TILE_SIZE);
    const startY = Math.floor(this.cameraY / TILE_SIZE);
    const endX = startX + Math.ceil(this.canvas.width / TILE_SIZE) + 1;
    const endY = startY + Math.ceil(this.canvas.height / TILE_SIZE) + 1;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (x >= 0 && x < this.world.width && y >= 0 && y < this.world.height) {
          const blockType = this.world.blocks[y * this.world.width + x];
          const screenX = x * TILE_SIZE - this.cameraX;
          const screenY = y * TILE_SIZE - this.cameraY;

          if (blockType !== BlockType.AIR) {
            // Draw block
            const color = BLOCK_COLORS[blockType] || '#000000';
            this.ctx.fillStyle = color;
            this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

            // Block borders for clarity
            if (blockType !== BlockType.WATER) {
              this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
              this.ctx.lineWidth = 0.5;
              this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }
    }

    // Render cursor highlight
    if (window.mousePos) {
      const worldPos = this.screenToWorld(window.mousePos.x, window.mousePos.y);
      const dist = Math.hypot(worldPos.x * 16 - player.x, worldPos.y * 16 - player.y);

      if (dist < 80) { // Interaction range
        const screenX = Math.floor(worldPos.x) * TILE_SIZE - this.cameraX;
        const screenY = Math.floor(worldPos.y) * TILE_SIZE - this.cameraY;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // Render water with waves
    this.ctx.globalAlpha = 0.6;
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (x >= 0 && x < this.world.width && y >= 0 && y < this.world.height) {
          const blockType = this.world.blocks[y * this.world.width + x];
          if (blockType === BlockType.WATER) {
            const screenX = x * TILE_SIZE - this.cameraX;
            const screenY = y * TILE_SIZE - this.cameraY + Math.sin(x * 0.3 + Date.now() * 0.002) * 2;
            this.ctx.fillStyle = '#4488ff';
            this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
    this.ctx.globalAlpha = 1;

    // Render mobs
    for (const mob of mobs) {
      const screenX = mob.x - this.cameraX;
      const screenY = mob.y - this.cameraY;

      if (screenX > -20 && screenX < this.canvas.width && screenY > -20 && screenY < this.canvas.height) {
        // Draw mob based on type
        this.ctx.fillStyle = mob.type === 'shadow_creature' ? '#111' :
          mob.type === 'goblin' ? '#2e8b57' :
            mob.type === 'sheep' ? '#eee' : '#ffaa44';

        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Health bar
        this.ctx.fillStyle = '#00ff00';
        const healthPercent = mob.health / (mob.maxHealth || 30);
        this.ctx.fillRect(screenX - 6, screenY - 12, 12 * healthPercent, 2);
      }
    }

    // Render player
    const playerScreenX = player.x - this.cameraX;
    const playerScreenY = player.y - this.cameraY;

    // Draw player body (Terraria-ish)
    this.ctx.fillStyle = '#ffccaa';
    this.ctx.fillRect(playerScreenX, playerScreenY, player.width, player.height);

    // Player clothes/hair
    this.ctx.fillStyle = '#3366ff'; // blue shirt
    this.ctx.fillRect(playerScreenX, playerScreenY + 8, player.width, 6);
    this.ctx.fillStyle = '#8b4513'; // hair
    this.ctx.fillRect(playerScreenX - 1, playerScreenY - 6, player.width + 2, 6);

    // Draw eyes
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(playerScreenX + 2, playerScreenY - 3, 2, 2);
    this.ctx.fillRect(playerScreenX + 8, playerScreenY - 3, 2, 2);

    // Render HUD
    this.renderHUD(player);
  }

  renderBackgroundElements() {
    // Parallax background (mountains)
    this.ctx.fillStyle = 'rgba(100, 150, 100, 0.3)';
    for (let i = 0; i < 5; i++) {
      const x = (i * 200 - this.cameraX * 0.2) % (this.canvas.width + 200);
      this.ctx.beginPath();
      this.ctx.moveTo(x - 100, this.canvas.height);
      this.ctx.lineTo(x, this.canvas.height - 150);
      this.ctx.lineTo(x + 100, this.canvas.height);
      this.ctx.fill();
    }
  }

  renderHUD(player) {
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, 250, 150);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    let y = 15;
    const lineHeight = 15;

    const stats = [
      `Level: ${player.level}`,
      `Health: ${Math.round(player.health)}/100`,
      `Hunger: ${Math.round(player.hunger.toFixed(1))}/100`,
      `Equipped: ${player.equippedTool ? player.equippedTool.name : 'None'}`,
      `Exp: ${JSON.stringify(player.experience)}`,
    ];

    for (const stat of stats) {
      this.ctx.fillText(stat, 10, y);
      y += lineHeight;
    }

    // Instructions
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = 'bold 10px monospace';
    this.ctx.fillText('L-Click: Mine | R-Click: Place', 10, y + 10);
    this.ctx.fillText('MUST BE NEAR PLAYER TO INTERACT', 10, y + 25);
  }

  screenToWorld(screenX, screenY) {
    const TILE_SIZE = 16;
    return {
      x: (screenX + this.cameraX) / TILE_SIZE,
      y: (screenY + this.cameraY) / TILE_SIZE
    };
  }

  mineBlock(blocks, worldWidth, worldHeight, cameraX, cameraY, clickX, clickY, damage = 10) {
    const worldPos = this.screenToWorld(clickX, clickY);
    const blockX = Math.floor(worldPos.x);
    const blockY = Math.floor(worldPos.y);

    if (blockX < 0 || blockX >= worldWidth || blockY < 0 || blockY >= worldHeight) {
      return false;
    }

    const idx = blockY * worldWidth + blockX;
    const blockType = blocks[idx];

    if (blockType === 'air' || blockType === 'water') return false;

    blocks[idx] = 'air';
    return true;
  }

  placeBlock(blocks, worldWidth, worldHeight, cameraX, cameraY, clickX, clickY, blockType) {
    const worldPos = this.screenToWorld(clickX, clickY);
    const blockX = Math.floor(worldPos.x);
    const blockY = Math.floor(worldPos.y);

    if (blockX < 0 || blockX >= worldWidth || blockY < 0 || blockY >= worldHeight) {
      return false;
    }

    const idx = blockY * worldWidth + blockX;
    if (blocks[idx] !== 'air') return false;

    blocks[idx] = blockType;
    return true;
  }
}
