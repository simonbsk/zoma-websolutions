import { THEME_BG } from '../../theme/ThemeProvider';
import { MAX_BLOBS, MAX_DROPS, MAX_RIPPLES, type InkFrame, type Rgb } from './inkGl';

/*
 * Choreography of the ink background.
 *
 * Story (homepage):
 *   0.5 s after load three droplets fall into the page and bloom into ink — the white turns out
 *   to be liquid. Scrolling then carries them along: they drift, wake up, merge, split, throw off
 *   droplets and grow more vivid, until the showcase arrives and each blob dissolves into the
 *   website mockup of its colour. At the closing call to action, three fresh drops fall again.
 * Calm (start page):
 *   the three inks rest at the edges and breathe.
 *
 * Inputs and outputs are plain numbers in CSS pixels; the shader works in viewport heights.
 */

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Corner radius in px — the blob takes this shape when it merges into the box. */
  radius: number;
}

export interface SceneInput {
  /** Seconds since the background mounted. */
  time: number;
  dt: number;
  vw: number;
  vh: number;
  /** Smoothed scroll speed in px/s, positive while scrolling down. */
  scrollVel: number;
  /** 0 at the top of the page, 1 when the showcase reaches the bottom of the viewport. */
  story: number;
  /** Mockups the blobs dissolve into, by colour (iris, saffron, verdant), in viewport px. */
  targets: (Box | null)[];
  /** The closing call to action, in viewport px. */
  cta: Box | null;
  dark: boolean;
}

export interface SceneOutput {
  frame: InkFrame;
  /** How far each mockup has materialised (0–1), by colour. */
  reveal: [number, number, number];
  /** True while something moves that deserves the full frame rate. */
  busy: boolean;
}

export interface InkScene {
  step(input: SceneInput): SceneOutput;
}

// ---------------------------------------------------------------------------
// Helpers

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const bell = (v: number, centre: number, width: number) => Math.exp(-(((v - centre) / width) ** 2));
/** Frame-rate independent exponential approach. */
const follow = (current: number, target: number, dt: number, tau: number) =>
  current + (target - current) * (1 - Math.exp(-dt / tau));

const hex = (value: string): Rgb => [
  parseInt(value.slice(1, 3), 16) / 255,
  parseInt(value.slice(3, 5), 16) / 255,
  parseInt(value.slice(5, 7), 16) / 255,
];

const BG: Record<'light' | 'dark', Rgb> = { light: hex(THEME_BG.light), dark: hex(THEME_BG.dark) };
const PALETTE: Record<'light' | 'dark', [Rgb, Rgb, Rgb]> = {
  light: [hex('#8052ff'), hex('#ffb829'), hex('#15846e')],
  // Slightly lifted on #181818 so the deep green still glows.
  dark: [hex('#8b5fff'), hex('#ffbd3a'), hex('#1fa386')],
};

/** Slow, smooth pseudo-random wander in [-1, 1]. */
const wander = (t: number, seed: number) =>
  Math.sin(t * 0.31 + seed * 1.7) * 0.6 + Math.sin(t * 0.17 + seed * 3.1) * 0.4;

type Key = readonly [s: number, x: number, y: number, r: number];

const catmullRom = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/** Samples a keyframe path at story progress `s`: [x (vw), y (vh), r (of the short side)]. */
export function sampleKeys(keys: readonly Key[], s: number): [number, number, number] {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (s <= first[0]) return [first[1], first[2], first[3]];
  if (s >= last[0]) return [last[1], last[2], last[3]];
  let i = 0;
  while (s > keys[i + 1][0]) i++;
  const k0 = keys[Math.max(0, i - 1)];
  const k1 = keys[i];
  const k2 = keys[i + 1];
  const k3 = keys[Math.min(keys.length - 1, i + 2)];
  const t = (s - k1[0]) / (k2[0] - k1[0]);
  return [
    catmullRom(k0[1], k1[1], k2[1], k3[1], t),
    catmullRom(k0[2], k1[2], k2[2], k3[2], t),
    catmullRom(k0[3], k1[3], k2[3], k3[3], t),
  ];
}

