// src/player.js
// Player character with gravity and platformer mechanics

import { TILE_SIZE } from './terrain.js';
import { clamp, distance } from './utils.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 12; // pixels
    this.height = 20; // pixels
    this.vx = 0; // velocity
    this.vy = 0; // vertical velocity
    this.speed = 3; // horizontal speed
    this.jumpForce = 8; // jump strength
    this.gravity = 0.3;
    this.isJumping = false;
    this.isOnGround = false;

    this.inventory = [];
    this.carrying = 0;
    this.maxCarry = 100;
    this.equippedWeapon = null;
    this.equippedTool = null;
    this.health = 100;
    this.hunger = 100;
    this.temperature = 37;
    this.experience = {};
    this.level = 1;
  }

  update(inputState, blocks, worldWidth, worldHeight, deltaTime = 0.016) {
    const TILE = 16;

    // Handle horizontal movement
    let targetVx = 0;
    if (inputState.left) targetVx -= this.speed;
    if (inputState.right) targetVx += this.speed;
    this.vx = targetVx;

    // Apply gravity
    this.vy += this.gravity;
    if (this.vy > 10) this.vy = 10;

    // Jump
    if (inputState.up && this.isOnGround) {
      this.vy = -this.jumpForce;
      this.isOnGround = false;
    }

    // Collision detection and response handles movement
    this.resolveSidedCollisions(blocks, worldWidth, worldHeight);

    // World bounds
    this.x = clamp(this.x, 0, worldWidth * TILE - this.width);

    // Death by falling off world
    if (this.y > worldHeight * TILE) {
      this.health = 0;
      this.y = 0; // Reset for safety
    }

    // Update hunger
    this.hunger = Math.max(0, this.hunger - 0.001);
  }

  checkCollision(blocks, worldWidth, offsetX, offsetY) {
    const TILE = 16;
    const x = Math.floor((this.x + offsetX) / TILE);
    const y = Math.floor((this.y + this.height + offsetY) / TILE);

    if (x < 0 || x >= worldWidth || y < 0) return false;
    const idx = y * worldWidth + x;
    if (idx >= blocks.length) return false;

    const blockBelow = blocks[idx];
    return blockBelow !== 'air' && blockBelow !== 'water';
  }

  resolveSidedCollisions(blocks, worldWidth, worldHeight) {
    const TILE = 16;

    // Horizontal Move & Resolve
    this.x += this.vx;
    for (let checkY = this.y + 2; checkY < this.y + this.height - 2; checkY += 8) {
      const tx = Math.floor((this.vx > 0 ? this.x + this.width : this.x) / TILE);
      const ty = Math.floor(checkY / TILE);
      if (tx >= 0 && tx < worldWidth && ty >= 0 && ty < worldHeight) {
        const idx = ty * worldWidth + tx;
        if (blocks[idx] !== 'air' && blocks[idx] !== 'water') {
          if (this.vx > 0) this.x = tx * TILE - this.width;
          else if (this.vx < 0) this.x = (tx + 1) * TILE;
          this.vx = 0;
          break;
        }
      }
    }

    // Vertical Move & Resolve
    this.isOnGround = false;
    this.y += this.vy;
    for (let checkX = this.x + 2; checkX < this.x + this.width - 2; checkX += 6) {
      const tx = Math.floor(checkX / TILE);
      const ty = Math.floor((this.vy > 0 ? this.y + this.height : this.y) / TILE);
      if (tx >= 0 && tx < worldWidth && ty >= 0 && ty < worldHeight) {
        const idx = ty * worldWidth + tx;
        if (blocks[idx] !== 'air' && blocks[idx] !== 'water') {
          if (this.vy > 0) {
            this.y = ty * TILE - this.height;
            this.isOnGround = true;
            this.vy = 0;
          } else if (this.vy < 0) {
            this.y = (ty + 1) * TILE;
            this.vy = 0;
          }
          break;
        }
      }
    }
  }

  addToInventory(item) {
    const weight = item.weight || 1;
    if (this.carrying + weight <= this.maxCarry) {
      this.inventory.push(item);
      this.carrying += weight;
      return true;
    }
    return false;
  }

  removeFromInventory(index) {
    if (index >= 0 && index < this.inventory.length) {
      const item = this.inventory[index];
      this.carrying -= item.weight || 1;
      this.inventory.splice(index, 1);
      return item;
    }
    return null;
  }

  equipItem(index) {
    if (index >= 0 && index < this.inventory.length) {
      const item = this.inventory[index];
      if (item.damage) {
        this.equippedWeapon = item;
        this.equippedTool = item;
      }
      return item;
    }
    return null;
  }

  useEquippedItem() {
    const item = this.equippedWeapon || this.equippedTool;
    if (!item) return null;
    return { damage: item.damage || 10, item };
  }

  addExperience(skill, amount) {
    if (!this.experience[skill]) this.experience[skill] = 0;
    this.experience[skill] += amount;
  }
}

export class PlayerController {
  constructor(player) {
    this.player = player;
    this.inputState = { left: false, right: false, up: false, down: false };
    this.mouseX = 0;
    this.mouseY = 0;
    this.setupInput();
  }

  setupInput() {
    // Keyboard input for movement
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') this.inputState.left = true;
      if (key === 'd' || key === 'arrowright') this.inputState.right = true;
      if (key === 'w' || key === ' ' || key === 'arrowup') {
        this.inputState.up = true;
        e.preventDefault();
      }
      if (key === 's' || key === 'arrowdown') this.inputState.down = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') this.inputState.left = false;
      if (key === 'd' || key === 'arrowright') this.inputState.right = false;
      if (key === 'w' || key === ' ' || key === 'arrowup') this.inputState.up = false;
      if (key === 's' || key === 'arrowdown') this.inputState.down = false;
    });

    // Mouse tracking for mining and placing
    window.addEventListener('mousemove', (e) => {
      const canvas = document.getElementById('gameCanvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      window.mousePos = { x: this.mouseX, y: this.mouseY };
    });

    // Left click to mine blocks
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this.tryAction(e, 'mine');
      } else if (e.button === 2) { // Right click
        this.tryAction(e, 'place');
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  tryAction(event, type) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // Get click position relative to canvas
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (type === 'mine') {
      window.lastClickPos = { x: clickX, y: clickY };
    } else {
      window.lastRightClickPos = { x: clickX, y: clickY };
    }
  }

  update(world, player, deltaTime) {
    player.update(this.inputState, world.blocks, world.width, world.height, deltaTime);
  }
}
