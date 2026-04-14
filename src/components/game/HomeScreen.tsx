import React from 'react';
import { Difficulty } from '@/game/types';
import { DIFFICULTY_CONFIGS, DUCK_SKINS } from '@/game/constants';
import { sounds } from '@/game/audio';
import { getBestLevel, getBestScore, getTotalCoins } from '@/game/storage';

interface HomeScreenProps {
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  onPlay: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  onRewards: () => void;
  soundEnabled: boolean;
  currentSkin: string;
  currentLevel: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  difficulty, onSetDifficulty, onPlay, onSettings, onLeaderboard, onRewards, soundEnabled, currentSkin, currentLevel,
}) => {
  const click = (fn: () => void) => () => {
    if (soundEnabled) sounds.menuClick();
    fn();
  };

  const skin = DUCK_SKINS.find(s => s.id === currentSkin) || DUCK_SKINS[0];
  const bestScore = getBestScore(difficulty);
  const bestLevel = getBestLevel(difficulty);
  const totalCoins = getTotalCoins();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center gap-4 max-w-md w-full animate-fade-in">
        {/* Title */}
        <div className="text-center mb-1">
          <h1 className="text-4xl sm:text-5xl font-black tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.3))',
            }}>
            DUCK FLY
          </h1>
          <p className="text-xs mt-1 tracking-[0.2em] uppercase"
            style={{ color: 'rgba(200,200,255,0.4)' }}>
            Explore the cosmos 🌌
          </p>
        </div>

        {/* Duck preview */}
        <div className="w-20 h-20 relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full animate-pulse"
            style={{ background: `radial-gradient(circle, ${skin.glowColor}30, transparent)`, filter: 'blur(8px)' }} />
          <svg width="56" height="48" viewBox="-28 -24 56 48">
            <ellipse cx="0" cy="0" rx="18" ry="15" fill={skin.bodyColor} />
            <ellipse cx="2" cy="3" rx="10" ry="8" fill={skin.bodyColor} opacity="0.7" />
            <ellipse cx="-4" cy="-3" rx="8" ry="11" fill={skin.bodyColor} opacity="0.8">
              <animateTransform attributeName="transform" type="rotate" values="-10;10;-10" dur="0.6s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="7" cy="-4" rx="5.5" ry="6" fill="#ffffff" />
            <circle cx="9" cy="-3" r="2.8" fill={skin.eyeColor} />
            <circle cx="10" cy="-5" r="1.2" fill="#ffffff" />
            <polygon points="16,-1 24,2 16,4" fill={skin.beakColor} />
          </svg>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 text-center">
          <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Best</div>
            <div className="text-sm font-bold" style={{ color: '#a855f7' }}>{bestScore}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Level</div>
            <div className="text-sm font-bold" style={{ color: '#d946ef' }}>{bestLevel}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Coins</div>
            <div className="text-sm font-bold" style={{ color: '#fbbf24' }}>✨ {totalCoins}</div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex gap-2 w-full">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
            const cfg = DIFFICULTY_CONFIGS[d];
            const active = difficulty === d;
            const colors = d === 'easy' ? ['#10b981', '#34d399'] : d === 'medium' ? ['#a855f7', '#c084fc'] : ['#ef4444', '#f87171'];
            return (
              <button key={d}
                onClick={click(() => onSetDifficulty(d))}
                className="flex-1 py-2.5 px-2 rounded-xl text-center transition-all duration-200 border"
                style={{
                  background: active ? `linear-gradient(135deg, ${colors[0]}18, ${colors[1]}18)` : 'rgba(255,255,255,0.02)',
                  borderColor: active ? `${colors[0]}50` : 'rgba(255,255,255,0.05)',
                  boxShadow: active ? `0 0 15px ${colors[0]}20` : 'none',
                  transform: active ? 'scale(1.03)' : 'scale(1)',
                }}>
                <div className="text-xs font-bold tracking-wider uppercase"
                  style={{ color: active ? colors[0] : 'rgba(200,200,255,0.35)' }}>
                  {cfg.label}
                </div>
                <div className="text-[9px] mt-0.5"
                  style={{ color: 'rgba(200,200,255,0.25)' }}>
                  {cfg.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Play */}
        <button
          onClick={click(onPlay)}
          className="w-full py-3.5 rounded-2xl text-lg font-bold tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
            color: '#1a1a2e',
            boxShadow: '0 0 30px rgba(255,215,0,0.25), 0 6px 24px rgba(0,0,0,0.3)',
          }}>
          🐥 FLY!
        </button>

        {/* Bottom buttons */}
        <div className="flex gap-2 w-full">
          {[
            { label: '🏆 Scores', onClick: onLeaderboard },
            { label: '🎁 Rewards', onClick: onRewards },
            { label: '⚙️ Settings', onClick: onSettings },
          ].map(btn => (
            <button key={btn.label} onClick={click(btn.onClick)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 border"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(200,200,255,0.5)',
              }}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