// ---------------------------------------------------------------------------
// The story paths: iris, saffron, verdant. [story, x (of width), y (of height), radius (of short side)]

export const PATHS: readonly (readonly Key[])[] = [
  [
    [0.0, 0.6, 0.44, 0.21],
    [0.14, 0.82, 0.3, 0.2],
    [0.28, 0.88, 0.64, 0.19],
    [0.4, 0.33, 0.7, 0.18],
    [0.5, 0.37, 0.7, 0.18],
    [0.62, 0.12, 0.38, 0.18],
    [0.72, 0.44, 0.48, 0.17],
    [0.79, 0.47, 0.5, 0.16],
    [0.88, 0.2, 0.24, 0.15],
    [1.0, 0.3, 0.86, 0.14],
  ],
  [
    [0.0, 0.84, 0.24, 0.16],
    [0.14, 0.88, 0.7, 0.16],
    [0.28, 0.14, 0.26, 0.16],
    [0.4, 0.18, 0.24, 0.16],
    [0.5, 0.8, 0.3, 0.17],
    [0.62, 0.84, 0.36, 0.17],
    [0.72, 0.56, 0.44, 0.16],
    [0.79, 0.53, 0.48, 0.15],
    [0.88, 0.82, 0.22, 0.14],
    [1.0, 0.52, 0.9, 0.13],
  ],
  [
    [0.0, 0.8, 0.74, 0.18],
    [0.14, 0.18, 0.72, 0.18],
    [0.28, 0.24, 0.8, 0.17],
    [0.4, 0.4, 0.76, 0.17],
    [0.5, 0.33, 0.68, 0.17],
    [0.62, 0.64, 0.82, 0.17],
    [0.72, 0.5, 0.57, 0.16],
    [0.79, 0.5, 0.53, 0.15],
    [0.88, 0.7, 0.8, 0.14],
    [1.0, 0.72, 0.86, 0.14],
  ],
];

/** Moments where blobs throw off droplets: [story centre, width, strength per colour]. */
const SCATTERS: readonly (readonly [number, number, readonly [number, number, number]])[] = [
  [0.57, 0.06, [0.2, 1, 0.2]],
  [0.87, 0.055, [1.25, 1.25, 1.25]],
];

const DEPTH = [1, 0.7, 0.85];

const DROP_DELAY = 0.5;
const DROP_STAGGER = [0, 0.16, 0.3];
const FALL = 0.62;
const BLOOM = 2.4;
const INTRO_END = DROP_DELAY + DROP_STAGGER[2] + FALL;

/** Where the closing drops land, as fractions of the call-to-action box. */
const CTA_SPOTS: readonly (readonly [number, number])[] = [
  [-0.02, 0.32],
  [1.02, 0.12],
  [0.7, 1.04],
];

// Blob slots: 0–2 main inks, 3–8 two satellites each, 9–11 the closing drops.
const SAT = (main: number, j: number) => 3 + main * 2 + j;
const CTA_SLOT = (i: number) => 9 + i;

interface Ripple {
  x: number;
  y: number;
  /** 'cta' ripples are stored as fractions of the call-to-action box so they scroll with it. */
  anchor: 'view' | 'cta';
  t0: number;
  amp: number;
}

function makeFrame(): InkFrame {
  return {
    time: 0,
    bg: BG.light,
    dark: 0,
    palette: PALETTE.light,
    blobA: new Float32Array(MAX_BLOBS * 4),
    blobB: new Float32Array(MAX_BLOBS * 4),
    ripples: new Float32Array(MAX_RIPPLES * 4),
    drops: new Float32Array(MAX_DROPS * 4),
    vibrancy: 0,
    alive: 0,
    liquid: 0,
  };
}

function setBlob(
  f: InkFrame,
  slot: number,
  vh: number,
  b: { x: number; y: number; hw: number; hh: number; corner: number; opacity: number; colour: number; calm?: number; stretch?: number },
) {
  const a = slot * 4;
  f.blobA[a] = b.x / vh;
  f.blobA[a + 1] = b.y / vh;
  f.blobA[a + 2] = Math.max(0, b.hw) / vh;
  f.blobA[a + 3] = Math.max(0, b.hh) / vh;
  f.blobB[a] = Math.max(0, b.corner) / vh;
  f.blobB[a + 1] = clamp(b.opacity, 0, 2);
  f.blobB[a + 2] = b.colour + Math.min(0.999, clamp(b.calm ?? 0));
  f.blobB[a + 3] = b.stretch ?? 0;
}

