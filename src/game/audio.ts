let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.12, detune = 0) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playNoise(duration: number, vol = 0.06) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {}
}

export const sounds = {
  flap: () => {
    // Cute quack-like: quick pitch bend
    playTone(500, 0.06, 'sine', 0.08);
    playTone(650, 0.05, 'triangle', 0.05, 10);
  },
  score: () => {
    playTone(800, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.08), 50);
  },
  perfectPass: () => {
    playTone(800, 0.06, 'sine', 0.08);
    setTimeout(() => playTone(1000, 0.06, 'sine', 0.08), 40);
    setTimeout(() => playTone(1200, 0.1, 'sine', 0.08), 80);
  },
  nearMiss: () => {
    playTone(600, 0.05, 'triangle', 0.06);
    playTone(900, 0.08, 'triangle', 0.04);
  },
  streak: () => {
    playTone(700, 0.04, 'sine', 0.06);
    setTimeout(() => playTone(900, 0.04, 'sine', 0.06), 35);
    setTimeout(() => playTone(1100, 0.06, 'sine', 0.06), 70);
  },
  collision: () => {
    playNoise(0.2, 0.1);
    playTone(200, 0.25, 'sine', 0.08);
  },
  menuClick: () => {
    playTone(700, 0.03, 'sine', 0.06);
  },
  gameOver: () => {
    playTone(350, 0.15, 'sine', 0.06);
    setTimeout(() => playTone(280, 0.15, 'sine', 0.06), 120);
    setTimeout(() => playTone(200, 0.3, 'sine', 0.05), 240);
  },
  achievement: () => {
    playTone(660, 0.08, 'sine', 0.08);
    setTimeout(() => playTone(880, 0.08, 'sine', 0.08), 80);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.08), 160);
    setTimeout(() => playTone(1320, 0.15, 'sine', 0.1), 240);
  },
  bonusGate: () => {
    playTone(900, 0.06, 'sine', 0.08);
    setTimeout(() => playTone(1100, 0.06, 'sine', 0.08), 50);
    setTimeout(() => playTone(1400, 0.1, 'sine', 0.1), 100);
  },
  levelComplete: () => {
    playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(800, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.1), 200);
    setTimeout(() => playTone(1200, 0.15, 'sine', 0.12), 300);
    setTimeout(() => playTone(1400, 0.2, 'sine', 0.1), 400);
  },
  coinCollect: () => {
    playTone(1200, 0.05, 'sine', 0.06);
  },
};

let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient() {
  try {
    if (ambientOsc) return;
    const ctx = getCtx();
    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();
    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 50;
    ambientGain.gain.value = 0.02;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    ambientOsc.connect(filter).connect(ambientGain).connect(ctx.destination);
    ambientOsc.start();
  } catch {}
}

export function stopAmbient() {
  try {
    ambientOsc?.stop();
    ambientOsc = null;
    ambientGain = null;
  } catch {}
}
