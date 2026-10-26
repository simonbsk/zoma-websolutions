/* Procedural textures for the sky: drifting clouds, the sea and stars.
   Pixel generation is pure, so it runs in a Web Worker (sky.worker.ts) when available. */

import type { CloudLayerKey } from './skyPalette';

// ---------------------------------------------------------------------------
// Noise
// ---------------------------------------------------------------------------

function hash(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const fade = (t: number) => t * t * (3 - 2 * t);
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Value noise. With periodX > 0 it tiles seamlessly on the x axis. */
function valueNoise(x: number, y: number, periodX: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = fade(x - ix);
  const fy = fade(y - iy);
  const x0 = periodX > 0 ? mod(ix, periodX) : ix;
  const x1 = periodX > 0 ? mod(ix + 1, periodX) : ix + 1;
  const a = hash(x0, iy, seed);
  const b = hash(x1, iy, seed);
  const c = hash(x0, iy + 1, seed);
  const d = hash(x1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function smooth(e0: number, e1: number, x: number): number {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
}

// ---------------------------------------------------------------------------
// Clouds — each layer yields a body mask and an underside-shading mask
// ---------------------------------------------------------------------------

export interface CloudLayerSpec {
  key: CloudLayerKey;
  seed: number;
  cellsX: number; // base noise cells across the tile (periodic)
  cellsY: number; // base noise cells down the tile
  octaves: number;
  coverage: number; // density threshold — higher = fewer clouds
  softness: number; // threshold width — higher = softer edges
  band: [number, number]; // vertical range (0 = top of the layer) where clouds live
}

export const CLOUD_LAYERS: CloudLayerSpec[] = [
  { key: 'far', seed: 11, cellsX: 7, cellsY: 6, octaves: 6, coverage: 0.52, softness: 0.1, band: [0.02, 0.5] },
  { key: 'bank', seed: 29, cellsX: 3, cellsY: 10, octaves: 6, coverage: 0.5, softness: 0.12, band: [0.5, 0.92] },
  { key: 'mid', seed: 47, cellsX: 4, cellsY: 4, octaves: 6, coverage: 0.52, softness: 0.11, band: [0.12, 0.8] },
  { key: 'near', seed: 83, cellsX: 3, cellsY: 3, octaves: 6, coverage: 0.54, softness: 0.12, band: [0.55, 1.08] },
];

const CLOUD_W = 960;
const CLOUD_H = 720;

function cloudFbm(u: number, v: number, spec: CloudLayerSpec, octaves = spec.octaves): number {
  let amp = 0.5;
  let sum = 0;
  let norm = 0;
  let cx = spec.cellsX;
  let cy = spec.cellsY;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(u * cx, v * cy, cx, spec.seed + o * 31);
    norm += amp;
    amp *= 0.55;
    cx *= 2;
    cy *= 2;
  }
  return sum / norm;
}

function generateCloudPixels(spec: CloudLayerSpec, w = CLOUD_W, h = CLOUD_H) {
  const density = new Float32Array(w * h);
  const [b0, b1] = spec.band;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const bandMask = smooth(b0, b0 + 0.14, v) * (1 - smooth(b1 - 0.18, b1, v));
    for (let x = 0; x < w; x++) {
      const u = x / w;
      // Light domain warp for billowy, less grid-like shapes (periodic, so still tileable).
      const warp = (cloudFbm(u + 0.37, v + 0.11, spec, 2) - 0.5) * 0.08;
      density[y * w + x] = cloudFbm(u + warp, v + warp * 0.6, spec) * (0.25 + 0.75 * bandMask) * (0.62 + 0.38 * bandMask);
    }
  }

  const body = new Uint8ClampedArray(w * h * 4);
  const shade = new Uint8ClampedArray(w * h * 4);
  const dy = Math.round(h * 0.035);
  const lo = spec.coverage;
  const hi = lo + spec.softness;

  for (let y = 0; y < h; y++) {
    const above = Math.max(0, y - dy);
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const d = density[i];
      const alpha = smooth(lo, hi, d);
      // Underside: more cloud above this point than here → we're in the cloud's lower half.
      // Thick cores also darken a little, which gives the masses volume.
      const under = Math.min(0.95, Math.max(0, 0.18 + (density[above * w + x] - d) * 9 + (d - hi) * 1.4));
      const p = i * 4;
      body[p] = body[p + 1] = body[p + 2] = 255;
      body[p + 3] = alpha * 255;
      shade[p] = shade[p + 1] = shade[p + 2] = 255;
      shade[p + 3] = alpha * under * 255;
    }
  }

  return { masks: [body, shade], w, h };
}

