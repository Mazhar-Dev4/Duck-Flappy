import {
  GameState, Drone, Obstacle, Particle, Star, LightStreak, Difficulty, ObstacleType,
} from './types';
import {
  DIFFICULTY_CONFIGS, DRONE_X_POSITION, OBSTACLE_WIDTH, MAX_VELOCITY,
  TRAIL_LENGTH, NEAR_MISS_THRESHOLD, THEMES,
} from './constants';

export function createInitialState(w: number, h: number, bestScore: number): GameState {
  return {
    drone: {
      x: w * DRONE_X_POSITION,
      y: h / 2,
      velocity: 0,
      rotation: 0,
      wingPhase: 0,
      trailPoints: [],
      enginePulse: 0,
    },
    obstacles: [],
    particles: [],
    stars: createStars(w, h),
    lightStreaks: createStreaks(w, h),
    score: 0,
    bestScore,
    streak: 0,
    bestStreak: 0,
    perfectPasses: 0,
    distance: 0,
    frameCount: 0,
    shakeAmount: 0,
    shakeDecay: 0.9,
    speedMultiplier: 1,
    lastObstacleX: w + 200,
    isAlive: true,
    hasRevived: false,
    slowMotionTimer: 0,
    nearMissTimer: 0,
    scorePopTimer: 0,
    newRecord: false,
  };
}

function createStars(w: number, h: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      brightness: Math.random() * 0.6 + 0.2,
    });
  }
  return stars;
}

function createStreaks(w: number, h: number): LightStreak[] {
  const streaks: LightStreak[] = [];
  for (let i = 0; i < 6; i++) {
    streaks.push({
      x: Math.random() * w,
      y: Math.random() * h,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.15 + 0.05,
      hue: Math.random() * 60 + 180,
    });
  }
  return streaks;
}

function pickObstacleType(score: number): ObstacleType {
  if (score < 3) return 'standard';
  const r = Math.random();
  if (r < 0.03) return 'bonus';
  if (score > 15 && r < 0.15) return 'rotating';
  if (score > 10 && r < 0.25) return 'moving';
  if (score > 8 && r < 0.35) return 'narrow';
  if (score > 5 && r < 0.45) return 'pulse';
  return 'standard';
}

export function spawnObstacle(state: GameState, w: number, h: number, difficulty: Difficulty): Obstacle {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const progressScale = 1 + state.score * 0.008;
  let gap = cfg.gap / Math.min(progressScale, 1.5);
  const type = pickObstacleType(state.score);

  if (type === 'bonus') gap *= 1.3;
  if (type === 'narrow') gap *= 0.8;

  const margin = gap / 2 + 40;
  const gapY = margin + Math.random() * (h - margin * 2);

  return {
    x: w + 20,
    gapY,
    gapSize: gap,
    width: OBSTACLE_WIDTH,
    passed: false,
    type,
    phase: Math.random() * Math.PI * 2,
    moveAmplitude: 20 + Math.random() * 30,
    moveSpeed: 0.8 + Math.random() * 0.4,
    entryProgress: 0,
  };
}

export function flap(drone: Drone, difficulty: Difficulty) {
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  drone.velocity = cfg.flapForce;
  drone.wingPhase = 0;
  drone.enginePulse = 1;
}

export function spawnParticles(
  particles: Particle[], x: number, y: number, count: number,
  color: string, speed = 3, size = 3
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const v = Math.random() * speed + 1;
    particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: 30 + Math.random() * 20,
      maxLife: 50,
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
}

