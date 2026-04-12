import { GameState, Drone, Obstacle, Particle, Star, LightStreak } from './types';
import { DRONE_SIZE, THEMES } from './constants';

type Theme = typeof THEMES.cyber;

export function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme, frame: number) {
  const grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, theme.bg1);
  grd.addColorStop(1, theme.bg2);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = theme.accent2 + '08';
  ctx.lineWidth = 1;
  const gridSize = 60;
  const offsetY = (frame * 0.3) % gridSize;
  for (let y = -gridSize + offsetY; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  const offsetX = (-frame * 0.5) % gridSize;
  for (let x = offsetX; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], frame: number) {
  for (const s of stars) {
    const flicker = 0.5 + 0.5 * Math.sin(frame * 0.02 + s.x);
    ctx.globalAlpha = s.brightness * flicker;
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
    grd.addColorStop(0, `hsla(${s.hue}, 100%, 70%, 0)`);
    grd.addColorStop(0.5, `hsla(${s.hue}, 100%, 70%, ${s.alpha})`);
    grd.addColorStop(1, `hsla(${s.hue}, 100%, 70%, 0)`);
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x + s.length, s.y);
    ctx.stroke();
  }
}

export function drawDrone(ctx: CanvasRenderingContext2D, drone: Drone, theme: Theme, frame: number) {
  ctx.save();
  ctx.translate(drone.x, drone.y);
  ctx.rotate(drone.rotation);

  const s = DRONE_SIZE;
  const pulse = 1 + 0.08 * Math.sin(frame * 0.15);

  // Glow
  ctx.shadowColor = theme.droneGlow;
  ctx.shadowBlur = 20 * pulse;

  // Body
  ctx.fillStyle = theme.drone;
  ctx.beginPath();
  ctx.moveTo(s, 0);
  ctx.lineTo(-s * 0.6, -s * 0.5);
  ctx.lineTo(-s * 0.3, 0);
  ctx.lineTo(-s * 0.6, s * 0.5);
  ctx.closePath();
  ctx.fill();

  // Core
  ctx.shadowBlur = 30 * pulse;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Wings / fins
  const wingAngle = Math.sin(drone.wingPhase) * 0.3;
  ctx.shadowBlur = 10;

  // Top fin
  ctx.save();
  ctx.rotate(-0.4 + wingAngle);
  ctx.fillStyle = theme.accent2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, -s * 0.1);
  ctx.lineTo(-s * 0.7, -s * 0.7);
  ctx.lineTo(-s * 0.4, -s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Bottom fin
  ctx.save();
  ctx.rotate(0.4 - wingAngle);
  ctx.fillStyle = theme.accent2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, s * 0.1);
  ctx.lineTo(-s * 0.7, s * 0.7);
  ctx.lineTo(-s * 0.4, s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Engine exhaust
  ctx.globalAlpha = 0.4 + 0.3 * Math.sin(frame * 0.3);
  ctx.fillStyle = theme.accent3;
  ctx.shadowColor = theme.accent3;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, -s * 0.12);
  ctx.lineTo(-s * 0.8 - Math.random() * s * 0.3, 0);
  ctx.lineTo(-s * 0.3, s * 0.12);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawTrail(ctx: CanvasRenderingContext2D, drone: Drone, theme: Theme) {
  if (drone.trailPoints.length < 2) return;
  for (let i = 1; i < drone.trailPoints.length; i++) {
    const p = drone.trailPoints[i];
    const prev = drone.trailPoints[i - 1];
    ctx.strokeStyle = theme.droneGlow;
    ctx.globalAlpha = p.alpha * 0.4;
    ctx.lineWidth = (1 - i / drone.trailPoints.length) * 4;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, h: number, theme: Theme, frame: number) {
  const entry = Math.min(obs.entryProgress, 1);
  const alpha = entry;
  ctx.globalAlpha = alpha;

  let gapY = obs.gapY;
  if (obs.type === 'moving') {
    gapY += Math.sin(frame * 0.03 * obs.moveSpeed) * obs.moveAmplitude;
  }

  const topH = gapY - obs.gapSize / 2;
  const botY = gapY + obs.gapSize / 2;
  const botH = h - botY;
  const w = obs.width;

  let color = theme.obstacle;
  let glowColor = theme.obstacleGlow;

  if (obs.type === 'bonus') {
    color = '#00ff88';
    glowColor = '#66ffbb';
  } else if (obs.type === 'pulse') {
    const p = 0.5 + 0.5 * Math.sin(frame * 0.08 + obs.phase);
    ctx.globalAlpha = alpha * (0.6 + 0.4 * p);
  } else if (obs.type === 'narrow') {
    color = theme.accent3;
    glowColor = theme.accent3;
  }

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 12;

  // Top pillar
  const tGrd = ctx.createLinearGradient(obs.x, 0, obs.x + w, 0);
  tGrd.addColorStop(0, color + '40');
  tGrd.addColorStop(0.5, color + 'cc');
  tGrd.addColorStop(1, color + '40');
  ctx.fillStyle = tGrd;
  ctx.fillRect(obs.x, 0, w, topH);

  // Top edge glow
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 20;
  ctx.fillRect(obs.x - 2, topH - 3, w + 4, 3);

  // Bottom pillar
  ctx.shadowBlur = 12;
  ctx.fillStyle = tGrd;
  ctx.fillRect(obs.x, botY, w, botH);

  // Bottom edge glow
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 20;
  ctx.fillRect(obs.x - 2, botY, w + 4, 3);

  // Rotating ring for rotating type
  if (obs.type === 'rotating') {
    const cx = obs.x + w / 2;
    const angle = frame * 0.04;
    ctx.save();
    ctx.translate(cx, gapY);
    ctx.rotate(angle);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = alpha * 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, obs.gapSize * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Bonus gate sparkle
  if (obs.type === 'bonus') {
    const cx = obs.x + w / 2;
    for (let i = 0; i < 3; i++) {
      const sparkY = gapY + Math.sin(frame * 0.1 + i * 2) * obs.gapSize * 0.3;
      ctx.globalAlpha = alpha * (0.3 + 0.3 * Math.sin(frame * 0.15 + i));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(frame * 0.08 + i) * 10, sparkY, 2, 0, Math.PI * 2);
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
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grd = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
  grd.addColorStop(0, 'transparent');
  grd.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
}
