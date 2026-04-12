export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameScreen = 'home' | 'playing' | 'gameover' | 'settings' | 'leaderboard';
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

export interface Drone {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
  wingPhase: number;
  trailPoints: { x: number; y: number; alpha: number }[];
  enginePulse: number;
}

export interface GameState {
  drone: Drone;
  obstacles: Obstacle[];
  particles: Particle[];
  stars: Star[];
  lightStreaks: LightStreak[];
  score: number;
  bestScore: number;
  streak: number;
  bestStreak: number;
  perfectPasses: number;
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
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  difficulty: Difficulty;
  date: string;
  perfectPasses: number;
  streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
  theme: 'cyber' | 'neon' | 'void';
  quality: 'low' | 'high';
}