function setDrop(f: InkFrame, slot: number, vh: number, x: number, y: number, r: number, colour: number, opacity: number) {
  const a = slot * 4;
  f.drops[a] = x / vh;
  f.drops[a + 1] = y / vh;
  f.drops[a + 2] = r / vh;
  f.drops[a + 3] = colour + Math.min(0.999, clamp(opacity));
}

function applyTheme(f: InkFrame, dark: boolean) {
  f.bg = dark ? BG.dark : BG.light;
  f.palette = dark ? PALETTE.dark : PALETTE.light;
  f.dark = dark ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Story

export function createStoryScene({ still = false }: { still?: boolean } = {}): InkScene {
  const frame = makeFrame();
  const mains = [0, 1, 2].map(() => ({ x: NaN, y: NaN, r: NaN }));
  const merge = [0, 0, 0];
  const scatter = [0, 0, 0];
  const impacted = [false, false, false];
  const ripples: Ripple[] = [];
  let ctaAt: number | null = null;
  const ctaImpacted = [false, false, false];

  const addRipple = (r: Ripple) => {
    ripples.push(r);
    if (ripples.length > MAX_RIPPLES) ripples.shift();
  };

  return {
    step(input) {
      const { dt, vw, vh, dark } = input;
      // A still scene (reduced motion) is a single, settled moment at the top of the story.
      const t = still ? 30 : input.time;
      const s = still ? 0 : clamp(input.story);
      const vel = still ? 0 : input.scrollVel;
      const unit = Math.min(vw, vh);
      applyTheme(frame, dark);
      frame.time = t;
      frame.blobB.fill(0);
      frame.drops.fill(0);
      frame.ripples.fill(0);

      // Story targets: path + drag from scrolling + a wander that grows as the story wakes up.
      const alive = 0.12 + 0.88 * smoothstep(0.04, 0.72, s);
      const swirl = bell(s, 0.76, 0.07) * 0.9 * Math.sin(t * 0.35);
      for (let i = 0; i < 3; i++) {
        const [kx, ky, kr] = sampleKeys(PATHS[i], s);
        let x = kx * vw;
        let y = ky * vh;
        if (swirl) {
          const dx = x - vw / 2;
          const dy = y - vh / 2;
          const c = Math.cos(swirl);
          const sn = Math.sin(swirl);
          x = vw / 2 + dx * c - dy * sn;
          y = vh / 2 + dx * sn + dy * c;
        }
        x += wander(t, i * 2.3) * alive * vw * 0.035;
        y += wander(t * 0.9, i * 4.1 + 1) * alive * vh * 0.035;
        y += clamp(-vel * 0.045 * DEPTH[i], -vh * 0.12, vh * 0.12);
        const r = kr * unit * (1 + 0.05 * alive * Math.sin(t * 0.9 + i * 2));
        const m = mains[i];
        if (Number.isNaN(m.x) || still) {
          m.x = x;
          m.y = y;
          m.r = r;
        } else {
          m.x = follow(m.x, x, dt, 0.45);
          m.y = follow(m.y, y, dt, 0.45);
          m.r = follow(m.r, r, dt, 0.45);
        }
      }

      // The intro: drops fall, hit the surface, bloom.
      const bloom = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        const start = DROP_DELAY + DROP_STAGGER[i];
        const impact = start + FALL;
        if (still) {
          bloom[i] = 1;
          continue;
        }
        if (t >= start && t < impact) {
          const u = (t - start) / FALL;
          const y = lerp(-vh * 0.04, mains[i].y, u * u);
          setDrop(frame, i, vh, mains[i].x, y, vh * 0.012, i, smoothstep(0, 0.08, u));
        }
        if (t >= impact && !impacted[i]) {
          impacted[i] = true;
          addRipple({ x: mains[i].x, y: mains[i].y, anchor: 'view', t0: impact, amp: 1 });
          addRipple({ x: mains[i].x, y: mains[i].y, anchor: 'view', t0: impact + 0.14, amp: 0.5 });
        }
        bloom[i] = t >= impact ? easeOutCubic(clamp((t - impact) / BLOOM)) : 0;
      }
      const firstImpact = DROP_DELAY + FALL;
      frame.liquid = still ? 1 : smoothstep(firstImpact - 0.05, firstImpact + 1.2, t);

      // Merging into the mockups.
      const reveal: [number, number, number] = [0, 0, 0];
      let mergeSum = 0;
      let busy = !still && (t < INTRO_END + BLOOM + 1 || Math.abs(vel) > 4);
      for (let i = 0; i < 3; i++) {
        const box = still ? null : input.targets[i];
        const w = box ? clamp((vh - (box.top + box.height / 2)) / (vh * 0.45)) : 0;
        const before = merge[i];
        merge[i] = follow(merge[i], w, dt, 0.2);
        if (Math.abs(merge[i] - before) > 1e-4) busy = true;
        reveal[i] = smoothstep(0.8, 1, merge[i]);
        mergeSum += merge[i];
      }
      const mergeAvg = mergeSum / 3;

      // Scatter events, smoothed so a fast scroll doesn't make droplets jump.
      for (let i = 0; i < 3; i++) {
        let target = 0;
        for (const [centre, width, strength] of SCATTERS) target += bell(s, centre, width) * strength[i];
        scatter[i] = still ? 0 : follow(scatter[i], target * (1 - merge[i]), dt, 0.3);
      }

      for (let i = 0; i < 3; i++) {
        const m = mains[i];
        const b = bloom[i];
        if (b <= 0) continue;
        const box = still ? null : input.targets[i];
        const e = easeInOutCubic(merge[i]);
        const g = smoothstep(0.3, 1, merge[i]);
        const r = m.r * (0.08 + 0.92 * b) * (1 - 0.15 * Math.min(1, scatter[i]));
        // Fresh ink is concentrated and thins out as it spreads.
        const opacity = smoothstep(0, 0.12, b) * lerp(1, 0.85, g) * (1 + 0.7 * (1 - b));
        const stretch = clamp((Math.abs(vel) / vh) * 0.12 * DEPTH[i], 0, 0.45) * (1 - merge[i]);
        const inset = 6;
        setBlob(frame, i, vh, {
          x: box ? lerp(m.x, box.left + box.width / 2, e) : m.x,
          y: box ? lerp(m.y, box.top + box.height / 2, e) : m.y,
          hw: box ? lerp(r, box.width / 2 - inset, g) : r,
          hh: box ? lerp(r, box.height / 2 - inset, g) : r,
          corner: box ? lerp(r, box.radius, g) : r,
          opacity,
          colour: i,
          calm: g,
          stretch,
        });

        // Satellites: absorbed in their parent until a scatter flings them out.
        const amp = scatter[i];
        if (amp < 0.02) continue;
        for (let j = 0; j < 2; j++) {
          const angle = i * 2.1 + j * Math.PI + t * 0.15 * (j ? 1 : -1) + wander(t, i * 5 + j) * 0.6;
          const dist = amp * unit * (0.32 + 0.14 * j);
          setBlob(frame, SAT(i, j), vh, {
            x: m.x + Math.cos(angle) * dist * 1.25,
            y: m.y + Math.sin(angle) * dist,
            hw: r * (0.34 - 0.06 * j) * smoothstep(0.05, 0.35, amp),
            hh: r * (0.34 - 0.06 * j) * smoothstep(0.05, 0.35, amp),
            corner: r,
            opacity,
            colour: i,
            stretch,
          });
        }
      }

      // The closing drops, anchored to the call to action so they scroll with it.
      const cta = still ? null : input.cta;
      if (cta && ctaAt === null && cta.top < vh * 0.85) ctaAt = Math.max(t, INTRO_END + 0.1);
      if (cta && ctaAt !== null) {
        for (let i = 0; i < 3; i++) {
          const start = ctaAt + 0.25 + i * 0.17;
          const impact = start + FALL * 0.95;
          const [fx, fy] = CTA_SPOTS[i];
          const x = cta.left + cta.width * fx + wander(t, i + 9) * unit * 0.02;
          const y = cta.top + cta.height * fy + wander(t * 0.8, i + 3) * unit * 0.02;
          if (t >= start && t < impact) {
            const u = (t - start) / (impact - start);
            setDrop(frame, i, vh, x, lerp(-vh * 0.04, y, u * u), vh * 0.011, i, smoothstep(0, 0.08, u));
            busy = true;
          }
          if (t >= impact && !ctaImpacted[i]) {
            ctaImpacted[i] = true;
            addRipple({ x: fx, y: fy, anchor: 'cta', t0: impact, amp: 0.8 });
          }
          const b = t >= impact ? easeOutCubic(clamp((t - impact) / 2.2)) : 0;
          if (b <= 0) continue;
          if (b < 1) busy = true;
          const r = unit * 0.15 * (0.08 + 0.92 * b) * (1 + 0.05 * Math.sin(t * 0.8 + i));
          const opacity = smoothstep(0, 0.12, b) * 0.95 * (1 + 0.7 * (1 - b));
          setBlob(frame, CTA_SLOT(i), vh, { x, y, hw: r, hh: r, corner: r, opacity, colour: i });
        }
      }

      ripples.forEach((rp, k) => {
        const age = t - rp.t0;
        if (age < 0 || age > 9) return;
        const x = rp.anchor === 'cta' ? (cta ? cta.left + cta.width * rp.x : NaN) : rp.x;
        const y = rp.anchor === 'cta' ? (cta ? cta.top + cta.height * rp.y : NaN) : rp.y;
        if (Number.isNaN(x)) return;
        frame.ripples.set([x / vh, y / vh, age, rp.amp], k * 4);
      });

      const introTurbulence = impacted[0] ? 0.85 * (1 - Math.min(...bloom)) : 0;
      frame.vibrancy = Math.max(0.24 + 0.76 * smoothstep(0.06, 0.85, s), mergeAvg);
      frame.alive = Math.max(alive, introTurbulence) * (1 - 0.6 * mergeAvg);
      return { frame, reveal, busy };
    },
  };
}

