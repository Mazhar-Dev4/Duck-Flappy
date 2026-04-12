import { GameSettings, LeaderboardEntry, Difficulty } from './types';
import { ACHIEVEMENTS } from './constants';

const SETTINGS_KEY = 'neonglide_settings';
const LEADERBOARD_KEY = 'neonglide_leaderboard';
const ACHIEVEMENTS_KEY = 'neonglide_achievements';
const BEST_SCORE_KEY = 'neonglide_best_';

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { soundEnabled: true, musicEnabled: true, difficulty: 'medium', theme: 'cyber', quality: 'high' };
}

export function saveSettings(s: GameSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function getBestScore(difficulty: Difficulty): number {
  return parseInt(localStorage.getItem(BEST_SCORE_KEY + difficulty) || '0', 10);
}

export function setBestScore(difficulty: Difficulty, score: number) {
  const current = getBestScore(difficulty);
  if (score > current) {
    localStorage.setItem(BEST_SCORE_KEY + difficulty, score.toString());
    return true;
  }
  return false;
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function addLeaderboardEntry(entry: LeaderboardEntry) {
  const lb = getLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb.slice(0, 10)));
}

export function getUnlockedAchievements(): string[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function unlockAchievement(id: string): boolean {
  const unlocked = getUnlockedAchievements();
  if (unlocked.includes(id)) return false;
  unlocked.push(id);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
  return true;
}

export function getAchievementsWithStatus() {
  const unlocked = getUnlockedAchievements();
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
}
