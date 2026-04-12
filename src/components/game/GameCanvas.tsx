import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameState, Difficulty } from '@/game/types';
import { THEMES } from '@/game/constants';
import { createInitialState, updateFrame, flap, spawnParticles, FrameResult } from '@/game/engine';
import {
  drawBackground, drawStars, drawLightStreaks, drawDrone,
  drawTrail, drawObstacle, drawParticles, drawVignette,
} from '@/game/renderer';
import { sounds, startAmbient, stopAmbient } from '@/game/audio';
import { getBestScore, setBestScore } from '@/game/storage';

interface GameCanvasProps {
  difficulty: Difficulty;
  theme: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onScore: (score: number, streak: number, perfectPasses: number) => void;
  onDeath: (state: GameState) => void;
  onAchievementCheck: (result: FrameResult, state: GameState) => void;
  playing: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty, theme, soundEnabled, musicEnabled,
  onScore, onDeath, onAchievementCheck, playing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const animRef = useRef<number>(0);
  const deadCallbackDone = useRef(false);
  const [started, setStarted] = useState(false);

  const themeColors = THEMES[theme as keyof typeof THEMES] || THEMES.cyber;

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const best = getBestScore(difficulty);
    stateRef.current = createInitialState(w, h, best);
    deadCallbackDone.current = false;
    setStarted(false);
  }, [difficulty]);

  const handleFlap = useCallback(() => {
    const st = stateRef.current;
    if (!st || !st.isAlive) return;
    if (!started) setStarted(true);
    flap(st.drone, difficulty);
    if (soundEnabled) sounds.flap();
  }, [difficulty, soundEnabled, started]);

  // Input handlers
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

  // Init game state
  useEffect(() => {
    if (playing) initGame();
  }, [playing, initGame]);

  // Music
  useEffect(() => {
    if (playing && musicEnabled) startAmbient();
    else stopAmbient();
    return () => stopAmbient();
  }, [playing, musicEnabled]);

  // Idle background animation (when not playing)
  useEffect(() => {
    if (playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create idle background state
    const idleStars: any[] = [];
    const idleStreaks: any[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    for (let i = 0; i < 80; i++) {
      idleStars.push({ x: Math.random() * w, y: Math.random() * h, size: Math.random() * 1.5 + 0.5, speed: Math.random() * 0.5 + 0.1, brightness: Math.random() * 0.6 + 0.2 });
    }
    for (let i = 0; i < 6; i++) {
      idleStreaks.push({ x: Math.random() * w, y: Math.random() * h, length: Math.random() * 100 + 50, speed: Math.random() * 1.5 + 0.5, alpha: Math.random() * 0.15 + 0.05, hue: Math.random() * 60 + 180 });
    }
    let frame = 0;

    const loop = () => {
      const dpr2 = Math.min(window.devicePixelRatio || 1, 2);
      const cw = canvas.width / dpr2;
      const ch = canvas.height / dpr2;
      frame++;
      drawBackground(ctx, cw, ch, themeColors, frame);
      for (const s of idleStars) { s.x -= s.speed * 0.3; if (s.x < 0) s.x = cw; }
      for (const s of idleStreaks) { s.x -= s.speed * 0.3; if (s.x + s.length < 0) { s.x = cw; s.y = Math.random() * ch; } }
      drawStars(ctx, idleStars, frame);
      drawLightStreaks(ctx, idleStreaks);
      drawVignette(ctx, cw, ch);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, themeColors]);

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

      // Screen shake
      if (st.shakeAmount > 0.5) {
        const sx = (Math.random() - 0.5) * st.shakeAmount;
        const sy = (Math.random() - 0.5) * st.shakeAmount;
        ctx.translate(sx, sy);
      }

      // Update
      if (started && st.isAlive) {
        const result = updateFrame(st, w, h, difficulty, theme);
        if (result.scored) {
          onScore(st.score, st.streak, st.perfectPasses);
          if (soundEnabled) {
            if (result.perfectPass) sounds.perfectPass();
            else if (result.bonusGate) sounds.bonusGate();
            else sounds.score();
            if (st.streak > 0 && st.streak % 5 === 0) sounds.streak();
          }
        }
        if (result.nearMiss && soundEnabled) sounds.nearMiss();
        if (result.died) {
          if (soundEnabled) sounds.collision();
          setTimeout(() => { if (soundEnabled) sounds.gameOver(); }, 400);
        }
        onAchievementCheck(result, st);
      } else if (!st.isAlive && st.slowMotionTimer > 0) {
        const result = updateFrame(st, w, h, difficulty, theme);
        void result;
      }

      // Handle death callback after slow-mo
      if (!st.isAlive && st.slowMotionTimer <= 0 && !deadCallbackDone.current) {
        deadCallbackDone.current = true;
        setBestScore(difficulty, st.score);
        setTimeout(() => onDeath(st), 300);
      }

      // Draw
      drawBackground(ctx, w, h, themeColors, st.frameCount);
      drawStars(ctx, st.stars, st.frameCount);
      drawLightStreaks(ctx, st.lightStreaks);
      for (const obs of st.obstacles) {
        drawObstacle(ctx, obs, h, themeColors, st.frameCount);
      }
      drawTrail(ctx, st.drone, themeColors);
      drawDrone(ctx, st.drone, themeColors, st.frameCount);
      drawParticles(ctx, st.particles);
      drawVignette(ctx, w, h);

      // "Tap to start" text
      if (!started && st.isAlive) {
        ctx.fillStyle = themeColors.text;
        ctx.font = '600 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(st.frameCount * 0.05);
        ctx.fillText('TAP OR PRESS SPACE TO START', w / 2, h / 2 + 60);
        ctx.globalAlpha = 1;
        st.drone.y = h / 2 + Math.sin(st.frameCount * 0.03) * 15;
        st.frameCount++;
        for (const s of st.stars) { s.x -= s.speed * 0.3; if (s.x < 0) s.x = w; }
        for (const s of st.lightStreaks) { s.x -= s.speed * 0.3; if (s.x + s.length < 0) { s.x = w; s.y = Math.random() * h; } }
      }

      // Death flash
      if (!st.isAlive && st.slowMotionTimer > 15) {
        ctx.fillStyle = `rgba(255,255,255,${(st.slowMotionTimer - 15) / 60})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Near miss indicator
      if (st.nearMissTimer > 20) {
        ctx.fillStyle = themeColors.accent1;
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = (st.nearMissTimer - 20) / 10;
        ctx.fillText('CLOSE!', st.drone.x, st.drone.y - 30);
        ctx.globalAlpha = 1;
      }

      // Score pop
      if (st.scorePopTimer > 10) {
        const scale = 1 + (st.scorePopTimer - 10) * 0.02;
        ctx.save();
        ctx.translate(w / 2, 50);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st.score.toString(), 0, 0);
        ctx.restore();
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, started, difficulty, theme, soundEnabled, themeColors, onScore, onDeath, onAchievementCheck]);

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
