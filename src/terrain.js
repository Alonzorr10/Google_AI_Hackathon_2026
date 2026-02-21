// src/terrain.js
// Terraria-style block-based terrain generation

import { mulberry32, hashCode } from './utils.js';

export const TILE_SIZE = 16;
export const CHUNK_SIZE = 16;

export const BlockType = {
  AIR: 'air',
  DIRT: 'dirt',
  STONE: 'stone',
  GRASS: 'grass',
  SAND: 'sand',
  WATER: 'water',
  WOOD: 'wood',
  LEAF: 'leaf',
};

export const TreeType = {
  OAK: 'oak',
  PINE: 'pine',
  WILLOW: 'willow',
};

export const TreeStage = {
  SEEDLING: 'seedling',
  SAPLING: 'sapling',
  MATURE: 'mature',
  ANCIENT: 'ancient',
};

export class TerrainGenerator {
  constructor(seed) {
    this.seed = seed;
    this.rng = mulberry32(hashCode(String(seed)));
    this.worldWidth = 256; // blocks width
    this.worldHeight = 128; // blocks height
  }

  generateWorld() {
    const blocks = new Array(this.worldWidth * this.worldHeight);

    // Fill with air first
    for (let i = 0; i < blocks.length; i++) {
      blocks[i] = BlockType.AIR;
    }

    // Generate terrain using perlin-like noise
    const surfaceHeight = 64; // surface level
    for (let x = 0; x < this.worldWidth; x++) {
      // Create height variation
      const heightVariation = Math.sin(x * 0.05) * 8 + Math.cos(x * 0.03) * 5;
      const groundY = Math.floor(surfaceHeight + heightVariation);

      // Fill from ground down with appropriate blocks
      for (let y = groundY; y < this.worldHeight; y++) {
        const idx = y * this.worldWidth + x;
        
        if (y === groundY) {
          blocks[idx] = BlockType.GRASS; // Grass on surface
        } else if (y < groundY + 5) {
          blocks[idx] = BlockType.DIRT; // Dirt layer
        } else {
          blocks[idx] = BlockType.STONE; // Stone below
        }
      }

      // Add some sand and water
      if (groundY > surfaceHeight + 3) {
        const sandY = groundY + 1;
        for (let y = sandY; y < Math.min(sandY + 3, this.worldHeight); y++) {
          blocks[y * this.worldWidth + x] = BlockType.SAND;
        }
      }
    }

    // Add water at a certain level
    const waterLevel = Math.floor(surfaceHeight + 12);
    for (let y = waterLevel; y < this.worldHeight; y++) {
      for (let x = 0; x < this.worldWidth; x++) {
        const idx = y * this.worldWidth + x;
        const block = blocks[idx];
        if (block === BlockType.AIR) {
          blocks[idx] = BlockType.WATER;
        }
      }
    }

    // Generate trees
    this.generateTrees(blocks);

    return {
      blocks,
      width: this.worldWidth,
      height: this.worldHeight,
      tileSize: TILE_SIZE,
    };
  }

  generateTrees(blocks) {
    // Place trees randomly on surface
    for (let x = 20; x < this.worldWidth - 20; x += 30 + Math.random() * 20) {
      // Find surface at this x
      let surfaceY = -1;
      for (let y = 0; y < this.worldHeight; y++) {
        if (blocks[y * this.worldWidth + x] !== BlockType.AIR) {
          surfaceY = y - 1;
          break;
        }
      }

      if (surfaceY > 10 && surfaceY < this.worldHeight - 10) {
        // Build tree trunk (4-6 blocks tall)
        const trunkHeight = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < trunkHeight; i++) {
          const y = surfaceY - i;
          if (y >= 0 && y < this.worldHeight) {
            blocks[y * this.worldWidth + x] = BlockType.WOOD;
          }
        }

        // Build canopy (leaves)
        const canopyStart = surfaceY - trunkHeight;
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = 0; dy <= 3; dy++) {
            const px = x + dx;
            const py = canopyStart - dy;
            if (px >= 0 && px < this.worldWidth && py >= 0 && py < this.worldHeight) {
              if (blocks[py * this.worldWidth + px] === BlockType.AIR) {
                blocks[py * this.worldWidth + px] = BlockType.LEAF;
              }
            }
          }
        }
      }
    }
  }
}
