import {
  GameState, Duck, Obstacle, Particle, Star, LightStreak, Nebula, Planet, Difficulty, ObstacleType,
} from './types';
import {
  DIFFICULTY_CONFIGS, DUCK_X_POSITION, OBSTACLE_WIDTH, MAX_VELOCITY,
  TRAIL_LENGTH, NEAR_MISS_THRESHOLD, SPACE_THEMES, getLevelTarget,
} from './constants';

export function createInitialState(w: number, h: number, bestScore: number, level = 1): GameState {
  return {
    duck: {
      x: w * DUCK_X_POSITION,
      y: h / 2,
      velocity: 0,
      rotation: 0,
      flapFrame: 1,
      flapTimer: 0,
      trailPoints: [],
      squash: 1,
      sparkles: [],
    },
    obstacles: [],
    particles: [],
    stars: createStars(w, h),
    lightStreaks: createStreaks(w, h),
    nebulae: createNebulae(w, h),
    planets: createPlanets(w, h),
    score: 0,
    bestScore,
    streak: 0,
    bestStreak: 0,
    perfectPasses: 0,
    coins: 0,
    distance: 0,
    frameCount: 0,
    shakeAmount: 0,
    shakeDecay: 0.88,
    speedMultiplier: 1,
    lastObstacleX: w + 300,
    isAlive: true,
    hasRevived: false,
    slowMotionTimer: 0,
    nearMissTimer: 0,
    scorePopTimer: 0,
    newRecord: false,
    level,
    levelProgress: 0,
    levelTarget: getLevelTarget(level),
  };
}

function createStars(w: number, h: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      brightness: Math.random() * 0.7 + 0.2,
    });
  }
  return stars;
}

function createStreaks(w: number, h: number): LightStreak[] {
  const streaks: LightStreak[] = [];
  for (let i = 0; i < 4; i++) {
    streaks.push({
      x: Math.random() * w,
      y: Math.random() * h,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 1 + 0.3,
      alpha: Math.random() * 0.1 + 0.03,
      hue: Math.random() * 60 + 240,
    });
  }
  return streaks;
}

function createNebulae(w: number, h: number): Nebula[] {
  const nebulae: Nebula[] = [];
  for (let i = 0; i < 3; i++) {
    nebulae.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 80 + Math.random() * 120,
      hue: 250 + Math.random() * 80,
      alpha: 0.04 + Math.random() * 0.04,
      speed: 0.05 + Math.random() * 0.1,
    });
  }
  return nebulae;
}

function createPlanets(w: number, h: number): Planet[] {
  const planets: Planet[] = [];
  for (let i = 0; i < 2; i++) {
    planets.push({
      x: w * 0.3 + Math.random() * w * 0.6,
      y: Math.random() * h,
      radius: 15 + Math.random() * 25,
      hue: Math.random() * 360,
      saturation: 40 + Math.random() * 30,
      ringAngle: Math.random() * 0.5,
      hasRing: Math.random() > 0.5,
      speed: 0.02 + Math.random() * 0.03,
    });
  }
  return planets;
}

function pickObstacleType(score: number): ObstacleType {
  if (score < 5) return 'standard';
  const r = Math.random();
  if (r < 0.04) return 'bonus';
  if (score > 20 && r < 0.1) return 'rotating';
  if (score > 15 && r < 0.18) return 'moving';
  if (score > 12 && r < 0.25) return 'narrow';
  if (score > 8 && r < 0.32) return 'pulse';
  return 'standard';
}

export function spawnObstacle(state: GameState, w: number, h: number, difficulty: Difficulty): Obstacle {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  // Very gentle progressive scaling - max 20% harder
  const progressScale = 1 + state.score * 0.004;
  let gap = cfg.gap / Math.min(progressScale, 1.2);
  const type = pickObstacleType(state.score);

  if (type === 'bonus') gap *= 1.4;
  if (type === 'narrow') gap *= 0.85;

  const margin = gap / 2 + 60;
  const gapY = margin + Math.random() * (h - margin * 2);

  return {
    x: w + 20,
    gapY,
    gapSize: gap,
    width: OBSTACLE_WIDTH,
    passed: false,
    type,
    phase: Math.random() * Math.PI * 2,
    moveAmplitude: 15 + Math.random() * 20,
    moveSpeed: 0.6 + Math.random() * 0.3,
    entryProgress: 0,
  };
}