// ---------------------------------------------------------------------------
// Calm

const CALM_SPOTS: readonly (readonly [number, number, number])[] = [
  [0.9, 0.16, 0.26],
  [0.04, 0.6, 0.2],
  [0.78, 0.98, 0.24],
];

export function createCalmScene({ still = false }: { still?: boolean } = {}): InkScene {
  const frame = makeFrame();
  const pos = CALM_SPOTS.map(() => ({ x: NaN, y: NaN }));

  return {
    step(input) {
      const { dt, vw, vh, dark } = input;
      const t = still ? 30 : input.time;
      const vel = still ? 0 : input.scrollVel;
      const unit = Math.min(vw, vh);
      applyTheme(frame, dark);
      frame.time = t;
      frame.blobB.fill(0);
      frame.drops.fill(0);
      frame.ripples.fill(0);

      const fade = still ? 1 : smoothstep(0.1, 1.6, t);
      CALM_SPOTS.forEach(([fx, fy, fr], i) => {
        const x = fx * vw + wander(t * 0.7, i * 3.3) * vw * 0.025;
        const y = fy * vh + wander(t * 0.6, i * 1.9 + 2) * vh * 0.025 + clamp(-vel * 0.03, -vh * 0.06, vh * 0.06);
        const p = pos[i];
        if (Number.isNaN(p.x) || still) {
          p.x = x;
          p.y = y;
        } else {
          p.x = follow(p.x, x, dt, 0.6);
          p.y = follow(p.y, y, dt, 0.6);
        }
        const r = fr * unit * (0.7 + 0.3 * easeOutCubic(fade)) * (1 + 0.04 * Math.sin(t * 0.7 + i * 2));
        setBlob(frame, i, vh, { x: p.x, y: p.y, hw: r, hh: r, corner: r, opacity: fade * 0.9, colour: i });
      });

      frame.liquid = 1;
      frame.vibrancy = 0.42;
      frame.alive = 0.3;
      return { frame, reveal: [1, 1, 1], busy: !still && (t < 2 || Math.abs(vel) > 4) };
    },
  };
}
