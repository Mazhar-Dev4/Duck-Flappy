import React, { useState, useEffect } from 'react';
import { Achievement } from '@/game/types';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDone }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <div className="absolute top-20 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s ease-out',
      }}>
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border"
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,40,0.95), rgba(124,77,255,0.15))',
          borderColor: 'rgba(124,77,255,0.3)',
          boxShadow: '0 0 30px rgba(124,77,255,0.2)',
        }}>
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <div className="text-xs font-bold tracking-wider uppercase"
            style={{ color: '#7c4dff' }}>Achievement Unlocked</div>
          <div className="text-sm font-medium" style={{ color: '#e0e0ff' }}>
            {achievement.title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