// ---------------------------------------------------------------------------
// Sea — wave bands seen in perspective, baked for the actual sea size
// ---------------------------------------------------------------------------

const SEA_K = 7; // ground distance at the nearest (bottom) row
const SEA_FX = 0.16; // wave frequency across the view → long crests parallel to the horizon
const SEA_FZ = 1.1; // wave frequency along the view
const SEA_OCTAVES = 5;
const SEA_GAIN = 0.45;
const SEA_EPS = 0.035;
const SEA_NORM = (1 - SEA_GAIN ** SEA_OCTAVES) / (1 - SEA_GAIN);

function waveHeight(gx: number, gz: number, weights: Float32Array): number {
  let sum = 0;
  let amp = 1;
  let fx = SEA_FX;
  let fz = SEA_FZ;
  for (let o = 0; o < SEA_OCTAVES; o++) {
    if (weights[o] > 0.001) sum += weights[o] * amp * valueNoise(gx * fx, gz * fz, 0, 101 + o * 17);
    amp *= SEA_GAIN;
    fx *= 2;
    fz *= 2;
  }
  return sum / SEA_NORM;
}

/**
 * Four masks for a sea of w×h pixels (row 0 = horizon):
 * highlights (facets facing the sky), troughs (facets facing us) and two glitter
 * variants that are cross-faded in CSS so the water shimmers.
 */
function generateSeaPixels(w: number, h: number) {
  const size = w * h * 4;
  const hi = new Uint8ClampedArray(size);
  const lo = new Uint8ClampedArray(size);
  const glintA = new Uint8ClampedArray(size);
  const glintB = new Uint8ClampedArray(size);
  const weights = new Float32Array(SEA_OCTAVES);

  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h; // 0 at the horizon → 1 at the bottom
    const gz = SEA_K / v; // ground distance of this row
    const dz = SEA_K / (v * v * h); // ground distance covered by one pixel row
    const dx = SEA_K / (v * h); // ground width of one pixel column

    // Anti-aliasing: drop octaves whose waves are smaller than a pixel at this distance.
    for (let o = 0; o < SEA_OCTAVES; o++) {
      const f = 2 ** o;
      const footprint = Math.max(SEA_FZ * f * dz, SEA_FX * f * dx * 0.5);
      weights[o] = 1 - smooth(0.2, 0.55, footprint);
    }

    const aerial = smooth(0, 0.6, v); // contrast fades into the horizon haze
    const far = (1 - v) ** 1.6; // glints merge into streaks toward the horizon

    for (let x = 0; x < w; x++) {
      const gx = (x + 0.5 - w / 2) * dx;
      const slope = (waveHeight(gx, gz - SEA_EPS, weights) - waveHeight(gx, gz + SEA_EPS, weights)) * 6;
      const p = (y * w + x) * 4;

      const hiA = smooth(0.04, 0.3, slope) * aerial;
      const loA = smooth(0.04, 0.3, -slope) * aerial;

      // Glints: wave facets catching the light, plus broken horizontal streaks further out.
      const spec = smooth(0.03, 0.18, slope) * (0.35 + 0.65 * aerial);
      const streak = valueNoise(x * 0.04, y * 0.9, 0, 313);
      const glA = Math.max(spec * smooth(0.3, 0.7, hash(x >> 1, y, 211)), far * smooth(0.38, 0.75, streak));
      const glB = Math.max(spec * smooth(0.3, 0.7, hash(x >> 1, y, 977)), far * smooth(0.38, 0.75, 1 - streak));

      hi[p] = hi[p + 1] = hi[p + 2] = 255;
      lo[p] = lo[p + 1] = lo[p + 2] = 255;
      glintA[p] = glintA[p + 1] = glintA[p + 2] = 255;
      glintB[p] = glintB[p + 1] = glintB[p + 2] = 255;
      hi[p + 3] = hiA * 255;
      lo[p + 3] = loA * 255;
      glintA[p + 3] = glA * 255;
      glintB[p + 3] = glB * 255;
    }
  }

  return { masks: [hi, lo, glintA, glintB], w, h };
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export type TextureJob = { kind: 'cloud'; spec: CloudLayerSpec } | { kind: 'sea'; w: number; h: number };

