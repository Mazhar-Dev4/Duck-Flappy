import { GameSettings, LeaderboardEntry, Difficulty } from './types';
import { ACHIEVEMENTS } from './constants';

const SETTINGS_KEY = 'duckfly_settings';
const LEADERBOARD_KEY = 'duckfly_leaderboard';
const ACHIEVEMENTS_KEY = 'duckfly_achievements';
const BEST_SCORE_KEY = 'duckfly_best_';
const BEST_LEVEL_KEY = 'duckfly_bestlevel_';
const COINS_KEY = 'duckfly_coins';
const UNLOCKED_SKINS_KEY = 'duckfly_skins';
const UNLOCKED_THEMES_KEY = 'duckfly_themes';

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { soundEnabled: true, musicEnabled: true, difficulty: 'easy', theme: 'nebula_dream', skin: 'classic', quality: 'high', ...parsed };
    }
  } catch {}
  return { soundEnabled: true, musicEnabled: true, difficulty: 'easy', theme: 'nebula_dream', skin: 'classic', quality: 'high' };
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

export function getBestLevel(difficulty: Difficulty): number {
  return parseInt(localStorage.getItem(BEST_LEVEL_KEY + difficulty) || '1', 10);
}

export function setBestLevel(difficulty: Difficulty, level: number) {
  const current = getBestLevel(difficulty);
  if (level > current) {
    localStorage.setItem(BEST_LEVEL_KEY + difficulty, level.toString());
  }
}

export function getTotalCoins(): number {
  return parseInt(localStorage.getItem(COINS_KEY) || '0', 10);
}

export function addCoins(amount: number) {
  const current = getTotalCoins();
  localStorage.setItem(COINS_KEY, (current + amount).toString());
}

export function getUnlockedSkins(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_SKINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['classic'];
}

export function unlockSkin(id: string) {
  const skins = getUnlockedSkins();
  if (!skins.includes(id)) {
    skins.push(id);
    localStorage.setItem(UNLOCKED_SKINS_KEY, JSON.stringify(skins));
  }
}

export function getUnlockedThemes(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_THEMES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['nebula_dream'];
}

export function unlockTheme(id: string) {
  const themes = getUnlockedThemes();
  if (!themes.includes(id)) {
    themes.push(id);
    localStorage.setItem(UNLOCKED_THEMES_KEY, JSON.stringify(themes));
  }
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
