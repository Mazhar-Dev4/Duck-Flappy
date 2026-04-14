import React from 'react';
import { GameState } from '@/game/types';
import { sounds } from '@/game/audio';
import { getLevelTarget } from '@/game/constants';

interface LevelCompleteScreenProps {
  state: GameState;
  onNextLevel: () => void;
  onHome: () => void;
  soundEnabled: boolean;
  rewards?: { coins: number; skinUnlocked?: string; themeUnlocked?: string };
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({
  state, onNextLevel, onHome, soundEnabled, rewards,
}) => {
  const click = (fn: () => void) => () => {
    if (soundEnabled) sounds.menuClick();
    fn();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-6 border text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.95), rgba(5,5,20,0.98))',
          borderColor: 'rgba(168,85,247,0.25)',
          boxShadow: '0 0 60px rgba(168,85,247,0.15)',
        }}>

        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-xl font-bold tracking-widest uppercase mb-1"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #d946ef)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          LEVEL {state.level} COMPLETE!
        </h2>
        <p className="text-xs mb-4" style={{ color: 'rgba(200,200,255,0.4)' }}>
          Amazing flying, little duck! 🐥
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-lg font-bold" style={{ color: '#FFD700' }}>{state.score}</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Score</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-lg font-bold" style={{ color: '#d946ef' }}>{state.bestStreak}x</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Streak</div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-lg font-bold" style={{ color: '#10b981' }}>{state.perfectPasses}</div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Perfect</div>
          </div>
        </div>

        {/* Rewards */}
        {rewards && (
          <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>
              Rewards Earned
            </div>
            <div className="text-sm" style={{ color: '#FFE066' }}>
              ✨ {rewards.coins} coins
            </div>
            {rewards.skinUnlocked && (
              <div className="text-sm mt-1" style={{ color: '#d946ef' }}>
                🐥 New skin: {rewards.skinUnlocked}!
              </div>
            )}
            {rewards.themeUnlocked && (
              <div className="text-sm mt-1" style={{ color: '#a855f7' }}>
                🌌 New theme: {rewards.themeUnlocked}!
              </div>
            )}
          </div>
        )}

        {/* Next level info */}
        <div className="text-xs mb-4" style={{ color: 'rgba(200,200,255,0.35)' }}>
          Next: Level {state.level + 1} — {getLevelTarget(state.level + 1)} gates to pass
        </div>

        <div className="flex gap-2">
          <button onClick={click(onNextLevel)}
            className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #d946ef)',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(168,85,247,0.25)',
            }}>
            NEXT LEVEL →
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
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteScreen;
