import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, Difficulty } from '@/game/types';
import { SPACE_THEMES, DUCK_SKINS } from '@/game/constants';
import { createInitialState, updateFrame, flap, spawnParticles, FrameResult } from '@/game/engine';
import {
  drawBackground, drawStars, drawLightStreaks, drawNebulae, drawPlanets,
  drawDuck, drawTrail, drawObstacle, drawParticles, drawVignette,
  getTheme, getSkin,
} from '@/game/renderer';
import { sounds, startAmbient, stopAmbient } from '@/game/audio';
import { getBestScore, setBestScore, setBestLevel } from '@/game/storage';

interface GameCanvasProps {
  difficulty: Difficulty;
  theme: string;
  skin: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onScore: (score: number, streak: number, perfectPasses: number, coins: number) => void;
  onDeath: (state: GameState) => void;
  onLevelComplete: (state: GameState) => void;
  onAchievementCheck: (result: FrameResult, state: GameState) => void;
  playing: boolean;
  level: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty, theme, skin, soundEnabled, musicEnabled,
  onScore, onDeath, onLevelComplete, onAchievementCheck, playing, level,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const animRef = useRef<number>(0);
  const deadCallbackDone = useRef(false);
  const levelCompleteDone = useRef(false);
  const [started, setStarted] = useState(false);

  const themeData = getTheme(theme);
  const skinData = getSkin(skin);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const best = getBestScore(difficulty);
    stateRef.current = createInitialState(w, h, best, level);
    deadCallbackDone.current = false;
    levelCompleteDone.current = false;
    setStarted(false);
  }, [difficulty, level]);

  const handleFlap = useCallback(() => {
    const st = stateRef.current;
    if (!st || !st.isAlive) return;
    if (!started) setStarted(true);
    flap(st.duck, difficulty);
    if (soundEnabled) sounds.flap();
  }, [difficulty, soundEnabled, started]);

  // Input
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); handleFlap(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, handleFlap]);

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Init
  useEffect(() => {
    if (playing) initGame();
  }, [playing, initGame]);

  // Music
  useEffect(() => {
    if (playing && musicEnabled) startAmbient();
    else stopAmbient();
    return () => stopAmbient();
  }, [playing, musicEnabled]);

  // Idle background
  useEffect(() => {
    if (playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const idleStars = Array.from({ length: 100 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      size: Math.random() * 2 + 0.3, speed: Math.random() * 0.3 + 0.05,
      brightness: Math.random() * 0.7 + 0.2,
    }));
    const idleNebulae = Array.from({ length: 3 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      radius: 80 + Math.random() * 120, hue: 250 + Math.random() * 80,
      alpha: 0.04 + Math.random() * 0.04, speed: 0.05,
    }));
    let frame = 0;

    const loop = () => {
      const dpr2 = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.width / dpr2;
      const ch = canvas.height / dpr2;
      frame++;
      drawBackground(ctx, cw, ch, themeData, frame);
      drawNebulae(ctx, idleNebulae, frame);
      for (const s of idleStars) { s.x -= s.speed * 0.2; if (s.x < 0) s.x = cw; }
      drawStars(ctx, idleStars, frame);
      drawVignette(ctx, cw, ch);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, themeData]);

  // Game loop
  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const st = stateRef.current;
      if (!st) { animRef.current = requestAnimationFrame(loop); return; }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();

      if (st.shakeAmount > 0.5) {
        const sx = (Math.random() - 0.5) * st.shakeAmount;
        const sy = (Math.random() - 0.5) * st.shakeAmount;
        ctx.translate(sx, sy);
      }

      if (started && st.isAlive) {
        const result = updateFrame(st, w, h, difficulty, theme);
        if (result.scored) {
          onScore(st.score, st.streak, st.perfectPasses, st.coins);
          if (soundEnabled) {
            if (result.perfectPass) sounds.perfectPass();
            else if (result.bonusGate) sounds.bonusGate();
            else sounds.score();
            if (result.coinsEarned > 0) sounds.coinCollect();
            if (st.streak > 0 && st.streak % 5 === 0) sounds.streak();
          }
        }
        if (result.nearMiss && soundEnabled) sounds.nearMiss();
        if (result.levelCompleted && !levelCompleteDone.current) {
          levelCompleteDone.current = true;
          if (soundEnabled) sounds.levelComplete();
          setBestLevel(difficulty, st.level);
          setTimeout(() => onLevelComplete(st), 500);
        }
        if (result.died) {
          if (soundEnabled) sounds.collision();
          setTimeout(() => { if (soundEnabled) sounds.gameOver(); }, 300);
        }
        onAchievementCheck(result, st);
      } else if (!st.isAlive && st.slowMotionTimer > 0) {
        updateFrame(st, w, h, difficulty, theme);
      }

      if (!st.isAlive && st.slowMotionTimer <= 0 && !deadCallbackDone.current) {
        deadCallbackDone.current = true;
        setBestScore(difficulty, st.score);
        setBestLevel(difficulty, st.level);
        setTimeout(() => onDeath(st), 300);
      }

      // Draw
      drawBackground(ctx, w, h, themeData, st.frameCount);
      drawNebulae(ctx, st.nebulae, st.frameCount);
      drawPlanets(ctx, st.planets, st.frameCount);
      drawStars(ctx, st.stars, st.frameCount);
      drawLightStreaks(ctx, st.lightStreaks);
      for (const obs of st.obstacles) {
        drawObstacle(ctx, obs, h, themeData, st.frameCount);
      }
      drawTrail(ctx, st.duck, skinData);
      drawDuck(ctx, st.duck, skinData, st.frameCount);
      drawParticles(ctx, st.particles);
      drawVignette(ctx, w, h);

      // Tap to start
      if (!started && st.isAlive) {
        ctx.fillStyle = '#e0e7ff';
        ctx.font = '600 15px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(st.frameCount * 0.04);
        ctx.fillText('TAP OR PRESS SPACE TO FLY', w / 2, h / 2 + 70);
        ctx.globalAlpha = 1;
        st.duck.y = h / 2 + Math.sin(st.frameCount * 0.025) * 12;
        st.duck.flapTimer += 1;
        if (st.duck.flapTimer > 8) { st.duck.flapTimer = 0; st.duck.flapFrame = (st.duck.flapFrame + 1) % 3; }
        st.frameCount++;
        for (const s of st.stars) { s.x -= s.speed * 0.2; if (s.x < 0) s.x = w; }
        for (const n of st.nebulae) { n.x -= n.speed * 0.1; if (n.x + n.radius < -50) { n.x = w + n.radius; } }
      }

      // Death flash
      if (!st.isAlive && st.slowMotionTimer > 12) {
        ctx.fillStyle = `rgba(255,255,255,${(st.slowMotionTimer - 12) / 50})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Near miss
      if (st.nearMissTimer > 20) {
        ctx.fillStyle = themeData.accentColor;
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = (st.nearMissTimer - 20) / 10;
        ctx.fillText('CLOSE!', st.duck.x, st.duck.y - 28);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, started, difficulty, theme, skin, soundEnabled, themeData, skinData, onScore, onDeath, onLevelComplete, onAchievementCheck]);

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    handleFlap();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer touch-none"
      onClick={handleTouch}
      onTouchStart={handleTouch}
    />
  );
};

export default GameCanvas;
