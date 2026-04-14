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
    const text = `🐥 Duck Fly — Score: ${state.score} | Level: ${state.level} | Streak: ${state.bestStreak}x`;
    navigator.clipboard?.writeText(text);
  };

  const isTopScore = () => {
    const lb = getLeaderboard();
    return lb.length < 10 || state.score > (lb[lb.length - 1]?.score || 0);
  };

  if (!showContent) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-5 border"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.95), rgba(5,5,20,0.98))',
          borderColor: 'rgba(168,85,247,0.2)',
          boxShadow: '0 0 50px rgba(168,85,247,0.12)',
        }}>

        <div className="text-center mb-3">
          <div className="text-3xl mb-1">🐥</div>
          <h2 className="text-lg font-bold tracking-widest uppercase"
            style={{ color: 'rgba(200,200,255,0.5)' }}>
            GAME OVER
          </h2>
          {state.newRecord && (
            <div className="text-sm font-bold mt-1 animate-pulse" style={{ color: '#FFD700' }}>
              ✨ NEW RECORD!
            </div>
          )}
        </div>

        <div className="text-center mb-4">
          <div className="text-4xl font-black tabular-nums"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            {animScore}
          </div>
          <div className="text-xs mt-1" style={{ color: 'rgba(200,200,255,0.35)' }}>
            Best: {state.bestScore}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Level', value: `${state.level}`, icon: '📊' },
            { label: 'Streak', value: `${state.bestStreak}x`, icon: '🔥' },
            { label: 'Perfect', value: `${state.perfectPasses}`, icon: '🎯' },
            { label: 'Coins', value: `${state.coins}`, icon: '✨' },
          ].map(s => (
            <div key={s.label} className="text-center p-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-sm">{s.icon}</div>
              <div className="text-xs font-bold" style={{ color: '#e0e0ff' }}>{s.value}</div>
              <div className="text-[9px]" style={{ color: 'rgba(200,200,255,0.3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {isTopScore() && !nameSubmitted && (
          <div className="mb-3 flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Your name..."
              maxLength={12}
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#e0e0ff',
              }}
            />
            <button onClick={handleNameSubmit}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(168,85,247,0.2)',
                color: '#a855f7',
                border: '1px solid rgba(168,85,247,0.3)',
              }}>
              Save
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={click(onRetry)}
            className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FF8C00)',
              color: '#1a1a2e',
              boxShadow: '0 0 15px rgba(255,215,0,0.2)',
            }}>
            RETRY
          </button>
          <button onClick={click(onHome)}
            className="py-3 px-4 rounded-xl font-medium text-sm tracking-wider uppercase transition-all hover:scale-[1.02] border"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(200,200,255,0.5)',
            }}>
            HOME
          </button>
          <button onClick={handleShare}
            className="py-3 px-3 rounded-xl transition-all hover:scale-[1.02] border"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgba(200,200,255,0.5)',
            }}>
            📋
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
