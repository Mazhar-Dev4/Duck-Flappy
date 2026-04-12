import React, { useState, useEffect } from 'react';
import { GameState } from '@/game/types';
import { sounds } from '@/game/audio';
import { getLeaderboard } from '@/game/storage';

interface GameOverScreenProps {
  state: GameState;
  onRetry: () => void;
  onHome: () => void;
  onNameSubmit: (name: string) => void;
  soundEnabled: boolean;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  state, onRetry, onHome, onNameSubmit, soundEnabled,
}) => {
  const [animScore, setAnimScore] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 200);
    // Animated counter
    const target = state.score;
    if (target === 0) { setAnimScore(0); return; }
    let current = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      setAnimScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [state.score]);

  const click = (fn: () => void) => () => {
    if (soundEnabled) sounds.menuClick();
    fn();
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      onNameSubmit(name.trim());
      setNameSubmitted(true);
    }
  };

  const handleShare = () => {
    const text = `🚀 NeonGlide — Score: ${state.score} | Streak: ${state.bestStreak}x | Perfect: ${state.perfectPasses}`;
    navigator.clipboard?.writeText(text);
  };

  const isTopScore = () => {
    const lb = getLeaderboard();
    return lb.length < 10 || state.score > (lb[lb.length - 1]?.score || 0);
  };

  if (!showContent) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-6 border"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.95), rgba(5,5,20,0.98))',
          borderColor: 'rgba(124,77,255,0.2)',
          boxShadow: '0 0 60px rgba(124,77,255,0.15)',
        }}>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold tracking-widest uppercase"
            style={{ color: 'rgba(200,200,255,0.6)' }}>
            GAME OVER
          </h2>
          {state.newRecord && (
            <div className="text-sm font-bold mt-1 animate-pulse"
              style={{ color: '#00e5ff' }}>
              ✨ NEW RECORD!
            </div>
          )}
        </div>

        {/* Score */}
        <div className="text-center mb-5">
          <div className="text-5xl font-black tabular-nums"
            style={{
              background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            {animScore}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(200,200,255,0.4)' }}>
            Best: {state.bestScore}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Streak', value: `${state.bestStreak}x`, icon: '🔥' },
            { label: 'Perfect', value: state.perfectPasses.toString(), icon: '🎯' },
            { label: 'Distance', value: `${Math.floor(state.distance / 100)}m`, icon: '📏' },
          ].map(s => (
            <div key={s.label} className="text-center p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-lg">{s.icon}</div>
              <div className="text-sm font-bold" style={{ color: '#e0e0ff' }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: 'rgba(200,200,255,0.3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Name entry */}
        {isTopScore() && !nameSubmitted && (
          <div className="mb-4 flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Your name..."
              maxLength={12}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e0e0ff',
              }}
            />
            <button onClick={handleNameSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(0,229,255,0.2)',
                color: '#00e5ff',
                border: '1px solid rgba(0,229,255,0.3)',
              }}>
              Save
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button onClick={click(onRetry)}
            className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #00e5ff, #7c4dff)',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(0,229,255,0.2)',
            }}>
            RETRY
          </button>
          <button onClick={click(onHome)}
            className="py-3 px-5 rounded-xl font-medium text-sm tracking-wider uppercase transition-all hover:scale-[1.02] border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'rgba(200,200,255,0.6)',
            }}>
            HOME
          </button>
          <button onClick={handleShare}
            className="py-3 px-4 rounded-xl transition-all hover:scale-[1.02] border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'rgba(200,200,255,0.6)',
            }}>
            📋
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
