import React from 'react';
import { getLeaderboard } from '@/game/storage';
import { sounds } from '@/game/audio';

interface LeaderboardPanelProps {
  onClose: () => void;
  soundEnabled: boolean;
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ onClose, soundEnabled }) => {
  const entries = getLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-5 border max-h-[80vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.97), rgba(5,5,20,0.99))',
          borderColor: 'rgba(168,85,247,0.2)',
          boxShadow: '0 0 50px rgba(168,85,247,0.1)',
        }}>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold tracking-widest uppercase"
            style={{ color: 'rgba(200,200,255,0.6)' }}>🏆 Leaderboard</h2>
          <button onClick={() => { if (soundEnabled) sounds.menuClick(); onClose(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,255,0.5)' }}>
            ✕
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🐥</div>
            <div className="text-sm" style={{ color: 'rgba(200,200,255,0.35)' }}>
              No scores yet. Fly to set a record!
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                style={{
                  background: i < 3
                    ? `rgba(${i === 0 ? '255,215,0' : i === 1 ? '192,192,192' : '205,127,50'},0.05)`
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${i < 3 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)'}`,
                }}>
                <div className="text-lg w-7 text-center">
                  {i < 3 ? medals[i] : <span style={{ color: 'rgba(200,200,255,0.25)' }}>{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#e0e0ff' }}>
                    {entry.name || 'Anonymous'}
                  </div>
                  <div className="text-[9px]" style={{ color: 'rgba(200,200,255,0.25)' }}>
                    {entry.difficulty.toUpperCase()} · Lvl {entry.level || '?'} · {entry.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold tabular-nums" style={{ color: '#FFD700' }}>
                    {entry.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPanel;