export function flap(duck: Duck, difficulty: Difficulty) {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  duck.velocity = cfg.flapForce;
  duck.flapFrame = 0;
  duck.flapTimer = 0;
  duck.squash = 0.8;
  // Add sparkle
  for (let i = 0; i < 3; i++) {
    duck.sparkles.push({
      x: duck.x - 8 + Math.random() * 6 - 3,
      y: duck.y + Math.random() * 10 - 5,
      life: 15 + Math.random() * 10,
      size: 1.5 + Math.random() * 2,
    });
  }
}

export function spawnParticles(
  particles: Particle[], x: number, y: number, count: number,
  color: string, speed = 3, size = 3
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = Math.random() * speed + 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: 25 + Math.random() * 20,
      maxLife: 45,
      size: Math.random() * size + 1,
      color,
      alpha: 1,
    });
  }
}

export interface FrameResult {
  scored: boolean;
  perfectPass: boolean;
  nearMiss: boolean;
  bonusGate: boolean;
  died: boolean;
  levelCompleted: boolean;
  coinsEarned: number;
}

export function updateFrame(
  state: GameState, w: number, h: number, difficulty: Difficulty, themeName: string
): FrameResult {
  const result: FrameResult = { scored: false, perfectPass: false, nearMiss: false, bonusGate: false, died: false, levelCompleted: false, coinsEarned: 0 };
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const theme = SPACE_THEMES.find(t => t.id === themeName) || SPACE_THEMES[0];
  const dt = state.slowMotionTimer > 0 ? 0.4 : 1;

  state.frameCount++;
  if (state.slowMotionTimer > 0) state.slowMotionTimer--;

  // Gravity
  state.duck.velocity += cfg.gravity * dt;
  state.duck.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, state.duck.velocity));
  state.duck.y += state.duck.velocity * dt;

  // Rotation — gentle tilt
  const targetRot = state.duck.velocity * 0.045;
  state.duck.rotation += (targetRot - state.duck.rotation) * 0.1;

  // Flap animation (3 frames)
  state.duck.flapTimer += dt;
  if (state.duck.flapTimer > 5) {
    state.duck.flapTimer = 0;
    state.duck.flapFrame = Math.min(state.duck.flapFrame + 1, 2);
  }

  // Squash/stretch recovery
  state.duck.squash += (1 - state.duck.squash) * 0.15;

  // Sparkles
  state.duck.sparkles = state.duck.sparkles.filter(s => {
    s.life--;
    s.x -= 1;
    s.y += Math.random() * 0.5 - 0.25;
    return s.life > 0;
  });

  // Trail
  state.duck.trailPoints.unshift({ x: state.duck.x, y: state.duck.y, alpha: 1 });
  if (state.duck.trailPoints.length > TRAIL_LENGTH) state.duck.trailPoints.pop();
  for (const tp of state.duck.trailPoints) tp.alpha *= 0.88;

  // Speed - very gentle progression
  const speed = cfg.speed * state.speedMultiplier * dt;
  state.speedMultiplier = 1 + state.score * 0.003;
  state.distance += speed;

  // Stars
  for (const s of state.stars) {
    s.x -= s.speed * speed * 0.4;
    if (s.x < 0) { s.x = w; s.y = Math.random() * h; }
  }

  // Light streaks
  for (const s of state.lightStreaks) {
    s.x -= s.speed * speed * 0.6;
    if (s.x + s.length < 0) {
      s.x = w + Math.random() * 100;
      s.y = Math.random() * h;
      s.alpha = Math.random() * 0.1 + 0.03;
    }
  }

  // Nebulae
  for (const n of state.nebulae) {
    n.x -= n.speed * speed * 0.2;
    if (n.x + n.radius < -50) {
      n.x = w + n.radius + Math.random() * 100;
      n.y = Math.random() * h;
    }
  }

  // Planets
  for (const p of state.planets) {
    p.x -= p.speed * speed * 0.15;
    if (p.x + p.radius < -50) {
      p.x = w + p.radius + Math.random() * 200;
      p.y = Math.random() * h;
      p.hue = Math.random() * 360;
    }
  }

  // Spawn obstacles — generous spacing
  state.lastObstacleX -= speed;
  if (state.lastObstacleX < w - cfg.spawnInterval) {
    const obs = spawnObstacle(state, w, h, difficulty);
    state.obstacles.push(obs);
    state.lastObstacleX = w + 20;
  }

  // Update obstacles
  for (const obs of state.obstacles) {
    obs.x -= speed;
    obs.entryProgress = Math.min(obs.entryProgress + 0.03, 1);

    let effectiveGapY = obs.gapY;
    if (obs.type === 'moving') {
      effectiveGapY += Math.sin(state.frameCount * 0.02 * obs.moveSpeed) * obs.moveAmplitude;
    }

    // Scoring
    if (!obs.passed && obs.x + obs.width < state.duck.x) {
      obs.passed = true;
      result.scored = true;
      state.score++;
      state.streak++;
      state.levelProgress++;
      state.scorePopTimer = 20;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;

      // Coins for passing gate
      let coinReward = 1;

      // Perfect pass
      const distFromCenter = Math.abs(state.duck.y - effectiveGapY);
      if (distFromCenter < obs.gapSize * 0.18) {
        result.perfectPass = true;
        state.perfectPasses++;
        state.score++;
        coinReward += 2;
        spawnParticles(state.particles, state.duck.x + 20, state.duck.y, 12, '#FFD700', 3, 3);
      }

      if (obs.type === 'bonus') {
        result.bonusGate = true;
        state.score += 2;
        coinReward += 5;
        spawnParticles(state.particles, obs.x + obs.width / 2, effectiveGapY, 15, '#00ff88', 4, 3);
      }

      state.coins += coinReward;
      result.coinsEarned = coinReward;

      spawnParticles(state.particles, obs.x + obs.width / 2, effectiveGapY, 6, theme.accentColor, 2, 2);

      if (state.score > state.bestScore) {
        state.bestScore = state.score;
        state.newRecord = true;
      }

      // Check level completion
      if (state.levelProgress >= state.levelTarget) {
        result.levelCompleted = true;
      }
    }

    // Near miss
    if (!obs.passed) {
      const dx = state.duck.x - (obs.x + obs.width / 2);
      if (Math.abs(dx) < obs.width) {
        const topDist = state.duck.y - (effectiveGapY - obs.gapSize / 2);
        const botDist = (effectiveGapY + obs.gapSize / 2) - state.duck.y;
        if ((topDist > 0 && topDist < NEAR_MISS_THRESHOLD) || (botDist > 0 && botDist < NEAR_MISS_THRESHOLD)) {
          if (state.nearMissTimer <= 0) {
            result.nearMiss = true;
            state.nearMissTimer = 30;
          }
        }
      }
    }

    // Collision — slightly forgiving hitbox
    if (state.isAlive && !obs.passed) {
      const duckR = 12;
      const dx = state.duck.x;
      const inX = dx + duckR > obs.x + 4 && dx - duckR < obs.x + obs.width - 4;
      if (inX) {
        const topH = effectiveGapY - obs.gapSize / 2;
        const botY = effectiveGapY + obs.gapSize / 2;
        if (state.duck.y - duckR < topH + 4 || state.duck.y + duckR > botY - 4) {
          state.isAlive = false;
          result.died = true;
          state.shakeAmount = 8;
          state.slowMotionTimer = 25;
          spawnParticles(state.particles, state.duck.x, state.duck.y, 20, '#FFD700', 4, 3);
        }
      }
    }
  }

  // Ceiling/floor
  if (state.isAlive && (state.duck.y < 12 || state.duck.y > h - 12)) {
    state.isAlive = false;
    result.died = true;
    state.shakeAmount = 6;
    state.slowMotionTimer = 20;
    spawnParticles(state.particles, state.duck.x, state.duck.y, 15, '#FFD700', 3, 2);
  }

  if (state.nearMissTimer > 0) state.nearMissTimer--;

  state.obstacles = state.obstacles.filter(o => o.x + o.width > -50);

  // Particles
  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.vy += 0.03;
  }
  state.particles = state.particles.filter(p => p.life > 0);

  // Shake
  state.shakeAmount *= state.shakeDecay;
  if (state.shakeAmount < 0.1) state.shakeAmount = 0;

  if (state.scorePopTimer > 0) state.scorePopTimer--;

  return result;
}
