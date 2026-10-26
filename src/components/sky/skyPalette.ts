/* Time-of-day palette for the scroll-driven sky and sea.
   t = 0 sunrise → 0.28 morning → 0.5 afternoon → 0.62 golden hour → 0.72 sunset → 0.82 dusk → 1 midnight. */

export type RGBA = [number, number, number, number];

export function parseColor(input: string): RGBA {
  const c = input.trim();
  if (c.startsWith('#')) {
    const hex = c.slice(1);
    const full = hex.length === 3 ? hex.replace(/./g, (ch) => ch + ch) : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
      full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
    ];
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`Unsupported color: ${input}`);
  const [r, g, b, a = '1'] = m[1].split(',').map((s) => s.trim());
  return [Number(r), Number(g), Number(b), Number(a)];
}

export function toCss([r, g, b, a]: RGBA): string {
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function mix(a: RGBA, b: RGBA, k: number): RGBA {
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
}

export function withAlpha([r, g, b]: RGBA, a: number): RGBA {
  return [r, g, b, a];
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const k = clamp01((x - edge0) / (edge1 - edge0));
  return k * k * (3 - 2 * k);
}

/** Piecewise-linear sampling of keyframes sorted by t. */
function sampleFrames<T>(frames: { t: number; v: T }[], t: number, blend: (a: T, b: T, k: number) => T): T {
  if (t <= frames[0].t) return frames[0].v;
  for (let i = 1; i < frames.length; i++) {
    const prev = frames[i - 1];
    const next = frames[i];
    if (t <= next.t) return blend(prev.v, next.v, (t - prev.t) / (next.t - prev.t));
  }
  return frames[frames.length - 1].v;
}

// ---------------------------------------------------------------------------
// Sky & sea colours
// ---------------------------------------------------------------------------

const SKY_KEYS = [
  'top',
  'mid',
  'low',
  'haze',
  'sun',
  'sunGlow',
  'cloudLit',
  'cloudShade',
  'leak',
  'seaHorizon',
  'seaDeep',
  'glitter',
] as const;
type SkyKey = (typeof SKY_KEYS)[number];
export type SkyColors = Record<SkyKey, RGBA>;

// Cloud "lit" = upper surfaces, "shade" = undersides. Around sunset the undersides
// glow (lit from below by the low sun) while the tops fall into shadow.
const RAW_SKY: { t: number; v: Record<SkyKey, string> }[] = [
  {
    t: 0,
    v: {
      top: '#8098c4',
      mid: '#d9b4c0',
      low: '#f9bf9a',
      haze: '#f8b48c',
      sun: '#ffc387',
      sunGlow: 'rgba(255,170,110,0.7)',
      cloudLit: '#fff3e6',
      cloudShade: '#b896ad',
      leak: 'rgba(255,170,120,0.32)',
      seaHorizon: '#d9ae9f',
      seaDeep: '#4a5b85',
      glitter: '#ffdcae',
    },
  },
  {
    // Bright summer morning: saturated but light enough for dark text.
    t: 0.28,
    v: {
      top: '#4f9be6',
      mid: '#8cc3f0',
      low: '#d2e8f7',
      haze: '#f5f1e4',
      sun: '#fffdf4',
      sunGlow: 'rgba(255,248,222,0.55)',
      cloudLit: '#ffffff',
      cloudShade: '#a4bcd9',
      leak: 'rgba(255,236,200,0.16)',
      seaHorizon: '#9cc4e2',
      seaDeep: '#1d5c9c',
      glitter: '#fffbea',
    },
  },
  {
    t: 0.5,
    v: {
      top: '#4691dd',
      mid: '#86bbe9',
      low: '#dbe8ee',
      haze: '#f7ebd5',
      sun: '#fff6dc',
      sunGlow: 'rgba(255,236,190,0.55)',
      cloudLit: '#fffaf0',
      cloudShade: '#a2b4cf',
      leak: 'rgba(255,215,160,0.18)',
      seaHorizon: '#a9c9de',
      seaDeep: '#205e9a',
      glitter: '#fff2cf',
    },
  },
  {
    // Golden hour: everything warms, clouds catch amber light.
    t: 0.62,
    v: {
      top: '#5873b0',
      mid: '#e1b190',
      low: '#ffcf8a',
      haze: '#ffd9a0',
      sun: '#ffd08a',
      sunGlow: 'rgba(255,190,100,0.6)',
      cloudLit: '#fff0d8',
      cloudShade: '#c98f7a',
      leak: 'rgba(255,170,90,0.35)',
      seaHorizon: '#d9ad7f',
      seaDeep: '#2d4e7b',
      glitter: '#ffd68a',
    },
  },
  {
    t: 0.72,
    v: {
      top: '#424f86',
      mid: '#c27890',
      low: '#ffa25e',
      haze: '#ffc68c',
      sun: '#ffa060',
      sunGlow: 'rgba(255,140,64,0.6)',
      cloudLit: '#9a6b8c',
      cloudShade: '#ffa877',
      leak: 'rgba(255,130,70,0.42)',
      seaHorizon: '#d68457',
      seaDeep: '#342a51',
      glitter: '#ffae62',
    },
  },
  {
    t: 0.82,
    v: {
      top: '#1b1f44',
      mid: '#4c3866',
      low: '#bd5c49',
      haze: '#db7f51',
      sun: '#ff7a3d',
      sunGlow: 'rgba(255,110,50,0.45)',
      cloudLit: '#3b3053',
      cloudShade: '#cf6a5a',
      leak: 'rgba(220,90,60,0.25)',
      seaHorizon: '#8a4a44',
      seaDeep: '#15142a',
      glitter: '#ff8a4a',
    },
  },
  {
    t: 1,
    v: {
      top: '#020308',
      mid: '#05070f',
      low: '#0a0d1b',
      haze: '#0f1426',
      sun: '#ff7a3d',
      sunGlow: 'rgba(255,110,50,0)',
      cloudLit: '#252d47',
      cloudShade: '#06080f',
      leak: 'rgba(0,0,0,0)',
      seaHorizon: '#111a2e',
      seaDeep: '#020308',
      glitter: '#d6e0ff',
    },
  },
];

const SKY_FRAMES = RAW_SKY.map(({ t, v }) => ({
  t,
  v: Object.fromEntries(SKY_KEYS.map((k) => [k, parseColor(v[k])])) as SkyColors,
}));

export function skyColorsAt(t: number): SkyColors {
  return sampleFrames(SKY_FRAMES, t, (a, b, k) =>
    Object.fromEntries(SKY_KEYS.map((key) => [key, mix(a[key], b[key], k)])) as SkyColors,
  );
}

// ---------------------------------------------------------------------------
// Scalar tracks: cloud cover ("loads of clouds" around sunset), light rays, sea glitter
// ---------------------------------------------------------------------------

export type CloudLayerKey = 'far' | 'mid' | 'near' | 'bank';
type Track = CloudLayerKey | 'rays' | 'glitter';

const RAW_TRACKS: Record<Track, [number, number][]> = {
  far: [[0, 0.7], [0.28, 0.75], [0.5, 0.75], [0.62, 0.85], [0.72, 0.95], [0.85, 0.75], [1, 0.32]],
  mid: [[0, 0.8], [0.28, 0.9], [0.5, 0.9], [0.72, 1], [0.85, 0.85], [1, 0.38]],
  near: [[0, 0.55], [0.28, 0.7], [0.5, 0.7], [0.72, 0.95], [0.85, 0.8], [1, 0.3]],
  bank: [[0, 0.25], [0.45, 0.15], [0.62, 0.75], [0.74, 1], [0.86, 0.9], [1, 0.2]],
  rays: [[0, 0.3], [0.28, 0.5], [0.5, 0.5], [0.62, 0.6], [0.72, 0.4], [0.8, 0], [1, 0]],
  // Strong path under a low sun, sparkle at midday, fades at dusk, returns as moonlight.
  glitter: [[0, 0.95], [0.28, 0.55], [0.5, 0.55], [0.62, 0.85], [0.72, 1], [0.8, 0.55], [0.86, 0.08], [0.93, 0.25], [1, 0.6]],
};

const TRACK_FRAMES = Object.fromEntries(
  Object.entries(RAW_TRACKS).map(([key, pts]) => [key, pts.map(([t, v]) => ({ t, v }))]),
) as Record<Track, { t: number; v: number }[]>;

export function trackAt(track: Track, t: number): number {
  return sampleFrames(TRACK_FRAMES[track], t, lerp);
}

// ---------------------------------------------------------------------------
// UI tokens: day (light glass, dark text) → night (dark glass, light text)
// ---------------------------------------------------------------------------

const UI_KEYS = [
  'ink',
  'ink-2',
  'slate',
  'ash',
  'surface',
  'surface-solid',
  'band',
  'mist',
  'hairline',
  'hairline-strong',
  'canvas',
  'scrim',
] as const;

// Muted text is darker than on a plain page: it sits on a bright, moving sky.
const UI_DAY: Record<(typeof UI_KEYS)[number], string> = {
  ink: '#14161a',
  'ink-2': '#23262b',
  slate: '#3a3f47',
  ash: '#5d626b',
  surface: 'rgba(255,255,255,0.74)',
  'surface-solid': '#ffffff',
  band: 'rgba(255,255,255,0.42)',
  mist: 'rgba(255,255,255,0.6)',
  hairline: 'rgba(20,22,26,0.14)',
  'hairline-strong': 'rgba(20,22,26,0.22)',
  canvas: 'rgba(251,250,247,0.62)',
  scrim: 'rgba(255,251,244,0.58)',
};

const UI_NIGHT: typeof UI_DAY = {
  ink: '#f3efe8',
  'ink-2': '#dcd7cf',
  slate: '#a6a3a0',
  ash: '#7a797c',
  surface: 'rgba(14,16,24,0.62)',
  'surface-solid': '#12141c',
  band: 'rgba(255,255,255,0.05)',
  mist: 'rgba(255,255,255,0.08)',
  hairline: 'rgba(255,255,255,0.10)',
  'hairline-strong': 'rgba(255,255,255,0.18)',
  canvas: 'rgba(8,10,16,0.62)',
  scrim: 'rgba(3,5,10,0.5)',
};

const UI_DAY_P = UI_KEYS.map((k) => parseColor(UI_DAY[k]));
const UI_NIGHT_P = UI_KEYS.map((k) => parseColor(UI_NIGHT[k]));

/** `night` in 0..1 → CSS custom properties for the page tokens. */
export function uiTokensAt(night: number): [string, string][] {
  return UI_KEYS.map((k, i) => [`--${k}`, toCss(mix(UI_DAY_P[i], UI_NIGHT_P[i], night))]);
}

/** How "night" the UI should be for a given time of day. */
export function nightnessAt(t: number): number {
  return smoothstep(0.84, 0.95, t);
}