/** Draw RGBA pixels into a canvas and return an image blob. Works with OffscreenCanvas or <canvas>. */
async function pixelsToBlob(data: Uint8ClampedArray, w: number, h: number, type: string): Promise<Blob> {
  const image = new ImageData(data, w, h);
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');
    ctx.putImageData(image, 0, 0);
    return canvas.convertToBlob({ type, quality: 0.92 });
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  ctx.putImageData(image, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), type, 0.92);
  });
}

/** Run a texture job and return one image blob per mask (PNG by default; WebP for the shipped plates). */
export async function runTextureJob(job: TextureJob, type = 'image/png'): Promise<Blob[]> {
  const { masks, w, h } = job.kind === 'cloud' ? generateCloudPixels(job.spec) : generateSeaPixels(job.w, job.h);
  return Promise.all(masks.map((m) => pixelsToBlob(m, w, h, type)));
}

export interface TextureGenerator {
  /** Resolves to object URLs (the caller revokes them). */
  run: (job: TextureJob) => Promise<string[]>;
  dispose: () => void;
}

/** Generates textures in a worker when possible, else on the main thread. */
export function createTextureGenerator(): TextureGenerator {
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL('./sky.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    worker = null;
  }
  let nextId = 0;
  const pending = new Map<number, { resolve: (blobs: Blob[]) => void; reject: (e: Error) => void }>();

  if (worker) {
    worker.onmessage = (e: MessageEvent<{ id: number; blobs?: Blob[]; error?: string }>) => {
      const job = pending.get(e.data.id);
      if (!job) return;
      pending.delete(e.data.id);
      if (e.data.blobs) job.resolve(e.data.blobs);
      else job.reject(new Error(e.data.error ?? 'Texture worker failed'));
    };
    worker.onerror = () => {
      pending.forEach((job) => job.reject(new Error('Texture worker crashed')));
      pending.clear();
    };
  }

  const toUrls = (blobs: Blob[]) => blobs.map((b) => URL.createObjectURL(b));

  return {
    run(job) {
      if (!worker) return runTextureJob(job).then(toUrls);
      const id = nextId++;
      return new Promise<Blob[]>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker!.postMessage({ id, job });
      })
        .catch(() => runTextureJob(job))
        .then(toUrls);
    },
    dispose() {
      worker?.terminate();
      pending.clear();
    },
  };
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

/** A tileable starfield: mostly faint pinpricks, a few brighter stars with soft halos. */
export async function generateStarTexture(size: number, count: number, seed: number): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  for (let i = 0; i < count; i++) {
    const x = hash(i, 1, seed) * size;
    const y = hash(i, 2, seed) * size;
    const mag = hash(i, 3, seed);
    const r = mag > 0.96 ? 1.4 : mag > 0.8 ? 0.9 : 0.55;
    const alpha = 0.35 + mag * 0.65;
    const warm = hash(i, 4, seed) > 0.75;
    if (mag > 0.93) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
      g.addColorStop(0, `rgba(220,228,255,${alpha * 0.35})`);
      g.addColorStop(1, 'rgba(220,228,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = warm ? `rgba(255,236,214,${alpha})` : `rgba(232,238,255,${alpha})`;
    ctx.fill();
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
