import React from 'react';

interface HUDProps {
  score: number;
  bestScore: number;
  streak: number;
  level: number;
  levelProgress: number;
  levelTarget: number;
  coins: number;
  scorePopTimer: number;
}

const HUD: React.FC<HUDProps> = ({ score, bestScore, streak, level, levelProgress, levelTarget, coins, scorePopTimer }) => {
  const progressPercent = Math.min((levelProgress / levelTarget) * 100, 100);

  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5">
      <div className="flex justify-between items-start">
        {/* Score */}
        <div className="text-center">
          <div
            className="text-4xl sm:text-5xl font-black tabular-nums transition-transform duration-100"
            style={{
              color: '#ffffff',
              textShadow: '0 0 15px rgba(168,85,247,0.4)',
              transform: scorePopTimer > 0 ? `scale(${1 + scorePopTimer * 0.008})` : 'scale(1)',
            }}
          >
            {score}
          </div>
          {coins > 0 && (
            <div className="text-xs font-medium mt-0.5" style={{ color: '#fbbf24' }}>
              ✨ {coins}
            </div>
          )}
        </div>

        {/* Right info */}
        <div className="text-right flex flex-col gap-1">
          <div className="text-xs font-medium tracking-wider uppercase"
            style={{ color: 'rgba(200,200,255,0.4)' }}>
            BEST: <span style={{ color: 'rgba(168,85,247,0.7)' }}>{bestScore}</span>
          </div>
          {/* Level */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-bold tracking-wider"
              style={{ color: 'rgba(200,200,255,0.5)' }}>
              LVL {level}
            </span>
            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #a855f7, #d946ef)',
                }} />
            </div>
          </div>
          {streak >= 3 && (
            <div className="text-xs font-bold tracking-wider animate-pulse"
              style={{ color: '#fbbf24' }}>
              🔥 {streak}x STREAK
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HUD;
