import React from 'react';
import { Difficulty, GameSettings } from '@/game/types';
import { DIFFICULTY_CONFIGS } from '@/game/constants';
import { sounds } from '@/game/audio';

interface SettingsPanelProps {
  settings: GameSettings;
  onUpdate: (s: GameSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onClose }) => {
  const click = (fn: () => void) => () => {
    if (settings.soundEnabled) sounds.menuClick();
    fn();
  };

  const toggle = (key: 'soundEnabled' | 'musicEnabled') =>
    onUpdate({ ...settings, [key]: !settings[key] });

  const setTheme = (t: 'cyber' | 'neon' | 'void') =>
    onUpdate({ ...settings, theme: t });

  const setQuality = (q: 'low' | 'high') =>
    onUpdate({ ...settings, quality: q });

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-6 border"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.97), rgba(5,5,20,0.99))',
          borderColor: 'rgba(124,77,255,0.2)',
          boxShadow: '0 0 60px rgba(124,77,255,0.1)',
        }}>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold tracking-widest uppercase"
            style={{ color: 'rgba(200,200,255,0.7)' }}>Settings</h2>
          <button onClick={click(onClose)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,255,0.5)' }}>
            ✕
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-5">
          {[
            { label: 'Sound Effects', key: 'soundEnabled' as const, value: settings.soundEnabled },
            { label: 'Music', key: 'musicEnabled' as const, value: settings.musicEnabled },
          ].map(item => (
            <div key={item.key} className="flex justify-between items-center p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span className="text-sm" style={{ color: 'rgba(200,200,255,0.6)' }}>{item.label}</span>
              <button onClick={click(() => toggle(item.key))}
                className="w-12 h-6 rounded-full relative transition-all"
                style={{
                  background: item.value
                    ? 'linear-gradient(135deg, #00e5ff, #7c4dff)'
                    : 'rgba(255,255,255,0.1)',
                }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: item.value ? '26px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Theme */}
        <div className="mb-5">
          <div className="text-xs font-medium tracking-wider uppercase mb-2"
            style={{ color: 'rgba(200,200,255,0.4)' }}>Theme</div>
          <div className="flex gap-2">
            {([
              { id: 'cyber', label: 'Cyber', colors: ['#00e5ff', '#7c4dff'] },
              { id: 'neon', label: 'Neon', colors: ['#ff00ff', '#00ffff'] },
              { id: 'void', label: 'Void', colors: ['#4488ff', '#002266'] },
            ] as const).map(t => (
              <button key={t.id}
                onClick={click(() => setTheme(t.id))}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background: settings.theme === t.id
                    ? `linear-gradient(135deg, ${t.colors[0]}20, ${t.colors[1]}20)`
                    : 'rgba(255,255,255,0.02)',
                  borderColor: settings.theme === t.id ? t.colors[0] + '40' : 'rgba(255,255,255,0.05)',
                  color: settings.theme === t.id ? t.colors[0] : 'rgba(200,200,255,0.4)',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="mb-5">
          <div className="text-xs font-medium tracking-wider uppercase mb-2"
            style={{ color: 'rgba(200,200,255,0.4)' }}>Quality</div>
          <div className="flex gap-2">
            {(['low', 'high'] as const).map(q => (
              <button key={q}
                onClick={click(() => setQuality(q))}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background: settings.quality === q ? 'rgba(0,229,255,0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: settings.quality === q ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.05)',
                  color: settings.quality === q ? '#00e5ff' : 'rgba(200,200,255,0.4)',
                }}>
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Controls help */}
        <div className="p-3 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[10px] uppercase tracking-wider mb-1"
            style={{ color: 'rgba(200,200,255,0.3)' }}>Controls</div>
          <div className="text-xs" style={{ color: 'rgba(200,200,255,0.5)' }}>
            Tap · Click · Space
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
