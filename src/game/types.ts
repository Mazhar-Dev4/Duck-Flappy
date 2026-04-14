export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameScreen = 'home' | 'playing' | 'gameover' | 'levelComplete' | 'settings' | 'leaderboard' | 'rewards';
export type ObstacleType = 'standard' | 'pulse' | 'moving' | 'rotating' | 'bonus' | 'narrow';

export interface DifficultyConfig {
  speed: number;
  gap: number;
  gravity: number;
  flapForce: number;
  spawnInterval: number;
  label: string;
  description: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface LightStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  hue: number;
}

export interface Nebula {
  x: number;
  y: number;
  radius: number;
  hue: number;
  alpha: number;
  speed: number;
}

export interface Planet {
  x: number;
  y: number;
  radius: number;
  hue: number;
  saturation: number;
  ringAngle: number;
  hasRing: boolean;
  speed: number;
}

export interface Obstacle {
  x: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;
  type: ObstacleType;
  phase: number;
  moveAmplitude: number;
  moveSpeed: number;
  entryProgress: number;
}

export interface Duck {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
  flapFrame: number; // 0-2 for 3-frame flap
  flapTimer: number;
  trailPoints: { x: number; y: number; alpha: number }[];
  squash: number; // squash/stretch factor
  sparkles: { x: number; y: number; life: number; size: number }[];
}

export interface GameState {
  duck: Duck;
  obstacles: Obstacle[];
  particles: Particle[];
  stars: Star[];
  lightStreaks: LightStreak[];
  nebulae: Nebula[];
  planets: Planet[];
  score: number;
  bestScore: number;
  streak: number;
  bestStreak: number;
  perfectPasses: number;
  coins: number;
  distance: number;
  frameCount: number;
  shakeAmount: number;
  shakeDecay: number;
  speedMultiplier: number;
  lastObstacleX: number;
  isAlive: boolean;
  hasRevived: boolean;
  slowMotionTimer: number;
  nearMissTimer: number;
  scorePopTimer: number;
  newRecord: boolean;
  level: number;
  levelProgress: number; // gates passed toward current level target
  levelTarget: number;   // gates needed to complete this level
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  difficulty: Difficulty;
  date: string;
  perfectPasses: number;
  streak: number;
  level: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface DuckSkin {
  id: string;
  name: string;
  bodyColor: string;
  beakColor: string;
  eyeColor: string;
  glowColor: string;
  unlockLevel: number;
  description: string;
}

export interface SpaceTheme {
  id: string;
  name: string;
  bg1: string;
  bg2: string;
  nebulaHue: number;
  accentColor: string;
  starColor: string;
  obstacleColor: string;
  obstacleGlow: string;
  unlockLevel: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
  theme: string;
  skin: string;
  quality: 'low' | 'high';
}
