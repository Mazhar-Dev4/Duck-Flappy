import { DifficultyConfig, Achievement } from './types';

export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    speed: 2.2,
    gap: 180,
    gravity: 0.35,
    flapForce: -6.5,
    spawnInterval: 220,
    label: 'Easy',
    description: 'Relaxed pace, wider gates',
  },
  medium: {
    speed: 3.2,
    gap: 150,
    gravity: 0.45,
    flapForce: -7,
    spawnInterval: 180,
    label: 'Medium',
    description: 'Balanced challenge',
  },
  hard: {
    speed: 4.2,
    gap: 120,
    gravity: 0.55,
    flapForce: -7.5,
    spawnInterval: 150,
    label: 'Hard',
    description: 'Extreme precision required',
  },
};

export const DRONE_SIZE = 24;
export const DRONE_X_POSITION = 0.2; // percentage of canvas width
export const OBSTACLE_WIDTH = 55;
export const MAX_VELOCITY = 10;
export const TRAIL_LENGTH = 12;
export const NEAR_MISS_THRESHOLD = 18;

export const THEMES = {
  cyber: {
    bg1: '#0a0a1a',
    bg2: '#0d0d2b',
    accent1: '#00e5ff',
    accent2: '#7c4dff',
    accent3: '#ff00e5',
    accent4: '#00ff88',
    drone: '#00e5ff',
    droneGlow: '#00e5ff',
    obstacle: '#7c4dff',
    obstacleGlow: '#b388ff',
    text: '#e0e0ff',
    textDim: '#6060a0',
  },
  neon: {
    bg1: '#0a0014',
    bg2: '#140028',
    accent1: '#ff00ff',
    accent2: '#00ffff',
    accent3: '#ffff00',
    accent4: '#ff6600',
    drone: '#ff00ff',
    droneGlow: '#ff66ff',
    obstacle: '#00ffff',
    obstacleGlow: '#66ffff',
    text: '#ffe0ff',
    textDim: '#a060a0',
  },
  void: {
    bg1: '#000008',
    bg2: '#000818',
    accent1: '#4488ff',
    accent2: '#0044aa',
    accent3: '#88ccff',
    accent4: '#002266',
    drone: '#4488ff',
    droneGlow: '#6699ff',
    obstacle: '#3366cc',
    obstacleGlow: '#5588dd',
    text: '#c0d8ff',
    textDim: '#405880',
  },
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flight', title: 'First Flight', description: 'Pass your first gate', icon: '🚀', unlocked: false },
  { id: 'score_10', title: 'Getting Started', description: 'Score 10 points', icon: '⭐', unlocked: false },
  { id: 'score_25', title: 'Skilled Pilot', description: 'Score 25 points', icon: '🌟', unlocked: false },
  { id: 'score_50', title: 'Ace Pilot', description: 'Score 50 points', icon: '💫', unlocked: false },
  { id: 'score_100', title: 'Neon Legend', description: 'Score 100 points', icon: '👑', unlocked: false },
  { id: 'perfect_10', title: 'Precision', description: '10 perfect passes', icon: '🎯', unlocked: false },
  { id: 'streak_5', title: 'On Fire', description: '5x streak', icon: '🔥', unlocked: false },
  { id: 'streak_10', title: 'Unstoppable', description: '10x streak', icon: '⚡', unlocked: false },
  { id: 'hard_10', title: 'Hard Mode Survivor', description: 'Score 10 on Hard', icon: '💀', unlocked: false },
  { id: 'near_miss', title: 'Close Call', description: 'Near miss bonus', icon: '😰', unlocked: false },
  { id: 'bonus_gate', title: 'Lucky Find', description: 'Pass a bonus gate', icon: '🍀', unlocked: false },
  { id: 'neon_master', title: 'Neon Master', description: 'Unlock all others', icon: '🏆', unlocked: false },
];
