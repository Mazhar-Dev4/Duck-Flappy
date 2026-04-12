let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15, detune = 0) {
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

function playNoise(duration: number, vol = 0.08) {
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
    playTone(400, 0.08, 'sine', 0.1);
    playTone(600, 0.06, 'sine', 0.06, 5);
  },
  score: () => {
    playTone(880, 0.1, 'sine', 0.12);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 60);
  },
  perfectPass: () => {
    playTone(880, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.08, 'sine', 0.1), 50);
    setTimeout(() => playTone(1320, 0.15, 'sine', 0.1), 100);
  },
  nearMiss: () => {
    playTone(660, 0.06, 'triangle', 0.08);
    playTone(990, 0.1, 'triangle', 0.06);
  },
  streak: () => {
    playTone(700, 0.05, 'square', 0.06);
    setTimeout(() => playTone(900, 0.05, 'square', 0.06), 40);
    setTimeout(() => playTone(1200, 0.08, 'square', 0.06), 80);
  },
  collision: () => {
    playNoise(0.3, 0.15);
    playTone(150, 0.3, 'sawtooth', 0.12);
    playTone(80, 0.4, 'sine', 0.1);
  },
  menuClick: () => {
    playTone(800, 0.04, 'sine', 0.08);
  },
  gameOver: () => {
    playTone(400, 0.2, 'sawtooth', 0.08);
    setTimeout(() => playTone(300, 0.2, 'sawtooth', 0.08), 150);
    setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.06), 300);
  },
  achievement: () => {
    playTone(660, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(880, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 200);
    setTimeout(() => playTone(1320, 0.2, 'sine', 0.12), 300);
  },
  bonusGate: () => {
    playTone(1000, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(1200, 0.08, 'sine', 0.1), 60);
    setTimeout(() => playTone(1500, 0.12, 'sine', 0.12), 120);
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
    ambientOsc.frequency.value = 55;
    ambientGain.gain.value = 0.03;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
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
