import { Duck, Obstacle, Particle, Star, LightStreak, Nebula, Planet } from './types';
import { DUCK_SIZE, SPACE_THEMES, DUCK_SKINS } from './constants';

type Theme = typeof SPACE_THEMES[0];
type Skin = typeof DUCK_SKINS[0];

export function getTheme(id: string): Theme {
  return SPACE_THEMES.find(t => t.id === id) || SPACE_THEMES[0];
}

export function getSkin(id: string): Skin {
  return DUCK_SKINS.find(s => s.id === id) || DUCK_SKINS[0];
}

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme, frame: number) {
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, theme.bg1);
  grd.addColorStop(1, theme.bg2);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}

export function drawNebulae(ctx: CanvasRenderingContext2D, nebulae: Nebula[], frame: number) {
  for (const n of nebulae) {
    const pulse = 1 + 0.1 * Math.sin(frame * 0.005 + n.x * 0.01);
    const r = n.radius * pulse;
    const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
    grd.addColorStop(0, `hsla(${n.hue}, 60%, 40%, ${n.alpha * 1.2})`);
    grd.addColorStop(0.4, `hsla(${n.hue + 20}, 50%, 30%, ${n.alpha * 0.6})`);
    grd.addColorStop(1, `hsla(${n.hue}, 40%, 20%, 0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(n.x - r, n.y - r, r * 2, r * 2);
  }
}

export function drawPlanets(ctx: CanvasRenderingContext2D, planets: Planet[], frame: number) {
  for (const p of planets) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    // Planet body
    const grd = ctx.createRadialGradient(p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0, p.x, p.y, p.radius);
    grd.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, 55%, 0.6)`);
    grd.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, 25%, 0.3)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    // Ring
    if (p.hasRing) {
      ctx.strokeStyle = `hsla(${p.hue}, ${p.saturation}%, 60%, 0.25)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius * 1.6, p.radius * 0.3, p.ringAngle, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], frame: number) {
  for (const s of stars) {
    const twinkle = 0.4 + 0.6 * Math.sin(frame * 0.015 + s.x * 0.1 + s.y * 0.05);
    ctx.globalAlpha = s.brightness * twinkle;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawLightStreaks(ctx: CanvasRenderingContext2D, streaks: LightStreak[]) {
  for (const s of streaks) {
    const grd = ctx.createLinearGradient(s.x, s.y, s.x + s.length, s.y);
    grd.addColorStop(0, `hsla(${s.hue}, 80%, 70%, 0)`);
    grd.addColorStop(0.5, `hsla(${s.hue}, 80%, 70%, ${s.alpha})`);
    grd.addColorStop(1, `hsla(${s.hue}, 80%, 70%, 0)`);
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.length, s.y);
    ctx.stroke();
  }
}

export function drawDuck(ctx: CanvasRenderingContext2D, duck: Duck, skin: Skin, frame: number) {
  ctx.save();
  ctx.translate(duck.x, duck.y);
  ctx.rotate(duck.rotation);

  const s = DUCK_SIZE;
  const sq = duck.squash;

  // Glow
  ctx.shadowColor = skin.glowColor;
  ctx.shadowBlur = 15;

  // Scale for squash/stretch
  ctx.scale(1 / sq, sq);

  // Trail sparkles
  for (const sp of duck.sparkles) {
    ctx.globalAlpha = sp.life / 25;
    ctx.fillStyle = '#FFE066';
    ctx.beginPath();
    ctx.arc(sp.x - duck.x, sp.y - duck.y, sp.size * (sp.life / 25), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Body (round)
  ctx.fillStyle = skin.bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.9, s * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly highlight
  ctx.fillStyle = lightenColor(skin.bodyColor, 30);
  ctx.beginPath();
  ctx.ellipse(2, 3, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing - 3-frame animation
  ctx.shadowBlur = 0;
  const wingOffsets = [-6, -2, 3]; // up, mid, down
  const wingY = wingOffsets[duck.flapFrame] || 0;
  ctx.fillStyle = darkenColor(skin.bodyColor, 15);
  ctx.beginPath();
  ctx.ellipse(-4, wingY, s * 0.4, s * 0.55, -0.3 + duck.flapFrame * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Eye (large, expressive)
  const eyeX = s * 0.35;
  const eyeY = -s * 0.2;
  // Eye white
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, s * 0.28, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Pupil
  ctx.fillStyle = skin.eyeColor;
  ctx.beginPath();
  ctx.arc(eyeX + 2, eyeY + 1, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  // Eye shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eyeX + 4, eyeY - 3, s * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = skin.beakColor;
  ctx.beginPath();
  ctx.moveTo(s * 0.75, -s * 0.05);
  ctx.lineTo(s * 1.15, s * 0.08);
  ctx.lineTo(s * 0.75, s * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xFF) + percent);
  const b = Math.min(255, (num & 0xFF) + percent);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0xFF) - percent);
  const b = Math.max(0, (num & 0xFF) - percent);
  return `rgb(${r},${g},${b})`;
}

export function drawTrail(ctx: CanvasRenderingContext2D, duck: Duck, skin: Skin) {
  if (duck.trailPoints.length < 2) return;
  for (let i = 1; i < duck.trailPoints.length; i++) {
    const p = duck.trailPoints[i];
    const prev = duck.trailPoints[i - 1];
    ctx.strokeStyle = skin.glowColor;
    ctx.globalAlpha = p.alpha * 0.3;
    ctx.lineWidth = (1 - i / duck.trailPoints.length) * 6;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, h: number, theme: Theme, frame: number) {
  const entry = Math.min(obs.entryProgress, 1);
  ctx.globalAlpha = entry;

  let gapY = obs.gapY;
  if (obs.type === 'moving') {
    gapY += Math.sin(frame * 0.02 * obs.moveSpeed) * obs.moveAmplitude;
  }

  const topH = gapY - obs.gapSize / 2;
  const botY = gapY + obs.gapSize / 2;
  const botH = h - botY;
  const w = obs.width;

  let color = theme.obstacleColor;
  let glowColor = theme.obstacleGlow;

  if (obs.type === 'bonus') {
    color = '#10b981';
    glowColor = '#34d399';
  } else if (obs.type === 'pulse') {
    const p = 0.5 + 0.5 * Math.sin(frame * 0.06 + obs.phase);
    ctx.globalAlpha = entry * (0.6 + 0.4 * p);
  } else if (obs.type === 'narrow') {
    color = '#f97316';
    glowColor = '#fdba74';
  }

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;

  // Top pillar
  const tGrd = ctx.createLinearGradient(obs.x, 0, obs.x + w, 0);
  tGrd.addColorStop(0, color + '30');
  tGrd.addColorStop(0.5, color + 'aa');
  tGrd.addColorStop(1, color + '30');
  ctx.fillStyle = tGrd;
  ctx.fillRect(obs.x, 0, w, topH);

  // Top edge glow
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 15;
  ctx.fillRect(obs.x - 1, topH - 2, w + 2, 2);

  // Bottom pillar
  ctx.shadowBlur = 10;
  ctx.fillStyle = tGrd;
  ctx.fillRect(obs.x, botY, w, botH);

  // Bottom edge glow
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 15;
  ctx.fillRect(obs.x - 1, botY, w + 2, 2);

  // Rotating ring
  if (obs.type === 'rotating') {
    const cx = obs.x + w / 2;
    const angle = frame * 0.03;
    ctx.save();
    ctx.translate(cx, gapY);
    ctx.rotate(angle);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = entry * 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, obs.gapSize * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Bonus sparkle
  if (obs.type === 'bonus') {
    const cx = obs.x + w / 2;
    for (let i = 0; i < 3; i++) {
      const sparkY = gapY + Math.sin(frame * 0.08 + i * 2) * obs.gapSize * 0.25;
      ctx.globalAlpha = entry * (0.3 + 0.3 * Math.sin(frame * 0.12 + i));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(frame * 0.06 + i) * 8, sparkY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.globalAlpha = p.alpha * (p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grd = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
  grd.addColorStop(0, 'transparent');
  grd.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}
