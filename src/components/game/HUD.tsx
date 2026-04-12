import React from 'react';

interface HUDProps {
  score: number;
  bestScore: number;
  streak: number;
  scorePopTimer: number;
}

const HUD: React.FC<HUDProps> = ({ score, bestScore, streak, scorePopTimer }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-4 sm:p-6">
      <div className="flex justify-between items-start">
        {/* Score */}
        <div className="text-center">
          <div
            className="text-4xl sm:text-5xl font-black tabular-nums transition-transform duration-100"
            style={{
              color: '#ffffff',
              textShadow: '0 0 20px rgba(0,229,255,0.5)',
              transform: scorePopTimer > 0 ? `scale(${1 + scorePopTimer * 0.01})` : 'scale(1)',
            }}
          >
            {score}
          </div>
        </div>

        {/* Best & Streak */}
        <div className="text-right flex flex-col gap-1">
          <div className="text-xs font-medium tracking-wider uppercase"
            style={{ color: 'rgba(200,200,255,0.4)' }}>
            BEST: <span style={{ color: 'rgba(0,229,255,0.7)' }}>{bestScore}</span>
          </div>
          {streak >= 3 && (
            <div className="text-xs font-bold tracking-wider animate-pulse"
              style={{ color: '#ff00e5' }}>
              🔥 {streak}x STREAK
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HUD;
