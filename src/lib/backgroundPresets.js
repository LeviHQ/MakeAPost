/**
 * MakeAPost — 30 Creative Neon, Modern Aura, Mesh, AI-Style & Galaxy Cosmic Backgrounds
 * Vector-rendered on HTML5 Canvas for infinite HD resolution and rendered in CSS
 * for crisp, zero-lag modal swatches.
 */

export const AURA_BACKGROUND_PRESETS = [
  {
    id: 'aura_cyber_pink',
    name: 'Cyber Neon',
    category: 'Neon Dark',
    baseGradient: ['#09090B', '#111827'],
    orbs: [
      { x: 0.15, y: 0.20, r: 0.65, color: 'rgba(236, 72, 153, 0.65)' },
      { x: 0.85, y: 0.80, r: 0.70, color: 'rgba(6, 182, 212, 0.60)' },
      { x: 0.50, y: 0.50, r: 0.55, color: 'rgba(124, 58, 237, 0.45)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_quantum_grid',
    name: 'Quantum Grid',
    category: 'AI Studio',
    baseGradient: ['#030712', '#0F172A'],
    orbs: [
      { x: 0.20, y: 0.25, r: 0.65, color: 'rgba(59, 130, 246, 0.55)' },
      { x: 0.82, y: 0.72, r: 0.65, color: 'rgba(168, 85, 247, 0.55)' },
      { x: 0.50, y: 0.90, r: 0.50, color: 'rgba(34, 211, 238, 0.40)' },
    ],
    pattern: 'grid',
    patternColor: 'rgba(148, 163, 184, 0.13)',
  },
  {
    id: 'aura_acid_volt',
    name: 'Acid Volt',
    category: 'Neon Dark',
    baseGradient: ['#050505', '#09090B'],
    orbs: [
      { x: 0.18, y: 0.82, r: 0.65, color: 'rgba(163, 230, 53, 0.58)' },
      { x: 0.82, y: 0.18, r: 0.65, color: 'rgba(34, 211, 238, 0.55)' },
      { x: 0.50, y: 0.50, r: 0.60, color: 'rgba(16, 185, 129, 0.35)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_synthwave_sun',
    name: 'Synthwave',
    category: 'Neon Dark',
    baseGradient: ['#140524', '#1E0B36'],
    orbs: [
      { x: 0.50, y: 0.20, r: 0.65, color: 'rgba(244, 63, 94, 0.65)' },
      { x: 0.80, y: 0.35, r: 0.50, color: 'rgba(251, 146, 60, 0.50)' },
      { x: 0.20, y: 0.85, r: 0.65, color: 'rgba(6, 182, 212, 0.55)' },
    ],
    pattern: 'grid',
    patternColor: 'rgba(236, 72, 153, 0.14)',
  },
  {
    id: 'aura_emerald_pulse',
    name: 'Matrix Pulse',
    category: 'AI Studio',
    baseGradient: ['#020617', '#022C22'],
    orbs: [
      { x: 0.20, y: 0.25, r: 0.68, color: 'rgba(16, 185, 129, 0.65)' },
      { x: 0.82, y: 0.78, r: 0.65, color: 'rgba(45, 212, 191, 0.50)' },
      { x: 0.75, y: 0.15, r: 0.45, color: 'rgba(132, 204, 22, 0.35)' },
    ],
    pattern: 'dots',
    patternColor: 'rgba(52, 211, 153, 0.18)',
  },
  {
    id: 'aura_solar_plasma',
    name: 'Solar Plasma',
    category: 'Neon Dark',
    baseGradient: ['#140604', '#260A06'],
    orbs: [
      { x: 0.18, y: 0.22, r: 0.68, color: 'rgba(249, 115, 22, 0.72)' },
      { x: 0.82, y: 0.80, r: 0.65, color: 'rgba(239, 68, 68, 0.60)' },
      { x: 0.65, y: 0.25, r: 0.48, color: 'rgba(250, 204, 21, 0.42)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_ultraviolet',
    name: 'Ultraviolet',
    category: 'Neon Dark',
    baseGradient: ['#09021A', '#13072E'],
    orbs: [
      { x: 0.22, y: 0.78, r: 0.68, color: 'rgba(147, 51, 234, 0.68)' },
      { x: 0.80, y: 0.20, r: 0.62, color: 'rgba(232, 121, 249, 0.55)' },
      { x: 0.50, y: 0.50, r: 0.58, color: 'rgba(37, 99, 235, 0.50)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_obsidian_gold',
    name: 'Obsidian Gold',
    category: 'AI Studio',
    baseGradient: ['#09090B', '#18181B'],
    orbs: [
      { x: 0.82, y: 0.18, r: 0.65, color: 'rgba(251, 191, 36, 0.48)' },
      { x: 0.18, y: 0.82, r: 0.65, color: 'rgba(217, 119, 6, 0.42)' },
      { x: 0.50, y: 0.50, r: 0.50, color: 'rgba(254, 243, 199, 0.18)' },
    ],
    pattern: 'beams',
    patternColor: 'rgba(251, 191, 36, 0.08)',
  },
  {
    id: 'aura_arctic_aurora',
    name: 'Arctic Aurora',
    category: 'Mesh Aura',
    baseGradient: ['#042F2E', '#0F172A'],
    orbs: [
      { x: 0.15, y: 0.20, r: 0.70, color: 'rgba(52, 211, 153, 0.62)' },
      { x: 0.85, y: 0.35, r: 0.65, color: 'rgba(56, 189, 248, 0.58)' },
      { x: 0.45, y: 0.85, r: 0.60, color: 'rgba(129, 140, 248, 0.50)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_biolum_ocean',
    name: 'Abyssal Cyan',
    category: 'Neon Dark',
    baseGradient: ['#020617', '#082F49'],
    orbs: [
      { x: 0.25, y: 0.20, r: 0.65, color: 'rgba(6, 182, 212, 0.68)' },
      { x: 0.80, y: 0.80, r: 0.70, color: 'rgba(2, 132, 199, 0.60)' },
      { x: 0.85, y: 0.20, r: 0.45, color: 'rgba(45, 212, 191, 0.45)' },
    ],
    pattern: 'dots',
    patternColor: 'rgba(103, 232, 249, 0.15)',
  },
  {
    id: 'aura_crimson_noir',
    name: 'Crimson Laser',
    category: 'Neon Dark',
    baseGradient: ['#09090B', '#1F070D'],
    orbs: [
      { x: 0.15, y: 0.80, r: 0.68, color: 'rgba(220, 38, 38, 0.65)' },
      { x: 0.85, y: 0.20, r: 0.65, color: 'rgba(244, 63, 94, 0.58)' },
      { x: 0.50, y: 0.50, r: 0.55, color: 'rgba(136, 19, 55, 0.45)' },
    ],
    pattern: 'beams',
    patternColor: 'rgba(244, 63, 94, 0.08)',
  },
  {
    id: 'aura_sunset_vapor',
    name: 'Vapor Dusk',
    category: 'Mesh Aura',
    baseGradient: ['#1E1B4B', '#311042'],
    orbs: [
      { x: 0.15, y: 0.18, r: 0.62, color: 'rgba(251, 146, 60, 0.65)' },
      { x: 0.80, y: 0.75, r: 0.68, color: 'rgba(236, 72, 153, 0.62)' },
      { x: 0.20, y: 0.85, r: 0.60, color: 'rgba(99, 102, 241, 0.55)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_ruby_violet',
    name: 'Neon Velvet',
    category: 'Mesh Aura',
    baseGradient: ['#1A051D', '#09090B'],
    orbs: [
      { x: 0.82, y: 0.22, r: 0.65, color: 'rgba(244, 63, 94, 0.65)' },
      { x: 0.18, y: 0.78, r: 0.68, color: 'rgba(139, 92, 246, 0.65)' },
      { x: 0.15, y: 0.18, r: 0.45, color: 'rgba(251, 191, 36, 0.32)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_ai_nebula',
    name: 'AI Nebula',
    category: 'AI Studio',
    baseGradient: ['#090518', '#0F172A'],
    orbs: [
      { x: 0.25, y: 0.30, r: 0.65, color: 'rgba(217, 70, 239, 0.58)' },
      { x: 0.78, y: 0.72, r: 0.65, color: 'rgba(56, 189, 248, 0.58)' },
      { x: 0.50, y: 0.50, r: 0.60, color: 'rgba(79, 70, 229, 0.50)' },
    ],
    pattern: 'dots',
    patternColor: 'rgba(255, 255, 255, 0.12)',
  },
  {
    id: 'aura_holo_prism',
    name: 'Holo Prism',
    category: 'Pastel & Light',
    baseGradient: ['#FAF5FF', '#F0F9FF'],
    orbs: [
      { x: 0.15, y: 0.20, r: 0.65, color: 'rgba(103, 232, 249, 0.70)' },
      { x: 0.85, y: 0.25, r: 0.65, color: 'rgba(249, 168, 212, 0.70)' },
      { x: 0.75, y: 0.85, r: 0.62, color: 'rgba(110, 231, 183, 0.65)' },
      { x: 0.20, y: 0.80, r: 0.55, color: 'rgba(192, 132, 252, 0.50)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_pastel_mesh',
    name: 'Pastel Mesh',
    category: 'Pastel & Light',
    baseGradient: ['#F8FAFC', '#F1F5F9'],
    orbs: [
      { x: 0.20, y: 0.25, r: 0.65, color: 'rgba(192, 132, 252, 0.55)' },
      { x: 0.82, y: 0.22, r: 0.62, color: 'rgba(56, 189, 248, 0.55)' },
      { x: 0.65, y: 0.85, r: 0.65, color: 'rgba(251, 113, 133, 0.45)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_peach_cloud',
    name: 'Peach Aura',
    category: 'Pastel & Light',
    baseGradient: ['#FFF7ED', '#FEF2F2'],
    orbs: [
      { x: 0.18, y: 0.22, r: 0.68, color: 'rgba(253, 186, 116, 0.75)' },
      { x: 0.82, y: 0.78, r: 0.65, color: 'rgba(251, 113, 133, 0.55)' },
      { x: 0.80, y: 0.18, r: 0.55, color: 'rgba(216, 180, 254, 0.55)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_cotton_candy',
    name: 'Cotton Candy',
    category: 'Pastel & Light',
    baseGradient: ['#EFF6FF', '#FDF2F8'],
    orbs: [
      { x: 0.15, y: 0.78, r: 0.65, color: 'rgba(96, 165, 250, 0.62)' },
      { x: 0.85, y: 0.22, r: 0.65, color: 'rgba(244, 114, 182, 0.60)' },
      { x: 0.50, y: 0.50, r: 0.55, color: 'rgba(253, 224, 71, 0.45)' },
    ],
    pattern: 'none',
  },
  {
    id: 'aura_studio_frost',
    name: 'Studio Frost',
    category: 'Pastel & Light',
    baseGradient: ['#F8FAFC', '#E2E8F0'],
    orbs: [
      { x: 0.50, y: 0.30, r: 0.70, color: 'rgba(255, 255, 255, 0.90)' },
      { x: 0.15, y: 0.20, r: 0.60, color: 'rgba(186, 230, 253, 0.65)' },
      { x: 0.85, y: 0.85, r: 0.60, color: 'rgba(148, 163, 184, 0.35)' },
    ],
    pattern: 'grid',
    patternColor: 'rgba(15, 23, 42, 0.06)',
  },
  {
    id: 'aura_matcha_silk',
    name: 'Matcha Silk',
    category: 'Pastel & Light',
    baseGradient: ['#F0FDF4', '#ECFDF5'],
    orbs: [
      { x: 0.20, y: 0.20, r: 0.68, color: 'rgba(134, 239, 172, 0.75)' },
      { x: 0.82, y: 0.80, r: 0.65, color: 'rgba(94, 234, 212, 0.58)' },
      { x: 0.78, y: 0.18, r: 0.55, color: 'rgba(254, 240, 138, 0.60)' },
    ],
    pattern: 'none',
  },
  // 10 Galaxy & Cosmic Backgrounds
  {
    id: 'aura_andromeda_nebula',
    name: 'Andromeda',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#050114', '#160738', '#090D28'],
    orbs: [
      { x: 0.25, y: 0.30, r: 0.72, color: 'rgba(168, 85, 247, 0.58)' },
      { x: 0.78, y: 0.72, r: 0.68, color: 'rgba(236, 72, 153, 0.48)' },
      { x: 0.65, y: 0.18, r: 0.52, color: 'rgba(56, 189, 248, 0.42)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(255, 255, 255, 0.85)',
  },
  {
    id: 'aura_supernova_core',
    name: 'Supernova',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#07030A', '#1B0718', '#090B1A'],
    orbs: [
      { x: 0.50, y: 0.48, r: 0.62, color: 'rgba(249, 115, 22, 0.64)' },
      { x: 0.22, y: 0.22, r: 0.58, color: 'rgba(244, 63, 94, 0.48)' },
      { x: 0.82, y: 0.78, r: 0.60, color: 'rgba(56, 189, 248, 0.44)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(254, 243, 199, 0.85)',
  },
  {
    id: 'aura_milky_way',
    name: 'Milky Way',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#020617', '#0B1120', '#1E1B4B'],
    orbs: [
      { x: 0.20, y: 0.80, r: 0.75, color: 'rgba(99, 102, 241, 0.52)' },
      { x: 0.55, y: 0.45, r: 0.65, color: 'rgba(147, 197, 253, 0.36)' },
      { x: 0.85, y: 0.15, r: 0.60, color: 'rgba(192, 132, 252, 0.42)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(224, 242, 254, 0.90)',
  },
  {
    id: 'aura_event_horizon',
    name: 'Event Horizon',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#030305', '#0D0B14', '#181007'],
    orbs: [
      { x: 0.50, y: 0.50, r: 0.58, color: 'rgba(251, 191, 36, 0.45)' },
      { x: 0.20, y: 0.25, r: 0.55, color: 'rgba(234, 88, 12, 0.40)' },
      { x: 0.82, y: 0.80, r: 0.55, color: 'rgba(139, 92, 246, 0.35)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(253, 230, 138, 0.85)',
  },
  {
    id: 'aura_orion_veil',
    name: 'Orion Veil',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#020B18', '#042F2E', '#0F172A'],
    orbs: [
      { x: 0.18, y: 0.25, r: 0.70, color: 'rgba(20, 184, 166, 0.56)' },
      { x: 0.78, y: 0.70, r: 0.68, color: 'rgba(59, 130, 246, 0.52)' },
      { x: 0.52, y: 0.22, r: 0.50, color: 'rgba(167, 243, 208, 0.32)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(204, 251, 241, 0.88)',
  },
  {
    id: 'aura_cosmic_violet',
    name: 'Cosmic Violet',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#0B021D', '#1E0836', '#09090B'],
    orbs: [
      { x: 0.22, y: 0.72, r: 0.70, color: 'rgba(139, 92, 246, 0.62)' },
      { x: 0.80, y: 0.24, r: 0.62, color: 'rgba(217, 70, 239, 0.52)' },
      { x: 0.50, y: 0.50, r: 0.50, color: 'rgba(99, 102, 241, 0.38)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(245, 208, 254, 0.88)',
  },
  {
    id: 'aura_stardust_rose',
    name: 'Stardust Rose',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#130414', '#260824', '#0C0A1D'],
    orbs: [
      { x: 0.24, y: 0.24, r: 0.68, color: 'rgba(244, 114, 182, 0.56)' },
      { x: 0.80, y: 0.78, r: 0.65, color: 'rgba(168, 85, 247, 0.50)' },
      { x: 0.72, y: 0.20, r: 0.48, color: 'rgba(251, 191, 36, 0.34)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(252, 231, 243, 0.88)',
  },
  {
    id: 'aura_pulsar_cyan',
    name: 'Pulsar Cyan',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#020817', '#08203E', '#020617'],
    orbs: [
      { x: 0.50, y: 0.35, r: 0.66, color: 'rgba(6, 182, 212, 0.62)' },
      { x: 0.18, y: 0.80, r: 0.60, color: 'rgba(37, 99, 235, 0.55)' },
      { x: 0.85, y: 0.75, r: 0.55, color: 'rgba(125, 211, 252, 0.42)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(224, 242, 254, 0.92)',
  },
  {
    id: 'aura_crimson_eclipse',
    name: 'Crimson Eclipse',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#090205', '#1F0610', '#09090B'],
    orbs: [
      { x: 0.76, y: 0.28, r: 0.68, color: 'rgba(225, 29, 72, 0.62)' },
      { x: 0.22, y: 0.78, r: 0.65, color: 'rgba(249, 115, 22, 0.48)' },
      { x: 0.48, y: 0.48, r: 0.45, color: 'rgba(168, 85, 247, 0.34)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(254, 226, 226, 0.85)',
  },
  {
    id: 'aura_celestial_mint',
    name: 'Celestial Mint',
    category: 'Galaxy & Cosmic',
    baseGradient: ['#031214', '#072729', '#090D1A'],
    orbs: [
      { x: 0.22, y: 0.28, r: 0.68, color: 'rgba(52, 211, 153, 0.56)' },
      { x: 0.82, y: 0.76, r: 0.66, color: 'rgba(34, 211, 238, 0.50)' },
      { x: 0.50, y: 0.85, r: 0.52, color: 'rgba(129, 140, 248, 0.38)' },
    ],
    pattern: 'stars',
    patternColor: 'rgba(209, 250, 229, 0.88)',
  },
];

export const AURA_PRESETS_MAP = Object.fromEntries(
  AURA_BACKGROUND_PRESETS.map((preset) => [preset.id, preset])
);

/**
 * Generates CSS background styling for crisp UI swatches matching the canvas render.
 */
export function getAuraCssStyle(preset) {
  if (!preset) return {};
  const radialLayers = preset.orbs.map((orb) => {
    const px = Math.round(orb.x * 100);
    const py = Math.round(orb.y * 100);
    const pr = Math.round(orb.r * 92);
    return `radial-gradient(circle at ${px}% ${py}%, ${orb.color} 0%, transparent ${pr}%)`;
  });
  const baseLayer = `linear-gradient(135deg, ${preset.baseGradient.join(', ')})`;
  const starLayers =
    preset.pattern === 'stars'
      ? [
          'radial-gradient(1px 1px at 14% 22%, rgba(255,255,255,0.9) 100%, transparent)',
          'radial-gradient(1.5px 1.5px at 78% 18%, rgba(255,255,255,0.8) 100%, transparent)',
          'radial-gradient(1px 1px at 42% 68%, rgba(255,255,255,0.75) 100%, transparent)',
          'radial-gradient(1.5px 1.5px at 86% 74%, rgba(255,255,255,0.85) 100%, transparent)',
          'radial-gradient(1px 1px at 26% 84%, rgba(255,255,255,0.7) 100%, transparent)',
        ]
      : [];

  return {
    backgroundColor: preset.baseGradient[0],
    backgroundImage: [...starLayers, ...radialLayers, baseLayer].join(', '),
  };
}

/**
 * Renders a multi-layered Neon / Aura Mesh background directly onto an HTML5 2D canvas.
 */
export function drawAuraBackground(ctx, width, height, preset) {
  if (!ctx || !preset) return;

  // 1. Base diagonal gradient
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  const colors = preset.baseGradient;
  const step = colors.length > 1 ? 1 / (colors.length - 1) : 1;
  colors.forEach((col, i) => {
    baseGrad.addColorStop(i * step, col);
  });
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Glowing Aura / Mesh Orbs
  const maxDim = Math.max(width, height);
  for (const orb of preset.orbs) {
    const cx = width * orb.x;
    const cy = height * orb.y;
    const radius = maxDim * orb.r;
    const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    radGrad.addColorStop(0, orb.color);
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 3. Optional crisp texture pattern
  if (preset.pattern === 'grid') {
    ctx.save();
    ctx.strokeStyle = preset.patternColor || 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = Math.max(1, maxDim * 0.0012);
    const gridSize = Math.max(26, Math.round(maxDim * 0.036));
    ctx.beginPath();
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.restore();
  } else if (preset.pattern === 'dots') {
    ctx.save();
    ctx.fillStyle = preset.patternColor || 'rgba(255, 255, 255, 0.1)';
    const dotSpacing = Math.max(18, Math.round(maxDim * 0.025));
    const dotRadius = Math.max(1.2, maxDim * 0.0016);
    for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
      for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  } else if (preset.pattern === 'beams') {
    ctx.save();
    const beamGrad = ctx.createLinearGradient(0, 0, width, height);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    beamGrad.addColorStop(0.45, preset.patternColor || 'rgba(255, 255, 255, 0.06)');
    beamGrad.addColorStop(0.55, preset.patternColor || 'rgba(255, 255, 255, 0.06)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  } else if (preset.pattern === 'stars') {
    ctx.save();
    const starColor = preset.patternColor || 'rgba(255, 255, 255, 0.85)';
    const starCount = 95;
    for (let i = 1; i <= starCount; i++) {
      // Deterministic pseudo-random coordinates & sizes for crisp, consistent HD exports
      const rx = ((Math.sin(i * 12.9898 + 78.233) * 43758.5453) % 1 + 1) % 1;
      const ry = ((Math.sin(i * 93.989 + 19.133) * 24634.6345) % 1 + 1) % 1;
      const rs = ((Math.sin(i * 41.231) * 15731.743) % 1 + 1) % 1;
      const x = rx * width;
      const y = ry * height;
      const radius = Math.max(0.8, (0.6 + rs * 1.4) * (maxDim / 1000));
      ctx.globalAlpha = 0.25 + rs * 0.7;
      ctx.fillStyle = starColor;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
