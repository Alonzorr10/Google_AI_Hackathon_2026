// src/crafting.js
// AI-powered crafting system using NanoBanana for asset generation

import { seededRandom } from './utils.js';
import { NanoBananaClient, AssetManager } from './nanobanana_api.js';

export class ItemGenerator {
  constructor(nanoBananaApiKey) {
    this.apiKey = nanoBananaApiKey;
    this.cache = new Map(); // CacheManager
    this.nanoBananaClient = new NanoBananaClient(nanoBananaApiKey);
    this.assetManager = new AssetManager(this.nanoBananaClient);
  }

  async generateItem(prompt, materials) {
    const cacheKey = this._getCacheKey(prompt, materials);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Analyze request
    const isValid = ItemAnalyzer.validate(prompt, materials);
    if (!isValid.valid) {
      throw new Error(isValid.reason);
    }

    // Generate stats based on materials and prompt
    const baseStats = this._calculateStats(materials, prompt);

    // Generate unique ID
    const itemId = Math.random().toString(36).substr(2, 9);

    // Get asset from NanoBanana via AssetManager
    const assetUrl = await this.assetManager.getOrGenerateAsset(itemId, prompt, baseStats);

    // Create item object
    const item = {
      id: itemId,
      name: prompt,
      description: `Crafted from ${materials.map((m) => m.name).join(', ')}`,
      type: baseStats.type,
      damage: baseStats.damage,
      defense: baseStats.defense,
      durability: baseStats.durability,
      rarity: baseStats.rarity,
      weight: baseStats.weight,
      assetUrl,
      materials,
    };

    // Cache it
    this.cache.set(cacheKey, item);
    return item;
  }

  _getCacheKey(prompt, materials) {
    const matString = materials.map((m) => m.name).sort().join('|');
    return `${prompt}:${matString}`;
  }

  _calculateStats(materials, prompt) {
    // Aggregate stats from materials
    let damage = 0, defense = 0, durability = 0;
    for (const mat of materials) {
      damage += mat.damage || 0;
      defense += mat.defense || 0;
      durability += mat.durability || 0;
    }

    // Determine type from prompt
    const promptLower = prompt.toLowerCase();
    let type = 'tool';
    let baseDamage = 5; // default base damage
    
    if (promptLower.includes('sword') || promptLower.includes('blade')) {
      type = 'weapon';
      baseDamage = 15;
    } else if (promptLower.includes('axe') || promptLower.includes('hatchet')) {
      type = 'tool';
      baseDamage = 12;
    } else if (promptLower.includes('pick') || promptLower.includes('pickaxe')) {
      type = 'tool';
      baseDamage = 10;
    } else if (promptLower.includes('hammer') || promptLower.includes('mallet')) {
      type = 'tool';
      baseDamage = 14;
    } else if (promptLower.includes('shield') || promptLower.includes('armor')) {
      type = 'armor';
      defense = 10;
      baseDamage = 0;
    } else if (promptLower.includes('food') || promptLower.includes('meal')) {
      type = 'food';
      baseDamage = 0;
    } else if (promptLower.includes('potion')) {
      type = 'consumable';
      baseDamage = 0;
    }

    // Base stats
    const rarity = materials.length > 2 ? 'rare' : materials.length > 1 ? 'uncommon' : 'common';
    const weight = Math.max(1, materials.length * 0.5);

    return {
      type,
      damage: Math.max(baseDamage, Math.round(damage * 1.5)),
      defense: Math.max(defense, Math.round(defense * 1.2)),
      durability: Math.max(100, Math.round(durability * 80)),
      rarity,
      weight,
    };
  }
}

export class ItemAnalyzer {
  static validate(prompt, materials) {
    // Simple validation: check if craft makes sense
    if (!prompt || prompt.length < 2) {
      return { valid: false, reason: 'Invalid item name' };
    }

    if (!Array.isArray(materials) || materials.length === 0) {
      return { valid: false, reason: 'Need at least one material' };
    }

    // Could add more sophisticated NLP validation here
    return { valid: true };
  }
}

export class CraftingUI {
  constructor(player, itemGenerator) {
    this.player = player;
    this.itemGenerator = itemGenerator;
    this.craftingPrompt = null;
  }

  async requestCraft(promptText) {
    try {
      // Use materials from inventory
      const materials = this.player.inventory.filter((item) => item.type === 'resource');

      if (materials.length === 0) {
        throw new Error('No materials in inventory');
      }

      // Generate the item
      const item = await this.itemGenerator.generateItem(promptText, materials);

      // Add to inventory
      if (this.player.addToInventory(item)) {
        // Remove material from inventory
        for (let i = 0; i < materials.length; i++) {
          this.player.removeFromInventory(this.player.inventory.indexOf(materials[i]));
        }
        return { success: true, item };
      } else {
        return { success: false, reason: 'Inventory full' };
      }
    } catch (e) {
      return { success: false, reason: e.message };
    }
  }
}
