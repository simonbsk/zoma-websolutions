import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { createInkRenderer } from './inkGl';
import { createCalmScene, createStoryScene, type Box } from './inkScene';
import './ink.css';

/*
 * The liquid behind the public pages: a fixed, softly blurred canvas. The homepage tells the ink
 * story (see inkScene.ts); the start page keeps the inks calm. Without WebGL a CSS wash stands in,
 * and with reduced motion the ink is drawn once and stays put.
 *
 * Page hooks:
 *   [data-ink-target="0|1|2"]  mockups the iris / saffron / verdant blobs dissolve into
 *   [data-ink-story-end]       the section where the scroll story ends (the showcase)
 *   [data-ink-cta]             the closing call to action, where three new drops fall
 */

/** Drawing-buffer pixels per CSS pixel. Low on purpose: the softness is part of the look. */
const RESOLUTION = 0.5;
const MIN_SCALE = 0.3;

interface Tracked {
  el: HTMLElement;
  /** Corner radius: px, or a fraction of the width for percentage radii (phone frames). */
  radius: number;
  relative: boolean;
  reveal: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function readBox(t: Tracked | null): Box | null {
  if (!t) return null;
  const r = t.el.getBoundingClientRect();
  const radius = t.relative ? t.radius * r.width : t.radius;
  return { left: r.left, top: r.top, width: r.width, height: r.height, radius };
}

function track(el: HTMLElement | null): Tracked | null {
  if (!el) return null;
  const raw = getComputedStyle(el).borderTopLeftRadius;
  const value = parseFloat(raw) || 0;
  const relative = raw.trim().split(/\s+/)[0].endsWith('%');
  return { el, radius: relative ? value / 100 : value, relative, reveal: -1 };
}

function applyReveal(t: Tracked, value: number) {
  const v = Math.round(value * 1000) / 1000;
  if (v === t.reveal) return;
  t.reveal = v;
  const s = t.el.style;
  if (v >= 1) {
    s.opacity = '1';
    s.filter = 'none';
    s.transform = 'none';
  } else {
    s.opacity = String(v);
    s.filter = `blur(${((1 - v) * 14).toFixed(1)}px)`;
    s.transform = `scale(${(0.965 + 0.035 * v).toFixed(4)})`;
  }
}

function clearReveal(t: Tracked | null) {
  if (!t) return;
  t.el.style.removeProperty('opacity');
  t.el.style.removeProperty('filter');
  t.el.style.removeProperty('transform');
}

export function InkBackground({ mode }: { mode: 'story' | 'calm' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const dirtyRef = useRef(true);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
    dirtyRef.current = true;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = createInkRenderer(canvas);
    if (!renderer) {
      setFallback(true);
      return;
    }

    const root = document.documentElement;
    const story = mode === 'story';
    const scene = story ? createStoryScene({ still }) : createCalmScene({ still });
    // Mockups wait for their ink (see ink.css) — only while the story actually plays.
    if (story && !still) root.classList.add('ink-story');

    let targets: (Tracked | null)[] = [null, null, null];
    let storyEnd: HTMLElement | null = null;
    let cta: Tracked | null = null;
    const query = () => {
      targets = [0, 1, 2].map((i) => {
        const el = document.querySelector<HTMLElement>(`[data-ink-target="${i}"]`);
        const prev = targets[i];
        return prev && prev.el === el ? prev : track(el);
      });
      storyEnd = document.querySelector<HTMLElement>('[data-ink-story-end]');
      const ctaEl = document.querySelector<HTMLElement>('[data-ink-cta]');
      cta = cta && cta.el === ctaEl ? cta : track(ctaEl);
    };
    query();

    let scale = RESOLUTION * clamp(window.devicePixelRatio || 1, 1, 1.5);
    const resize = () => {
      renderer.resize(window.innerWidth * scale, window.innerHeight * scale);
      dirtyRef.current = true;
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let stopped = false;
    const start = performance.now();
    let last = start;
    let lastRender = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let frames = 0;
    let slowSum = 0;
    let slowCount = 0;
    let downgrades = 0;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      root.classList.remove('ink-story');
      targets.forEach(clearReveal);
    };

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      setFallback(true);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (still && !dirtyRef.current) return;

      if (++frames % 60 === 0) query();
      const y = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rawVel = dt > 0 ? (y - lastY) / dt : 0;
      lastY = y;
      vel += (clamp(rawVel, -5000, 5000) - vel) * (1 - Math.exp(-dt / 0.12));

      let progress = 0;
      if (storyEnd) {
        const endTop = storyEnd.getBoundingClientRect().top + y;
        progress = clamp(y / Math.max(1, endTop - vh), 0, 1);
      }

      const out = scene.step({
        time: (now - start) / 1000,
        dt,
        vw,
        vh,
        scrollVel: vel,
        story: progress,
        targets: targets.map(readBox),
        cta: readBox(cta),
        dark: themeRef.current === 'dark',
      });

      if (story && !still) targets.forEach((t, i) => t && applyReveal(t, out.reveal[i]));

      // Settled scenes don't need 60 fps: the ink drifts slowly and is blurred anyway.
      if (!out.busy && !dirtyRef.current && now - lastRender < 33) return;
      renderer.render(out.frame);
      lastRender = now;
      dirtyRef.current = false;

      // Adaptive quality: if busy frames run slow, draw fewer pixels.
      if (out.busy && !still) {
        slowSum += dt;
        if (++slowCount === 90) {
          if (slowSum / slowCount > 0.028 && scale > MIN_SCALE && downgrades < 2) {
            scale = Math.max(MIN_SCALE, scale * 0.72);
            downgrades++;
            resize();
          }
          slowSum = 0;
          slowCount = 0;
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      stop();
      canvas.removeEventListener('webglcontextlost', onLost);
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div className={`ink ink-${mode}`} aria-hidden>
      {fallback ? (
        <div className="ink-fallback">
          <i />
          <i />
          <i />
        </div>
      ) : (
        <canvas ref={canvasRef} className="ink-canvas" />
      )}
    </div>
  );
}
