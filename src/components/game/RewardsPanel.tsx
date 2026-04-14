import React from 'react';
import { DUCK_SKINS, SPACE_THEMES } from '@/game/constants';
import { getUnlockedSkins, getUnlockedThemes, getTotalCoins } from '@/game/storage';
import { sounds } from '@/game/audio';

interface RewardsPanelProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const RewardsPanel: React.FC<RewardsPanelProps> = ({ onClose, soundEnabled }) => {
  const unlockedSkins = getUnlockedSkins();
  const unlockedThemes = getUnlockedThemes();
  const coins = getTotalCoins();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-5 border max-h-[85vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.97), rgba(5,5,20,0.99))',
          borderColor: 'rgba(168,85,247,0.2)',
          boxShadow: '0 0 50px rgba(168,85,247,0.1)',
        }}>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold tracking-widest uppercase"
            style={{ color: 'rgba(200,200,255,0.6)' }}>🎁 Rewards</h2>
          <button onClick={() => { if (soundEnabled) sounds.menuClick(); onClose(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,255,0.5)' }}>
            ✕
          </button>
        </div>

        {/* Coins */}
        <div className="text-center mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.1)' }}>
          <div className="text-2xl font-bold" style={{ color: '#FFD700' }}>✨ {coins}</div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(200,200,255,0.3)' }}>Total Coins</div>
        </div>

        {/* Duck Skins */}
        <div className="mb-4">
          <div className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'rgba(200,200,255,0.4)' }}>
            🐥 Duck Skins ({unlockedSkins.length}/{DUCK_SKINS.length})
          </div>
          <div className="space-y-1.5">
            {DUCK_SKINS.map(s => {
              const unlocked = unlockedSkins.includes(s.id);
              return (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    background: unlocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
                    opacity: unlocked ? 1 : 0.6,
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: `${s.bodyColor}30` }}>
                    <div className="w-5 h-5 rounded-full" style={{ background: s.bodyColor }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium" style={{ color: unlocked ? '#e0e0ff' : 'rgba(200,200,255,0.3)' }}>
                      {s.name} {!unlocked && '🔒'}
                    </div>
                    <div className="text-[9px]" style={{ color: 'rgba(200,200,255,0.25)' }}>
                      {unlocked ? s.description : `Unlock at Level ${s.unlockLevel}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Themes */}
        <div>
          <div className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: 'rgba(200,200,255,0.4)' }}>
            🌌 Space Themes ({unlockedThemes.length}/{SPACE_THEMES.length})
          </div>
          <div className="space-y-1.5">
            {SPACE_THEMES.map(t => {
              const unlocked = unlockedThemes.includes(t.id);
              return (
                <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                  style={{
                    background: unlocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    border: `1px solid ${unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
                    opacity: unlocked ? 1 : 0.6,
                  }}>
                  <div className="w-8 h-8 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${t.bg1}, ${t.accentColor}40)` }} />
                  <div className="flex-1">
                    <div className="text-xs font-medium" style={{ color: unlocked ? '#e0e0ff' : 'rgba(200,200,255,0.3)' }}>
                      {t.name} {!unlocked && '🔒'}
                    </div>
                    <div className="text-[9px]" style={{ color: 'rgba(200,200,255,0.25)' }}>
                      {unlocked ? 'Unlocked!' : `Unlock at Level ${t.unlockLevel}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPanel;
