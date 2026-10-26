/*
 * WebGL renderer for the ink background: one full-screen fragment shader that draws
 * - the liquid surface (ripples from drops, a faint ambient swell),
 * - ink blobs as a smooth union of rounded boxes (circles while floating, website-shaped when
 *   they merge into a mockup), domain-warped so the edges curl like ink in water,
 * - falling droplets.
 * All positions are in viewport heights with y pointing down; the scene (inkScene.ts) does the
 * choreography and hands over plain numbers each frame.
 */

export const MAX_BLOBS = 12;
export const MAX_RIPPLES = 8;
export const MAX_DROPS = 3;

export type Rgb = [number, number, number];

export interface InkFrame {
  time: number;
  bg: Rgb;
  /** 0 = light background (ink mixes in), 1 = dark background (ink glows). */
  dark: number;
  palette: [Rgb, Rgb, Rgb];
  /** Per blob: centre x, centre y, half width, half height. */
  blobA: Float32Array;
  /** Per blob: corner radius, opacity (above 1 = fresh, concentrated ink), colour index + warp-free amount (fraction), vertical stretch. */
  blobB: Float32Array;
  /** Per ripple: x, y, age in seconds, amplitude. */
  ripples: Float32Array;
  /** Per drop: x, y, radius, colour index + opacity (fraction). */
  drops: Float32Array;
  vibrancy: number;
  alive: number;
  liquid: number;
}

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define NB ${MAX_BLOBS}
#define NR ${MAX_RIPPLES}
#define ND ${MAX_DROPS}

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform float uDark;
uniform vec3 uPal0;
uniform vec3 uPal1;
uniform vec3 uPal2;
uniform vec4 uBlobA[NB];
uniform vec4 uBlobB[NB];
uniform vec4 uRipple[NR];
uniform vec4 uDrop[ND];
uniform float uVib;
uniform float uAlive;
uniform float uLiquid;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec3 palette(float idx) {
  float w1 = step(0.5, idx) * (1.0 - step(1.5, idx));
  float w2 = step(1.5, idx);
  return uPal0 * (1.0 - w1 - w2) + uPal1 * w1 + uPal2 * w2;
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  r = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 uv = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uRes.y;
  float t = uTime;

  // Surface: expanding ring packets from every drop, plus a slow swell once the liquid shows.
  vec2 slope = vec2(0.0);
  for (int i = 0; i < NR; i++) {
    vec4 r = uRipple[i];
    if (r.w <= 0.0) continue;
    vec2 d = uv - r.xy;
    float dist = length(d) + 1e-4;
    float front = 0.02 + r.z * 0.36;
    float width = 0.07 + r.z * 0.05;
    float x = dist - front;
    float env = exp(-(x * x) / (width * width)) * r.w * exp(-r.z * 0.55) / (1.0 + front * 2.0);
    slope += (d / dist) * cos(x * 105.0 + 1.2) * env;
  }
  vec2 swell = vec2(noise(uv * 2.4 + vec2(t * 0.04, 0.0)), noise(uv * 2.4 + vec2(7.3, -t * 0.035))) - 0.5;
  slope += swell * 0.22 * uLiquid;

  // Ink, seen through the moving surface.
  vec2 p = uv + slope * 0.012;
  float wt = t * 0.045;
  vec2 q1 = vec2(fbm(p * 2.1 + vec2(1.7, wt)), fbm(p * 2.1 + vec2(8.3, -wt)));
  vec2 q2 = vec2(fbm(p * 4.4 + q1 * 1.8 + vec2(wt * 1.3, 3.1)), fbm(p * 4.4 + q1 * 1.8 + vec2(5.4, -wt)));
  vec2 pw = p + (q2 - 0.5) * (0.05 + 0.1 * uAlive);

  // Blobs melt into one another (smooth union, K), but their colours stay marbled instead of
  // averaging into grey: colour weights fall off much faster (K2) and are swirled by noise.
  const float K = 15.0;
  const float K2 = 40.0;
  float sum = 0.0;
  float osum = 0.0;
  vec3 csum = vec3(0.0);
  float wsum = 0.0;
  vec3 asum = vec3(0.0);
  for (int i = 0; i < NB; i++) {
    vec4 a = uBlobA[i];
    vec4 b = uBlobB[i];
    if (b.y < 0.002) continue;
    float idx = floor(b.z);
    float calm = fract(b.z);
    vec2 d = mix(pw, p, calm) - a.xy;
    d.y /= 1.0 + b.w;
    float sd = max(sdRoundBox(d, a.zw, b.x), -0.3);
    float e = exp(-K * sd);
    sum += e;
    osum += b.y * e;
    asum += palette(idx) * e;
    float marble = 0.35 + noise(pw * 5.0 + vec2(float(i) * 7.31, t * 0.06));
    float w = exp(-K2 * (sd + 0.3)) * marble;
    csum += palette(idx) * w;
    wsum += w;
  }

  vec3 col = uBg;
  if (sum > 1e-5) {
    float D = -log(sum) / K;
    vec3 ink = wsum > 1e-30 ? csum / wsum : asum / sum;
    float op = osum / sum;
    float soft = 0.018 + 0.022 * uAlive;
    float body = 1.0 - smoothstep(-soft, soft * 1.6, D);
    float core = smoothstep(0.03, -0.18, D);
    float halo = exp(-max(D, 0.0) * 6.5) * 0.2;
    float grain = fbm(pw * 6.0 + vec2(3.1, t * 0.03));
    // Thin filaments, like ink threads unfurling in water.
    float fil = 1.0 - abs(2.0 * fbm(pw * 5.5 + q1 * 2.2 + vec2(0.0, t * 0.025)) - 1.0);
    fil = fil * fil * fil * fil;
    float dens = (body * (0.56 + 0.44 * core) * (0.76 + 0.6 * (grain - 0.5)) * (0.84 + 0.4 * fil) + halo) * op;

    float lum = dot(ink, vec3(0.299, 0.587, 0.114));
    vec3 inkV = mix(vec3(lum), ink, 0.5 + 0.5 * uVib);
    float aL = clamp(mix(0.3, 0.68, uVib) * dens, 0.0, 0.92);
    float aD = clamp(mix(0.32, 0.7, uVib) * dens, 0.0, 0.92);
    vec3 lightCol = mix(uBg, inkV * (0.9 + 0.12 * grain), aL);
    vec3 darkCol = mix(uBg + inkV * aD * 0.85, inkV, aD * 0.3);
    col = mix(lightCol, darkCol, uDark);
  }

  // Light the surface from the top left: rings read as soft grey lines on white, glints on black.
  float lit = clamp(dot(slope, vec2(-0.5, -0.85)), -1.0, 1.0);
  col *= 1.0 + lit * mix(0.08, 0.12, uDark);
  col += vec3(pow(max(lit, 0.0), 2.0)) * mix(0.02, 0.07, uDark);

  // Falling droplets: round below, drawn out into a tail above.
  for (int i = 0; i < ND; i++) {
    vec4 dr = uDrop[i];
    float o = fract(dr.w);
    if (o < 0.002) continue;
    vec2 d = uv - dr.xy;
    float tail = clamp(-d.y / (dr.z * 3.2), 0.0, 1.0);
    d.x /= max(1.0 - 0.8 * tail, 0.05);
    d.y /= d.y < 0.0 ? 2.4 : 1.0;
    float sd = length(d) - dr.z;
    float m = 1.0 - smoothstep(-0.0012, 0.0022, sd);
    col = mix(col, palette(floor(dr.w)) * 0.92, m * o);
    float hl = 1.0 - smoothstep(0.0, dr.z * 0.5, length(uv - dr.xy - vec2(-dr.z * 0.32, -dr.z * 0.25)));
    col = mix(col, vec3(1.0), hl * 0.6 * m * o);
  }

  // Dither against banding in the large soft gradients.
  col += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface InkRenderer {
  resize(width: number, height: number): void;
  render(frame: InkFrame): void;
  dispose(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn('[ink] shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Returns null when WebGL (or enough shader uniforms) is unavailable — the caller falls back to CSS. */
export function createInkRenderer(canvas: HTMLCanvasElement): InkRenderer | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'low-power',
    });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  if ((gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) as number) < 64) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) console.warn('[ink] link:', gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  // One triangle that covers the screen.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl!.getUniformLocation(program, name);
  const loc = {
    res: u('uRes'),
    time: u('uTime'),
    bg: u('uBg'),
    dark: u('uDark'),
    pal0: u('uPal0'),
    pal1: u('uPal1'),
    pal2: u('uPal2'),
    blobA: u('uBlobA'),
    blobB: u('uBlobB'),
    ripple: u('uRipple'),
    drop: u('uDrop'),
    vib: u('uVib'),
    alive: u('uAlive'),
    liquid: u('uLiquid'),
  };

  let width = 1;
  let height = 1;

  return {
    resize(w, h) {
      width = Math.max(1, Math.round(w));
      height = Math.max(1, Math.round(h));
      canvas.width = width;
      canvas.height = height;
      gl!.viewport(0, 0, width, height);
    },
    render(f) {
      const g = gl!;
      if (g.isContextLost()) return;
      g.uniform2f(loc.res, width, height);
      g.uniform1f(loc.time, f.time);
      g.uniform3fv(loc.bg, f.bg);
      g.uniform1f(loc.dark, f.dark);
      g.uniform3fv(loc.pal0, f.palette[0]);
      g.uniform3fv(loc.pal1, f.palette[1]);
      g.uniform3fv(loc.pal2, f.palette[2]);
      g.uniform4fv(loc.blobA, f.blobA);
      g.uniform4fv(loc.blobB, f.blobB);
      g.uniform4fv(loc.ripple, f.ripples);
      g.uniform4fv(loc.drop, f.drops);
      g.uniform1f(loc.vib, f.vibrancy);
      g.uniform1f(loc.alive, f.alive);
      g.uniform1f(loc.liquid, f.liquid);
      g.drawArrays(g.TRIANGLES, 0, 3);
    },
    // The context itself stays alive: a remount (React StrictMode) reuses the same canvas.
    dispose() {
      const g = gl!;
      g.deleteBuffer(buffer);
      g.deleteProgram(program);
      g.deleteShader(vs);
      g.deleteShader(fs);
    },
  };
}
