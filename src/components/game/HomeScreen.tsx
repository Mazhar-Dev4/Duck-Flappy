import React from 'react';
import { Difficulty } from '@/game/types';
import { DIFFICULTY_CONFIGS } from '@/game/constants';
import { sounds } from '@/game/audio';

interface HomeScreenProps {
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  onPlay: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  soundEnabled: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  difficulty, onSetDifficulty, onPlay, onSettings, onLeaderboard, soundEnabled,
}) => {
  const click = (fn: () => void) => () => {
    if (soundEnabled) sounds.menuClick();
    fn();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full animate-fade-in">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-5xl sm:text-6xl font-black tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 50%, #ff00e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(0,229,255,0.4))',
            }}>
            NEONGLIDE
          </h1>
          <p className="text-sm mt-2 tracking-[0.3em] uppercase"
            style={{ color: 'rgba(200,200,255,0.5)' }}>
            Navigate the Neon Grid
          </p>
        </div>

        {/* Drone preview */}
        <div className="w-20 h-20 relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.3), transparent)', filter: 'blur(10px)' }} />
          <svg width="48" height="32" viewBox="-24 -16 48 32">
            <polygon points="24,0 -14,-12 -7,0 -14,12" fill="#00e5ff" filter="url(#glow)" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
          </svg>
        </div>

        {/* Difficulty */}
        <div className="flex gap-3 w-full">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
            const cfg = DIFFICULTY_CONFIGS[d];
            const active = difficulty === d;
            return (
              <button key={d}
                onClick={click(() => onSetDifficulty(d))}
                className="flex-1 py-3 px-2 rounded-xl text-center transition-all duration-200 border"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,77,255,0.15))'
                    : 'rgba(255,255,255,0.03)',
                  borderColor: active ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.06)',
                  boxShadow: active ? '0 0 20px rgba(0,229,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                  transform: active ? 'scale(1.02)' : 'scale(1)',
                }}>
                <div className="text-xs font-bold tracking-wider uppercase"
                  style={{ color: active ? '#00e5ff' : 'rgba(200,200,255,0.4)' }}>
                  {cfg.label}
                </div>
                <div className="text-[10px] mt-1"
                  style={{ color: 'rgba(200,200,255,0.3)' }}>
                  {cfg.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Play button */}
        <button
          onClick={click(onPlay)}
          className="w-full py-4 rounded-2xl text-lg font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
            color: '#ffffff',
            boxShadow: '0 0 40px rgba(0,229,255,0.3), 0 8px 32px rgba(0,0,0,0.3)',
          }}>
          PLAY
        </button>

        {/* Bottom buttons */}
        <div className="flex gap-4">
          <button onClick={click(onLeaderboard)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(200,200,255,0.6)',
            }}>
            🏆 Leaderboard
          </button>
          <button onClick={click(onSettings)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(200,200,255,0.6)',
            }}>
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
