# NanoBanana API Setup Guide

This game includes full integration with the **NanoBanana API** for generating pixelated PNG item icons on the fly. This guide explains how to set it up.

## 🤖 What is NanoBanana?

NanoBanana is an AI image generation API specifically optimized for creating pixel-art style game assets. It's perfect for procedurally generating unique item icons, sprites, and textures.

**Official Website**: https://nanobananai.com

## 📋 Prerequisites

- [ ] NanoBanana account (free tier available)
- [ ] API key from NanoBanana dashboard
- [ ] Your game already running locally

## 🔧 Setup Steps

### Step 1: Create NanoBanana Account

1. Go to **https://nanobananai.com**
2. Click "Sign Up" or "Get Started"
3. Create account with email/password or OAuth
4. **Verify email** (check inbox)

### Step 2: Get Your API Key

1. Log into NanoBanana dashboard
2. Navigate to **API Keys** or **Settings** > **API**
3. Click **"Create New API Key"** or **"Generate Key"**
4. Copy the key (starts with `sk-` or similar)
5. **Store safely** (don't commit to git!)

Example key format:
```
sk_live_abcdef1234567890abcdef1234567890
```

### Step 3: Add API Key to Game

#### Option A: Hardcode (Development Only)

**File**: `src/game.js` (line ~7)

Find:
```javascript
const game = new Game(canvas, null);
```

Replace with:
```javascript
const game = new Game(canvas, "sk_live_YOUR_API_KEY_HERE");
```

Example:
```javascript
const game = new Game(canvas, "sk_live_abc123def456");
```

#### Option B: Environment Variable (Recommended)

Create a `.env.local` file in project root:
```
VITE_NANOBANANA_API_KEY=sk_live_abc123def456
```

Then in `src/game.js`:
```javascript
const apiKey = import.meta.env.VITE_NANOBANANA_API_KEY || null;
const game = new Game(canvas, apiKey);
```

#### Option C: User Input (Browser Prompt)

Add to `index.html` before game loads:
```javascript
const apiKey = prompt("Enter NanoBanana API Key (or leave blank for placeholders):");
const game = new Game(canvas, apiKey);
```

### Step 4: Test Asset Generation

1. Reload game page
2. Try crafting an item: **"Iron Sword"**
3. Check browser console (F12) for:
   - ✓ "Generating asset via NanoBanana..."
   - ✓ API response logs
   - ✓ Generated image URL

4. Asset should appear in inventory with real PNG icon

## 🎨 Asset Generation Details

### Prompt Construction

When you craft "Iron Sword", the game builds:
```
"Pixel art game item icon, 64x64, Iron Sword. sharp and threatening. uncommon rarity. Top-down view. Isometric style. No text. Solid background."
```

### API Request Format

```javascript
{
  model: "nano",
  prompt: "...",        // Full item description
  width: 64,
  height: 64,
  num_inference_steps: 20,
  guidance_scale: 7.5,
  seed: 12345          // Deterministic per-item
}
```

### Response (Example)

```json
{
  "images": [
    "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAA..."
  ],
  "status": "success"
}
```

Returns **base64-encoded PNG** or **HTTPS URL**

## 💡 Usage Tips

### Caching

The game automatically caches generated items by:
- **Item name** + **material combination**

So crafting "Wooden Sword" twice costs 1 API call total!

```javascript
const cacheKey = "Wooden Sword:wood|wood";
// Second craft retrieves from cache, no API call
```

### Cost Estimation

**NanoBanana Pricing** (as of 2026):
- Free tier: 100 images/month
- Paid tier: $0.01/image (approximate)

**Example Usage**:
- 20 unique recipes per playthrough
- 5 playthroughs = 100 images (free tier limit)
- Or $1-2 for unlimited testing

### Image Size

Assets are generated at **64×64 pixels**:
- Small enough for inventory UI
- Large enough for detail
- Scales well in grid layouts

## 🔍 Troubleshooting

### "NanoBanana API error: 401"

**Cause**: Invalid or expired API key

**Solution**:
```javascript
// Check key format
console.log(apiKey.startsWith('sk_'));

// Regenerate key in NanoBanana dashboard
// Add new key to game
```

### "No images returned from API"

**Cause**: API response format issue or model overloaded

**Fallback Active**: Game automatically uses placeholder SVG generator
- See colorful squares with item name
- Works offline, no API needed

### "Rate limit exceeded"

**Cause**: Too many API calls in short time

**Solution**:
- Increase cooldown between crafts
- Caching should prevent duplicate calls
- Check free tier limits

## 📊 Monitoring API Usage

### In Browser Console

Add logging to `src/nanobanana_api.js`:

```javascript
async generateItemIcon(prompt, stats) {
  console.log(`🎨 Requesting: ${prompt}`);
  console.time(`Asset: ${prompt}`);
  
  const url = await this.client.generateItemIcon(prompt, stats);
  
  console.timeEnd(`Asset: ${prompt}`);
  console.log(`✓ Generated: ${url.slice(0, 50)}...`);
}
```

### API Dashboard

Visit https://dashboard.nanobananai.com to see:
- Images generated today
- Failed requests
- API usage history
- Billing info

## 🔒 Security Best Practices

### Don't Commit API Keys!

1. Add to `.gitignore`:
```
.env.local
.env
*.key
```

2. Use environment variables in CI/CD:
```bash
export VITE_NANOBANANA_API_KEY="sk_live_..."
npm run build
```

3. Rotate keys periodically:
   - Delete old key in dashboard
   - Generate new one
   - Update in deployment

## 🌐 Making API Calls from Backend (Future)

For production, consider proxying API calls through your own backend:

```javascript
// Instead of direct fetch to NanoBanana
const response = await fetch('https://your-server.com/api/generate-asset', {
  method: 'POST',
  body: JSON.stringify({ prompt, stats })
});
// Your backend calls NanoBanana with hidden API key
```

Benefits:
- ✓ Keep API key secret
- ✓ Rate limiting
- ✓ Caching across users
- ✓ Cost control

## 📚 Additional Resources

| Resource | Link |
|----------|------|
| **NanoBanana Docs** | https://nanobananai.com/docs |
| **API Reference** | https://nanobananai.com/api-docs |
| **Community Discord** | https://discord.gg/nanobananai |
| **GitHub Issues** | https://github.com/nanobananai/issues |

## ✨ Example: Custom Asset Generation

To generate custom assets without crafting:

```javascript
// In browser console:
const client = new NanoBananaClient("sk_live_...");

// Generate goblin enemy sprite
const goblinUrl = await client.generateItemIcon("Goblin Enemy Sprite", {
  type: "enemy",
  damage: 10,
  rarity: "common"
});

console.log("Goblin sprite:", goblinUrl);
```

## 🎯 Next Steps

1. ✓ Set up NanoBanana account
2. ✓ Get API key
3. ✓ Add to `src/game.js`
4. ✓ Craft an item to test
5. ✓ Watch real PNG assets generate!

---

**Questions?** Check NanoBanana documentation or GitHub issues.

**Happy asset generating!** 🎨
