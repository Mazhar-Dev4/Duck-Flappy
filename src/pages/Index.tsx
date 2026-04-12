import React, { useState, useCallback, useRef } from 'react';
import { GameState, Difficulty, GameScreen, Achievement, GameSettings } from '@/game/types';
import { ACHIEVEMENTS } from '@/game/constants';
import { loadSettings, saveSettings, getBestScore, addLeaderboardEntry, unlockAchievement, getUnlockedAchievements } from '@/game/storage';
import { sounds } from '@/game/audio';
import { FrameResult } from '@/game/engine';
import GameCanvas from '@/components/game/GameCanvas';
import HomeScreen from '@/components/game/HomeScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import HUD from '@/components/game/HUD';
import SettingsPanel from '@/components/game/SettingsPanel';
import LeaderboardPanel from '@/components/game/LeaderboardPanel';
import AchievementToast from '@/components/game/AchievementToast';

const Index = () => {
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [screen, setScreen] = useState<GameScreen>('home');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => getBestScore(settings.difficulty));
  const [streak, setStreak] = useState(0);
  const [perfectPasses, setPerfectPasses] = useState(0);
  const [scorePopTimer, setScorePopTimer] = useState(0);
  const [deathState, setDeathState] = useState<GameState | null>(null);
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
    if (!achievementToast) {
      showNextAchievement();
    }
  }, [achievementToast, showNextAchievement]);

  const tryUnlock = useCallback((id: string) => {
    if (unlockAchievement(id)) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        if (settings.soundEnabled) sounds.achievement();
        queueAchievement(ach);
      }
      // Check neon_master
      const unlocked = getUnlockedAchievements();
      const allOthers = ACHIEVEMENTS.filter(a => a.id !== 'neon_master').every(a => unlocked.includes(a.id));
      if (allOthers) {
        if (unlockAchievement('neon_master')) {
          const master = ACHIEVEMENTS.find(a => a.id === 'neon_master');
          if (master) queueAchievement(master);
        }
      }
    }
  }, [settings.soundEnabled, queueAchievement]);

  const handleScore = useCallback((s: number, st: number, pp: number) => {
    setScore(s);
    setStreak(st);
    setPerfectPasses(pp);
    setScorePopTimer(20);
    setTimeout(() => setScorePopTimer(0), 300);
  }, []);

  const handleAchievementCheck = useCallback((result: FrameResult, state: GameState) => {
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
    }
    if (result.nearMiss) tryUnlock('near_miss');
    if (result.bonusGate) tryUnlock('bonus_gate');
  }, [tryUnlock, settings.difficulty]);

  const handleDeath = useCallback((state: GameState) => {
    setDeathState(state);
    setBestScore(Math.max(state.bestScore, state.score));
    setScreen('gameover');
  }, []);

  const handlePlay = useCallback(() => {
    setScore(0);
    setStreak(0);
    setPerfectPasses(0);
    setDeathState(null);
    setBestScore(getBestScore(settings.difficulty));
    setScreen('playing');
  }, [settings.difficulty]);

  const handleHome = useCallback(() => {
    setScreen('home');
    setDeathState(null);
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
      });
    }
  }, [deathState, settings.difficulty]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none" style={{ background: '#0a0a1a' }}>
      {/* Game canvas */}
      <GameCanvas
        difficulty={settings.difficulty}
        theme={settings.theme}
        soundEnabled={settings.soundEnabled && screen === 'playing'}
        musicEnabled={settings.musicEnabled && screen === 'playing'}
        onScore={handleScore}
        onDeath={handleDeath}
        onAchievementCheck={handleAchievementCheck}
        playing={screen === 'playing'}
      />


      {/* HUD */}
      {screen === 'playing' && (
        <HUD score={score} bestScore={bestScore} streak={streak} scorePopTimer={scorePopTimer} />
      )}

      {/* Home */}
      {screen === 'home' && (
        <HomeScreen
          difficulty={settings.difficulty}
          onSetDifficulty={d => updateSettings({ ...settings, difficulty: d })}
          onPlay={handlePlay}
          onSettings={() => setScreen('settings')}
          onLeaderboard={() => setScreen('leaderboard')}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* Game Over */}
      {screen === 'gameover' && deathState && (
        <GameOverScreen
          state={deathState}
          onRetry={handlePlay}
          onHome={handleHome}
          onNameSubmit={handleNameSubmit}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* Settings */}
      {screen === 'settings' && (
        <SettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          onClose={handleHome}
        />
      )}

      {/* Leaderboard */}
      {screen === 'leaderboard' && (
        <LeaderboardPanel onClose={handleHome} soundEnabled={settings.soundEnabled} />
      )}

      {/* Achievement Toast */}
      <AchievementToast
        achievement={achievementToast}
        onDone={showNextAchievement}
      />
    </div>
  );
};

export default Index;
