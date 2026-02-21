// src/mobs.js
// Mob system: passive and enemy mobs with adaptive behavior

import { distance, seededRandom } from './utils.js';

export class PassiveMob {
  constructor(id, x, y, type) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type; // 'sheep', 'cow', 'chicken'
    this.vx = 0;
    this.vy = 0;
    this.speed = 1.5;
    this.health = 30;
    this.wanderTime = 0;
    this.wanderDirection = Math.random() * Math.PI * 2;
    this.herdMembers = [];
  }

  moveRandom() {
    this.wanderTime--;
    if (this.wanderTime <= 0) {
      this.wanderDirection = Math.random() * Math.PI * 2;
      this.wanderTime = 60 + Math.random() * 60;
    }
    this.vx = Math.cos(this.wanderDirection) * this.speed;
    this.vy = Math.sin(this.wanderDirection) * this.speed;
  }

  followHerd() {
    if (this.herdMembers.length === 0) {
      this.moveRandom();
      return;
    }

    // Average position of herd
    let avgX = this.x, avgY = this.y;
    for (const member of this.herdMembers) {
      avgX += member.x;
      avgY += member.y;
    }
    avgX /= (this.herdMembers.length + 1);
    avgY /= (this.herdMembers.length + 1);

    const dx = avgX - this.x;
    const dy = avgY - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 10) {
      this.vx = (dx / d) * this.speed;
      this.vy = (dy / d) * this.speed;
    } else {
      this.moveRandom();
    }
  }

  update(deltaTime = 0.016) {
    this.followHerd();
    this.x += this.vx * deltaTime * 60;
    this.y += this.vy * deltaTime * 60;
    this.x = Math.max(0, Math.min(512 * 16, this.x));
    this.y = Math.max(0, Math.min(512 * 16, this.y));
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  drop() {
    const drops = { meat: 1 + Math.floor(Math.random() * 2) };
    return drops;
  }
}

export class EnemyMob {
  constructor(id, x, y, type, enemyAI) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type; // 'goblin', 'orc', 'shadow_creature', etc.
    this.vx = 0;
    this.vy = 0;
    this.speed = 2;
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 10;
    this.range = 50; // detection range
    this.sightRange = 120;
    this.weapon = { name: 'sword', damage: 10 };
    this.enemyAI = enemyAI;
    this.state = 'idle'; // idle, following, attacking
    this.target = null;
    this.lastAttackTime = 0;
    this.attackCooldown = 30; // frames
  }

  attackPlayer() {
    const now = Date.now();
    if (now - this.lastAttackTime > this.attackCooldown * 16) {
      this.lastAttackTime = now;
      return this.weapon.damage;
    }
    return 0;
  }

  followPlayer(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    if (d > 5) {
      this.vx = (dx / d) * this.speed;
      this.vy = (dy / d) * this.speed;
      this.state = 'following';
    }
  }

  update(player, deltaTime = 0.016) {
    const d = distance(this.x, this.y, player.x, player.y);

    // Decide action via AI
    const action = this.enemyAI.decideAction(this, player);

    if (action === 'attack' && d < this.sightRange) {
      this.followPlayer(player);
      this.state = 'attacking';
    } else if (action === 'retreat') {
      // Move away
      const dx = this.x - player.x;
      const dy = this.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        this.vx = (dx / dist) * this.speed * 0.7;
        this.vy = (dy / dist) * this.speed * 0.7;
      }
      this.state = 'idle';
    } else {
      this.vx *= 0.9;
      this.vy *= 0.9;
      this.state = 'idle';
    }

    this.x += this.vx * deltaTime * 60;
    this.y += this.vy * deltaTime * 60;
    this.x = Math.max(0, Math.min(512 * 16, this.x));
    this.y = Math.max(0, Math.min(512 * 16, this.y));
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  drop() {
    const drops = { scrap: 1 + Math.floor(Math.random() * 3) };
    return drops;
  }
}

export class EnemyAI {
  constructor(baseAggression = 0.5) {
    this.baseAggression = baseAggression;
    this.adaptation = 0;
    this.playerStats = { deathRate: 0, gearQuality: 0, combatSkill: 0 };
  }

  analyzePlayerFitness(player) {
    // Assess if player is doing well or struggling
    const inventoryScore = Math.min(1, player.carrying / player.maxCarry);
    const healthScore = player.health / 100;
    const levelScore = player.level / 20;

    // Combine into fitness metric
    const fitness = (inventoryScore * 0.4 + healthScore * 0.4 + levelScore * 0.2);
    return fitness;
  }

  decideAction(mob, player) {
    const fitness = this.analyzePlayerFitness(player);
    const distance = Math.hypot(player.x - mob.x, player.y - mob.y);

    // Adapt aggression based on player fitness
    let aggression = this.baseAggression + (1 - fitness) * 0.3; // less aggressive if player strong
    aggression = Math.max(0, Math.min(1, aggression));

    // Action decision tree
    if (distance < mob.range) {
      if (fitness > 0.7) {
        // Player is strong, attack more aggressively
        return aggression > 0.4 ? 'attack' : 'retreat';
      } else if (fitness < 0.3) {
        // Player is weak, definitely attack
        return 'attack';
      } else {
        // Medium: decide based on aggression
        return aggression > 0.5 ? 'attack' : 'idle';
      }
    }

    return 'idle';
  }

  adaptAfterEncounter(mob, player, result) {
    // result: { won: bool, damageTaken: number }
    if (result.won) {
      this.baseAggression = Math.min(1, this.baseAggression + 0.1);
      mob.maxHealth += 5;
      mob.health = mob.maxHealth;
      mob.damage += 2;
    } else {
      this.baseAggression = Math.max(0.2, this.baseAggression - 0.15);
    }
  }
}

export function spawnMobs(world, enemyAI, passiveCount = 10, enemyCount = 5) {
  const { blocks, width, height } = world;
  const mobs = [];

  // Spawn passive mobs on solid ground
  for (let i = 0; i < passiveCount; i++) {
    let x, y, valid = false;
    
    // Find ground to spawn on
    for (let attempts = 0; attempts < 20; attempts++) {
      const bx = Math.floor(Math.random() * (width - 10)) + 5;
      const by = Math.floor(Math.random() * (height - 20)) + 10;
      
      // Check if there's solid block below
      const blockBelow = blocks[by * width + bx];
      if (blockBelow && blockBelow !== 'air' && blockBelow !== 'water') {
        x = bx * 16 + 8;
        y = by * 16;
        valid = true;
        break;
      }
    }

    if (valid) {
      const types = ['sheep', 'cow', 'chicken'];
      const mob = new PassiveMob(`passive_${i}`, x, y, types[Math.floor(Math.random() * types.length)]);
      mobs.push(mob);
    }
  }

  // Spawn enemy mobs
  for (let i = 0; i < enemyCount; i++) {
    let x, y, valid = false;
    
    for (let attempts = 0; attempts < 20; attempts++) {
      const bx = Math.floor(Math.random() * (width - 10)) + 5;
      const by = Math.floor(Math.random() * (height - 20)) + 10;
      
      const blockBelow = blocks[by * width + bx];
      if (blockBelow && blockBelow !== 'air' && blockBelow !== 'water') {
        x = bx * 16 + 8;
        y = by * 16;
        valid = true;
        break;
      }
    }

    if (valid) {
      const types = ['goblin', 'orc', 'shadow_creature'];
      const mob = new EnemyMob(`enemy_${i}`, x, y, types[Math.floor(Math.random() * types.length)], enemyAI);
      mobs.push(mob);
    }
  }

  return mobs;
}
