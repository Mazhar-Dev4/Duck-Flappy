import { DifficultyConfig, Achievement, DuckSkin, SpaceTheme } from './types';

export const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    speed: 1.6,
    gap: 210,
    gravity: 0.25,
    flapForce: -5.5,
    spawnInterval: 320,
    label: 'Easy',
    description: 'Calm & forgiving',
  },
  medium: {
    speed: 2.2,
    gap: 175,
    gravity: 0.32,
    flapForce: -6.0,
    spawnInterval: 260,
    label: 'Medium',
    description: 'Balanced fun',
  },
  hard: {
    speed: 3.0,
    gap: 145,
    gravity: 0.40,
    flapForce: -6.5,
    spawnInterval: 210,
    label: 'Hard',
    description: 'Real challenge',
  },
};

export const DUCK_SIZE = 22;
export const DUCK_X_POSITION = 0.22;
export const OBSTACLE_WIDTH = 52;
export const MAX_VELOCITY = 8;
export const TRAIL_LENGTH = 10;
export const NEAR_MISS_THRESHOLD = 20;

export const LEVEL_BASE_TARGET = 5; // gates to pass for level 1
export const LEVEL_TARGET_INCREMENT = 2; // extra gates per level

export function getLevelTarget(level: number): number {
  return LEVEL_BASE_TARGET + (level - 1) * LEVEL_TARGET_INCREMENT;
}

export const SPACE_THEMES: SpaceTheme[] = [
  {
    id: 'nebula_dream',
    name: 'Nebula Dream',
    bg1: '#05051a',
    bg2: '#0a0a2e',
    nebulaHue: 270,
    accentColor: '#a855f7',
    starColor: '#e0e7ff',
    obstacleColor: '#7c3aed',
    obstacleGlow: '#a78bfa',
    unlockLevel: 0,
  },
  {
    id: 'cosmic_violet',
    name: 'Cosmic Violet',
    bg1: '#0a0018',
    bg2: '#1a0030',
    nebulaHue: 290,
    accentColor: '#d946ef',
    starColor: '#fce7f3',
    obstacleColor: '#c026d3',
    obstacleGlow: '#e879f9',
    unlockLevel: 5,
  },
  {
    id: 'deep_void',
    name: 'Deep Void',
    bg1: '#000510',
    bg2: '#001025',
    nebulaHue: 210,
    accentColor: '#3b82f6',
    starColor: '#dbeafe',
    obstacleColor: '#2563eb',
    obstacleGlow: '#60a5fa',
    unlockLevel: 10,
  },
  {
    id: 'planet_bloom',
    name: 'Planet Bloom',
    bg1: '#050a05',
    bg2: '#0a1a10',
    nebulaHue: 150,
    accentColor: '#10b981',
    starColor: '#d1fae5',
    obstacleColor: '#059669',
    obstacleGlow: '#34d399',
    unlockLevel: 15,
  },
];

export const DUCK_SKINS: DuckSkin[] = [
  {
    id: 'classic',
    name: 'Classic Duck',
    bodyColor: '#FFD700',
    beakColor: '#FF8C00',
    eyeColor: '#1a1a2e',
    glowColor: '#FFE066',
    unlockLevel: 0,
    description: 'The original baby duck',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Duck',
    bodyColor: '#a78bfa',
    beakColor: '#c084fc',
    eyeColor: '#1e1b4b',
    glowColor: '#c4b5fd',
    unlockLevel: 3,
    description: 'Touched by stardust',
  },
  {
    id: 'flame',
    name: 'Flame Duck',
    bodyColor: '#f97316',
    beakColor: '#ef4444',
    eyeColor: '#1c1917',
    glowColor: '#fdba74',
    unlockLevel: 7,
    description: 'Born from a supernova',
  },
  {
    id: 'ice',
    name: 'Ice Duck',
    bodyColor: '#67e8f9',
    beakColor: '#22d3ee',
    eyeColor: '#164e63',
    glowColor: '#a5f3fc',
    unlockLevel: 12,
    description: 'Frozen in deep space',
  },
  {
    id: 'golden',
    name: 'Golden Duck',
    bodyColor: '#fbbf24',
    beakColor: '#f59e0b',
    eyeColor: '#451a03',
    glowColor: '#fde68a',
    unlockLevel: 20,
    description: 'The legendary golden quacker',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flight', title: 'First Flight', description: 'Pass your first gate', icon: '🚀', unlocked: false },
  { id: 'score_10', title: 'Getting Started', description: 'Score 10 points', icon: '⭐', unlocked: false },
  { id: 'score_25', title: 'Skilled Pilot', description: 'Score 25 points', icon: '🌟', unlocked: false },
  { id: 'score_50', title: 'Ace Pilot', description: 'Score 50 points', icon: '💫', unlocked: false },
  { id: 'score_100', title: 'Space Legend', description: 'Score 100 points', icon: '👑', unlocked: false },
  { id: 'perfect_10', title: 'Precision', description: '10 perfect passes', icon: '🎯', unlocked: false },
  { id: 'streak_5', title: 'On Fire', description: '5x streak', icon: '🔥', unlocked: false },
  { id: 'streak_10', title: 'Unstoppable', description: '10x streak', icon: '⚡', unlocked: false },
  { id: 'hard_10', title: 'Hard Mode Survivor', description: 'Score 10 on Hard', icon: '💀', unlocked: false },
  { id: 'near_miss', title: 'Close Call', description: 'Near miss bonus', icon: '😰', unlocked: false },
  { id: 'bonus_gate', title: 'Lucky Find', description: 'Pass a bonus gate', icon: '🍀', unlocked: false },
  { id: 'level_5', title: 'Duck Explorer', description: 'Reach level 5', icon: '🗺️', unlocked: false },
  { id: 'level_10', title: 'Level Master', description: 'Reach level 10', icon: '🏅', unlocked: false },
  { id: 'space_master', title: 'Space Master', description: 'Unlock all others', icon: '🏆', unlocked: false },
];