export function updateFrame(
  state: GameState, w: number, h: number, difficulty: Difficulty, themeName: string
): FrameResult {
  const result: FrameResult = { scored: false, perfectPass: false, nearMiss: false, bonusGate: false, died: false };
  const cfg = DIFFICULTY_CONFIGS[difficulty];
  const theme = THEMES[themeName as keyof typeof THEMES] || THEMES.cyber;
  const dt = state.slowMotionTimer > 0 ? 0.4 : 1;

  state.frameCount++;
  if (state.slowMotionTimer > 0) state.slowMotionTimer--;

  // Gravity
  state.drone.velocity += cfg.gravity * dt;
  state.drone.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, state.drone.velocity));
  state.drone.y += state.drone.velocity * dt;

  // Rotation
  const targetRot = state.drone.velocity * 0.06;
  state.drone.rotation += (targetRot - state.drone.rotation) * 0.12;

  // Wing animation
  state.drone.wingPhase += 0.2 * dt;
  state.drone.enginePulse *= 0.92;

  // Trail
  state.drone.trailPoints.unshift({ x: state.drone.x, y: state.drone.y, alpha: 1 });
  if (state.drone.trailPoints.length > TRAIL_LENGTH) state.drone.trailPoints.pop();
  for (const tp of state.drone.trailPoints) tp.alpha *= 0.9;

  // Speed progression
  const speed = cfg.speed * state.speedMultiplier * dt;
  state.speedMultiplier = 1 + state.score * 0.005;
  state.distance += speed;

  // Stars
  for (const s of state.stars) {
    s.x -= s.speed * speed * 0.5;
    if (s.x < 0) { s.x = w; s.y = Math.random() * h; }
  }

  // Light streaks
  for (const s of state.lightStreaks) {
    s.x -= s.speed * speed;
    if (s.x + s.length < 0) {
      s.x = w + Math.random() * 100;
      s.y = Math.random() * h;
      s.alpha = Math.random() * 0.15 + 0.05;
    }
  }

  // Spawn obstacles
  state.lastObstacleX -= speed;
  if (state.lastObstacleX < w - cfg.spawnInterval) {
    const obs = spawnObstacle(state, w, h, difficulty);
    state.obstacles.push(obs);
    state.lastObstacleX = w + 20;
  }

  // Update obstacles
  for (const obs of state.obstacles) {
    obs.x -= speed;
    obs.entryProgress = Math.min(obs.entryProgress + 0.04, 1);

    let effectiveGapY = obs.gapY;
    if (obs.type === 'moving') {
      effectiveGapY += Math.sin(state.frameCount * 0.03 * obs.moveSpeed) * obs.moveAmplitude;
    }

    // Scoring
    if (!obs.passed && obs.x + obs.width < state.drone.x) {
      obs.passed = true;
      result.scored = true;
      state.score++;
      state.streak++;
      state.scorePopTimer = 20;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;

      // Check perfect pass (center of gap)
      const distFromCenter = Math.abs(state.drone.y - effectiveGapY);
      if (distFromCenter < obs.gapSize * 0.15) {
        result.perfectPass = true;
        state.perfectPasses++;
        state.score++; // bonus point
        spawnParticles(state.particles, state.drone.x + 30, state.drone.y, 15, '#ffffff', 4, 3);
      }

      if (obs.type === 'bonus') {
        result.bonusGate = true;
        state.score += 2;
        spawnParticles(state.particles, obs.x + obs.width / 2, effectiveGapY, 20, '#00ff88', 5, 4);
      }

      spawnParticles(state.particles, obs.x + obs.width / 2, effectiveGapY, 8, theme.accent1, 3, 2);

      if (state.score > state.bestScore) {
        state.bestScore = state.score;
        state.newRecord = true;
      }
    }

    // Near miss detection
    if (!obs.passed) {
      const dx = state.drone.x - (obs.x + obs.width / 2);
      if (Math.abs(dx) < obs.width) {
        const topDist = state.drone.y - (effectiveGapY - obs.gapSize / 2);
        const botDist = (effectiveGapY + obs.gapSize / 2) - state.drone.y;
        if ((topDist > 0 && topDist < NEAR_MISS_THRESHOLD) || (botDist > 0 && botDist < NEAR_MISS_THRESHOLD)) {
          if (state.nearMissTimer <= 0) {
            result.nearMiss = true;
            state.nearMissTimer = 30;
          }
        }
      }
    }

    // Collision
    if (state.isAlive && !obs.passed) {
      const droneR = 14;
      const dx = state.drone.x;
      const inX = dx + droneR > obs.x && dx - droneR < obs.x + obs.width;
      if (inX) {
        const topH = effectiveGapY - obs.gapSize / 2;
        const botY = effectiveGapY + obs.gapSize / 2;
        if (state.drone.y - droneR < topH || state.drone.y + droneR > botY) {
          state.isAlive = false;
          result.died = true;
          state.shakeAmount = 12;
          state.slowMotionTimer = 30;
          spawnParticles(state.particles, state.drone.x, state.drone.y, 25, theme.accent3, 5, 4);
        }
      }
    }
  }

  // Ceiling/floor collision
  if (state.isAlive && (state.drone.y < 10 || state.drone.y > h - 10)) {
    state.isAlive = false;
    result.died = true;
    state.shakeAmount = 10;
    state.slowMotionTimer = 20;
    spawnParticles(state.particles, state.drone.x, state.drone.y, 20, theme.accent3, 4, 3);
  }

  if (state.nearMissTimer > 0) state.nearMissTimer--;

  // Remove off-screen obstacles
  state.obstacles = state.obstacles.filter(o => o.x + o.width > -50);

  // Update particles
  for (const p of state.particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    p.vy += 0.05;
  }
  state.particles = state.particles.filter(p => p.life > 0);

  // Shake decay
  state.shakeAmount *= state.shakeDecay;
  if (state.shakeAmount < 0.1) state.shakeAmount = 0;

  if (state.scorePopTimer > 0) state.scorePopTimer--;

  return result;
}
