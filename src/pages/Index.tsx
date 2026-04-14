import React, { useState, useCallback, useRef } from 'react';
import { GameState, Difficulty, GameScreen, Achievement, GameSettings } from '@/game/types';
import { ACHIEVEMENTS, DUCK_SKINS, SPACE_THEMES, getLevelTarget } from '@/game/constants';
import { loadSettings, saveSettings, getBestScore, getBestLevel, addLeaderboardEntry, unlockAchievement, getUnlockedAchievements, addCoins, unlockSkin, unlockTheme } from '@/game/storage';
import { sounds } from '@/game/audio';
import { FrameResult } from '@/game/engine';
import GameCanvas from '@/components/game/GameCanvas';
import HomeScreen from '@/components/game/HomeScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import LevelCompleteScreen from '@/components/game/LevelCompleteScreen';
import HUD from '@/components/game/HUD';
import SettingsPanel from '@/components/game/SettingsPanel';
import LeaderboardPanel from '@/components/game/LeaderboardPanel';
import RewardsPanel from '@/components/game/RewardsPanel';
import AchievementToast from '@/components/game/AchievementToast';

const Index = () => {
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [screen, setScreen] = useState<GameScreen>('home');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => getBestScore(settings.difficulty));
  const [streak, setStreak] = useState(0);
  const [perfectPasses, setPerfectPasses] = useState(0);
  const [coins, setCoins] = useState(0);
  const [scorePopTimer, setScorePopTimer] = useState(0);
  const [deathState, setDeathState] = useState<GameState | null>(null);
  const [levelCompleteState, setLevelCompleteState] = useState<GameState | null>(null);
  const [levelRewards, setLevelRewards] = useState<{ coins: number; skinUnlocked?: string; themeUnlocked?: string } | undefined>();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [levelTarget, setLevelTarget] = useState(getLevelTarget(1));
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const achievementQueue = useRef<Achievement[]>([]);

  const updateSettings = useCallback((s: GameSettings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const showNextAchievement = useCallback(() => {
    if (achievementQueue.current.length > 0) {
      setAchievementToast(achievementQueue.current.shift()!);
    } else {
      setAchievementToast(null);
    }
  }, []);

  const queueAchievement = useCallback((a: Achievement) => {
    achievementQueue.current.push(a);
    if (!achievementToast) showNextAchievement();
  }, [achievementToast, showNextAchievement]);

  const tryUnlock = useCallback((id: string) => {
    if (unlockAchievement(id)) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        if (settings.soundEnabled) sounds.achievement();
        queueAchievement(ach);
      }
      const unlocked = getUnlockedAchievements();
      const allOthers = ACHIEVEMENTS.filter(a => a.id !== 'space_master').every(a => unlocked.includes(a.id));
      if (allOthers) {
        if (unlockAchievement('space_master')) {
          const master = ACHIEVEMENTS.find(a => a.id === 'space_master');
          if (master) queueAchievement(master);
        }
      }
    }
  }, [settings.soundEnabled, queueAchievement]);

  const handleScore = useCallback((s: number, st: number, pp: number, c: number) => {
    setScore(s);
    setStreak(st);
    setPerfectPasses(pp);
    setCoins(c);
    setScorePopTimer(20);
    setTimeout(() => setScorePopTimer(0), 300);
  }, []);

  const handleAchievementCheck = useCallback((result: FrameResult, state: GameState) => {
    setLevelProgress(state.levelProgress);
    setLevelTarget(state.levelTarget);
    setCurrentLevel(state.level);

    if (result.scored) {
      if (state.score === 1) tryUnlock('first_flight');
      if (state.score >= 10) tryUnlock('score_10');
      if (state.score >= 25) tryUnlock('score_25');
      if (state.score >= 50) tryUnlock('score_50');
      if (state.score >= 100) tryUnlock('score_100');
      if (state.perfectPasses >= 10) tryUnlock('perfect_10');
      if (state.streak >= 5) tryUnlock('streak_5');
      if (state.streak >= 10) tryUnlock('streak_10');
      if (settings.difficulty === 'hard' && state.score >= 10) tryUnlock('hard_10');
      if (state.level >= 5) tryUnlock('level_5');
      if (state.level >= 10) tryUnlock('level_10');
    }
    if (result.nearMiss) tryUnlock('near_miss');
    if (result.bonusGate) tryUnlock('bonus_gate');
  }, [tryUnlock, settings.difficulty]);

  const handleLevelComplete = useCallback((state: GameState) => {
    setLevelCompleteState(state);
    const coinReward = 10 + state.level * 5;
    addCoins(coinReward + state.coins);

    // Check for unlockable rewards at this level
    const rewards: { coins: number; skinUnlocked?: string; themeUnlocked?: string } = { coins: coinReward };
    const nextLevel = state.level + 1;

    const skinToUnlock = DUCK_SKINS.find(s => s.unlockLevel === state.level);
    if (skinToUnlock) {
      unlockSkin(skinToUnlock.id);
      rewards.skinUnlocked = skinToUnlock.name;
    }
    const themeToUnlock = SPACE_THEMES.find(t => t.unlockLevel === state.level);
    if (themeToUnlock) {
      unlockTheme(themeToUnlock.id);
      rewards.themeUnlocked = themeToUnlock.name;
    }

    setLevelRewards(rewards);
    setCurrentLevel(nextLevel);
    setScreen('levelComplete');
  }, []);

  const handleDeath = useCallback((state: GameState) => {
    setDeathState(state);
    addCoins(state.coins);
    setBestScore(Math.max(state.bestScore, state.score));
    setScreen('gameover');
  }, []);

  const handlePlay = useCallback(() => {
    setScore(0);
    setStreak(0);
    setPerfectPasses(0);
    setCoins(0);
    setDeathState(null);
    setLevelCompleteState(null);
    setLevelProgress(0);
    setCurrentLevel(1);
    setLevelTarget(getLevelTarget(1));
    setBestScore(getBestScore(settings.difficulty));
    setScreen('playing');
  }, [settings.difficulty]);

  const handleNextLevel = useCallback(() => {
    setScore(levelCompleteState?.score || 0);
    setCoins(0);
    setLevelCompleteState(null);
    setLevelProgress(0);
    setLevelTarget(getLevelTarget(currentLevel));
    setScreen('playing');
  }, [currentLevel, levelCompleteState]);

  const handleHome = useCallback(() => {
    setScreen('home');
    setDeathState(null);
    setLevelCompleteState(null);
  }, []);

  const handleNameSubmit = useCallback((name: string) => {
    if (deathState) {
      addLeaderboardEntry({
        name,
        score: deathState.score,
        difficulty: settings.difficulty,
        date: new Date().toLocaleDateString(),
        perfectPasses: deathState.perfectPasses,
        streak: deathState.bestStreak,
        level: deathState.level,
      });
    }
  }, [deathState, settings.difficulty]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none" style={{ background: '#05051a' }}>
      <GameCanvas
        difficulty={settings.difficulty}
        theme={settings.theme}
        skin={settings.skin}
        soundEnabled={settings.soundEnabled && screen === 'playing'}
        musicEnabled={settings.musicEnabled && screen === 'playing'}
        onScore={handleScore}
        onDeath={handleDeath}
        onLevelComplete={handleLevelComplete}
        onAchievementCheck={handleAchievementCheck}
        playing={screen === 'playing'}
        level={currentLevel}
      />

      {screen === 'playing' && (
        <HUD score={score} bestScore={bestScore} streak={streak}
          level={currentLevel} levelProgress={levelProgress} levelTarget={levelTarget}
          coins={coins} scorePopTimer={scorePopTimer} />
      )}

      {screen === 'home' && (
        <HomeScreen
          difficulty={settings.difficulty}
          onSetDifficulty={d => updateSettings({ ...settings, difficulty: d })}
          onPlay={handlePlay}
          onSettings={() => setScreen('settings')}
          onLeaderboard={() => setScreen('leaderboard')}
          onRewards={() => setScreen('rewards')}
          soundEnabled={settings.soundEnabled}
          currentSkin={settings.skin}
          currentLevel={getBestLevel(settings.difficulty)}
        />
      )}

      {screen === 'gameover' && deathState && (
        <GameOverScreen
          state={deathState}
          onRetry={handlePlay}
          onHome={handleHome}
          onNameSubmit={handleNameSubmit}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {screen === 'levelComplete' && levelCompleteState && (
        <LevelCompleteScreen
          state={levelCompleteState}
          onNextLevel={handleNextLevel}
          onHome={handleHome}
          soundEnabled={settings.soundEnabled}
          rewards={levelRewards}
        />
      )}

      {screen === 'settings' && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={handleHome}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardPanel onClose={handleHome} soundEnabled={settings.soundEnabled} />
      )}

      {screen === 'rewards' && (
        <RewardsPanel onClose={handleHome} soundEnabled={settings.soundEnabled} />
      )}

      <AchievementToast
        achievement={achievementToast}
        onDone={showNextAchievement}
      />
    </div>
  );
};

export default Index;
