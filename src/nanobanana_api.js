// src/nanobanaana_api.js
// Integration with NanoBanana API for pixel art asset generation

/**
 * NanoBanana API client for generating pixelated PNG game assets
 * Docs: https://nanobananai.com/docs
 */

export class NanoBananaClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.nanobananai.com/v1';
    this.requestCache = new Map();
  }

  /**
   * Generate a pixelated item icon
   * @param {string} prompt - Item description (e.g., "Iron Sword")
   * @param {object} stats - Item stats (damage, defense, type)
   * @returns {Promise<string>} Data URL of generated PNG
   */
  async generateItemIcon(prompt, stats) {
    const cacheKey = `item_${prompt}_${JSON.stringify(stats)}`;

    // Return cached result if available
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }

    if (!this.apiKey) {
      console.warn('NanoBanana API key not provided, using placeholder');
      return this._generatePlaceholder(prompt, stats);
    }

    try {
      // Build detailed prompt for NanoBanana
      const fullPrompt = this._buildPrompt(prompt, stats);

      // Call NanoBanana API
      const response = await fetch(`${this.baseUrl}/imagine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'nano',
          prompt: fullPrompt,
          width: 64,
          height: 64,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          seed: this._seedFromString(prompt),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error ${response.status}: ${error}`);
      }

      const data = await response.json();

      // Convert image to data URL
      if (data.images && data.images.length > 0) {
        const imageUrl = data.images[0]; // NanoBanana returns base64 or URL
        const dataUrl = typeof imageUrl === 'string' && imageUrl.startsWith('http')
          ? await this._fetchAsDataUrl(imageUrl)
          : `data:image/png;base64,${imageUrl}`;

        this.requestCache.set(cacheKey, dataUrl);
        return dataUrl;
      } else {
        throw new Error('No images returned from API');
      }
    } catch (error) {
      console.error('NanoBanana generation failed:', error);
      return this._generatePlaceholder(prompt, stats);
    }
  }

  _buildPrompt(itemName, stats) {
    const typeDescriptions = {
      weapon: 'sharp and threatening',
      armor: 'protective and sturdy',
      tool: 'functional and practical',
      food: 'appetizing and fresh',
      consumable: 'magical and glowing',
    };

    const description = typeDescriptions[stats.type] || 'interesting looking';
    const rarity = stats.rarity || 'common';

    return `Pixel art game item icon, 64x64, ${itemName}. ${description}. ${rarity} rarity. Top-down view. Isometric style. No text. Solid background.`;
  }

  _seedFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async _fetchAsDataUrl(imageUrl) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  _generatePlaceholder(prompt, stats) {
    // Fallback placeholder generator
    const colorMap = {
      weapon: '#ff6b6b',
      armor: '#4ecdc4',
      tool: '#ffe66d',
      food: '#95e1d3',
      consumable: '#c7ceea',
    };

    const color = colorMap[stats.type] || '#b19cd9';
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Pixelated style background
    ctx.fillStyle = color;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(x * 8, y * 8, 8, 8);
        }
      }
    }

    // Border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 60, 60);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(prompt.slice(0, 7), 32, 32);

    return canvas.toDataURL('image/png');
  }
}

/**
 * Asset manager - caches and organizes all generated assets
 */
export class AssetManager {
  constructor(nanoBananaClient) {
    this.client = nanoBananaClient;
    this.assets = new Map();
  }

  async getOrGenerateAsset(itemId, prompt, stats) {
    if (this.assets.has(itemId)) {
      return this.assets.get(itemId);
    }

    const assetUrl = await this.client.generateItemIcon(prompt, stats);
    this.assets.set(itemId, assetUrl);
    return assetUrl;
  }
}
