import React from 'react';
import { GameSettings } from '@/game/types';
import { DIFFICULTY_CONFIGS, SPACE_THEMES, DUCK_SKINS } from '@/game/constants';
import { sounds } from '@/game/audio';
import { getUnlockedSkins, getUnlockedThemes } from '@/game/storage';

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

  const unlockedSkins = getUnlockedSkins();
  const unlockedThemes = getUnlockedThemes();

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl p-5 border max-h-[85vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,40,0.97), rgba(5,5,20,0.99))',
          borderColor: 'rgba(168,85,247,0.2)',
          boxShadow: '0 0 50px rgba(168,85,247,0.1)',
        }}>

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold tracking-widest uppercase"
            style={{ color: 'rgba(200,200,255,0.6)' }}>⚙️ Settings</h2>
          <button onClick={click(onClose)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,255,0.5)' }}>
            ✕
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2 mb-4">
          {[
            { label: 'Sound Effects', key: 'soundEnabled' as const, value: settings.soundEnabled },
            { label: 'Music', key: 'musicEnabled' as const, value: settings.musicEnabled },
          ].map(item => (
            <div key={item.key} className="flex justify-between items-center p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-sm" style={{ color: 'rgba(200,200,255,0.5)' }}>{item.label}</span>
              <button onClick={click(() => toggle(item.key))}
                className="w-11 h-6 rounded-full relative transition-all"
                style={{
                  background: item.value ? 'linear-gradient(135deg, #a855f7, #d946ef)' : 'rgba(255,255,255,0.1)',
                }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: item.value ? '22px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Theme */}
        <div className="mb-4">
          <div className="text-xs font-medium tracking-wider uppercase mb-2"
            style={{ color: 'rgba(200,200,255,0.35)' }}>Space Theme</div>
          <div className="grid grid-cols-2 gap-2">
            {SPACE_THEMES.map(t => {
              const unlocked = unlockedThemes.includes(t.id);
              const active = settings.theme === t.id;
              return (
                <button key={t.id}
                  onClick={click(() => unlocked && onUpdate({ ...settings, theme: t.id }))}
                  className="py-2 rounded-lg text-xs font-medium transition-all border"
                  style={{
                    background: active ? `${t.accentColor}18` : 'rgba(255,255,255,0.02)',
                    borderColor: active ? `${t.accentColor}40` : 'rgba(255,255,255,0.04)',
                    color: unlocked ? (active ? t.accentColor : 'rgba(200,200,255,0.4)') : 'rgba(200,200,255,0.2)',
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                  {unlocked ? '' : '🔒 '}{t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skin */}
        <div className="mb-4">
          <div className="text-xs font-medium tracking-wider uppercase mb-2"
            style={{ color: 'rgba(200,200,255,0.35)' }}>Duck Skin</div>
          <div className="grid grid-cols-2 gap-2">
            {DUCK_SKINS.map(s => {
              const unlocked = unlockedSkins.includes(s.id);
              const active = settings.skin === s.id;
              return (
                <button key={s.id}
                  onClick={click(() => unlocked && onUpdate({ ...settings, skin: s.id }))}
                  className="py-2 px-2 rounded-lg text-xs font-medium transition-all border flex items-center gap-2"
                  style={{
                    background: active ? `${s.glowColor}18` : 'rgba(255,255,255,0.02)',
                    borderColor: active ? `${s.glowColor}40` : 'rgba(255,255,255,0.04)',
                    color: unlocked ? (active ? s.glowColor : 'rgba(200,200,255,0.4)') : 'rgba(200,200,255,0.2)',
                    opacity: unlocked ? 1 : 0.5,
                  }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: s.bodyColor }} />
                  {unlocked ? '' : '🔒 '}{s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality */}
        <div className="mb-4">
          <div className="text-xs font-medium tracking-wider uppercase mb-2"
            style={{ color: 'rgba(200,200,255,0.35)' }}>Quality</div>
          <div className="flex gap-2">
            {(['low', 'high'] as const).map(q => (
              <button key={q}
                onClick={click(() => onUpdate({ ...settings, quality: q }))}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background: settings.quality === q ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: settings.quality === q ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.04)',
                  color: settings.quality === q ? '#a855f7' : 'rgba(200,200,255,0.35)',
                }}>
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="p-3 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[9px] uppercase tracking-wider mb-1"
            style={{ color: 'rgba(200,200,255,0.25)' }}>Controls</div>
          <div className="text-xs" style={{ color: 'rgba(200,200,255,0.4)' }}>
            Tap · Click · Space
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
