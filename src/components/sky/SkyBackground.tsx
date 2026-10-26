import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import {
  clamp01,
  mix,
  nightnessAt,
  parseColor,
  skyColorsAt,
  smoothstep,
  toCss,
  trackAt,
  uiTokensAt,
  withAlpha,
  type CloudLayerKey,
} from './skyPalette';
import { CLOUD_LAYERS, createTextureGenerator, generateStarTexture } from './skyTextures';
import './sky.css';

const SKY_REFRESH = 'zoma:sky-refresh';
/** Eye level: the sea starts here (fraction of the viewport height). */
const HORIZON = 0.84;
/** Time of day at which the sun touches the horizon. */
const SUNSET_T = 0.8;
/** Smoothing time constants in seconds: colours follow the scroll gently, the sun glides slower still. */
const TAU_SKY = 0.45;
const TAU_SUN = 1.3;

const WHITE = parseColor('#ffffff');
const BLACK = parseColor('#000000');

interface CloudTexture {
  key: CloudLayerKey;
  body: string;
  shade: string;
}

/** Irregular light rays as one static conic gradient; CSS turns it very slowly. */
const RAYS = (() => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const stops: string[] = [];
  let angle = 0;
  for (;;) {
    const start = angle + 5 + rnd() * 16;
    const width = 1.5 + rnd() * 5;
    if (start + width > 356) break;
    const alpha = (0.25 + rnd() * 0.6).toFixed(2);
    stops.push(
      `transparent ${start.toFixed(1)}deg`,
      `rgba(255,248,232,${alpha}) ${(start + width / 2).toFixed(1)}deg`,
      `transparent ${(start + width).toFixed(1)}deg`,
    );
    angle = start + width;
  }
  return `conic-gradient(from 0deg, transparent 0deg, ${stops.join(', ')}, transparent 360deg)`;
})();

const maskStyle = (url: string): CSSProperties => ({ maskImage: `url(${url})`, WebkitMaskImage: `url(${url})` });

/** Pre-rendered cloud plates (see scripts/render-sky-plates.mjs) — identical to the generated textures. */
const cloudPlateUrl = (key: CloudLayerKey, part: 'body' | 'shade') => `/sky/cloud-${key}-${part}.webp`;

function loadImage(url: string): Promise<void> {
  const img = new Image();
  img.src = url;
  return img.decode();
}

/** Glitter texture, limited to a soft wedge that opens from the sun (or moon) toward the viewer. */
const glintStyle = (url: string): CSSProperties => {
  const wedge =
    'conic-gradient(from 180deg at var(--glint-x) 0%, #000 0deg, rgba(0,0,0,0.55) calc(var(--glint-ang) * 0.55), ' +
    'transparent var(--glint-ang), transparent calc(360deg - var(--glint-ang)), ' +
    'rgba(0,0,0,0.55) calc(360deg - var(--glint-ang) * 0.55), #000 360deg)';
  return { maskImage: `url(${url}), ${wedge}`, WebkitMaskImage: `url(${url}), ${wedge}` };
};

/**
 * Scroll-driven "live wallpaper": a day at the sea, from sunrise at the top of the page
 * to midnight at the bottom.
 *
 * Time of day is driven by elements inside `scopeRef` carrying `data-sky-stop="<t>"`
 * (and optionally `data-sky-at="<0..1>"`, the viewport fraction their top must reach).
 * The sky also writes the page's colour tokens onto the scope element so the UI moves
 * from light glass to dark glass as night falls, plus `--day` (0..1) for scroll-linked details.
 */
interface SkyBackgroundProps {
  scopeRef: RefObject<HTMLElement>;
  /** Freeze the sky at one time of day (0 sunrise … 1 midnight) instead of following the scroll. */
  fixedTime?: number;
  /** Write the day → night colour tokens onto the scope (off when the page keeps its own light UI). */
  themeUi?: boolean;
}

export function SkyBackground({ scopeRef, fixedTime, themeUi = true }: SkyBackgroundProps) {
  const skyRef = useRef<HTMLDivElement>(null);
  const [clouds, setClouds] = useState<CloudTexture[]>([]);
  const [stars, setStars] = useState<string[]>([]);
  const [sea, setSea] = useState<string[] | null>(null);

  // Textures: stars on the main thread (tiny), clouds from pre-rendered plates (generated in a
  // worker if the plates are missing), the sea baked in a worker for the actual viewport.
  useEffect(() => {
    let cancelled = false;
    const owned: string[] = [];
    const generator = createTextureGenerator();

    Promise.all([generateStarTexture(640, 170, 7), generateStarTexture(900, 90, 19)])
      .then((urls) => {
        owned.push(...urls);
        if (!cancelled) setStars(urls);
      })
      .catch(() => {});

    for (const spec of CLOUD_LAYERS) {
      const body = cloudPlateUrl(spec.key, 'body');
      const shade = cloudPlateUrl(spec.key, 'shade');
      Promise.all([loadImage(body), loadImage(shade)])
        .then(() => ({ body, shade }))
        .catch(() =>
          generator.run({ kind: 'cloud', spec }).then(([genBody, genShade]) => {
            owned.push(genBody, genShade);
            return { body: genBody, shade: genShade };
          }),
        )
        .then((tex) => {
          if (!cancelled) setClouds((prev) => [...prev, { key: spec.key, ...tex }]);
        })
        .catch(() => {
          /* Canvas unavailable — the gradient sky still works without clouds. */
        });
    }

    // The sea is baked for the real viewport size, and re-baked after big resizes.
    let seaSeq = 0;
    let baked = { w: 0, h: 0 };
    let seaUrls: string[] = [];
    let timer = 0;
    const close = (a: number, b: number) => Math.abs(a - b) / Math.max(a, 1) < 0.15;
    const bakeSea = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(window.innerWidth * scale);
      const h = Math.max(24, Math.round(window.innerHeight * (1 - HORIZON) * scale));
      if (close(w, baked.w) && close(h, baked.h)) return;
      baked = { w, h };
      const seq = ++seaSeq;
      generator
        .run({ kind: 'sea', w, h })
        .then((urls) => {
          if (cancelled || seq !== seaSeq) {
            urls.forEach((u) => URL.revokeObjectURL(u));
            return;
          }
          const old = seaUrls;
          seaUrls = urls;
          setSea(urls);
          window.setTimeout(() => old.forEach((u) => URL.revokeObjectURL(u)), 2000);
        })
        .catch(() => {});
    };
    bakeSea();
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(bakeSea, 400);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      generator.dispose();
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timer);
      [...owned, ...seaUrls].forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  // Scroll → time of day.
  useEffect(() => {
    const sky = skyRef.current;
    const scope = scopeRef.current;
    if (!sky || !scope) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sun = sky.querySelector<HTMLElement>('.sky-sun');
    const sunBody = sky.querySelector<HTMLElement>('.sun-body');

    function targetTime(): number {
      if (fixedTime !== undefined) return fixedTime;
      const vh = window.innerHeight;
      // y = distance from the element's top to its trigger line; y <= 0 means "passed".
      // Stops are ordered by t, which increases down the page.
      const ordered = [...scope!.querySelectorAll<HTMLElement>('[data-sky-stop]')]
        .map((el) => {
          const at = Number(el.dataset.skyAt ?? 0.5);
          return { t: Number(el.dataset.skyStop), y: el.getBoundingClientRect().top - vh * at };
        })
        .sort((a, b) => a.t - b.t);
      if (!ordered.length) return 0;
      if (ordered[0].y > 0) return ordered[0].t;
      for (let i = 1; i < ordered.length; i++) {
        const prev = ordered[i - 1];
        const next = ordered[i];
        if (next.y > 0) {
          const span = next.y - prev.y;
          return span > 0 ? prev.t + (next.t - prev.t) * clamp01(-prev.y / span) : next.t;
        }
      }
      return ordered[ordered.length - 1].t;
    }

    function applySky(t: number) {
      const c = skyColorsAt(t);
      const s = sky!.style;
      s.setProperty('--sky-top', toCss(c.top));
      s.setProperty('--sky-mid', toCss(c.mid));
      s.setProperty('--sky-low', toCss(c.low));
      s.setProperty('--sky-haze', toCss(c.haze));
      s.setProperty('--sun-color', toCss(c.sun));
      s.setProperty('--sun-glow', toCss(c.sunGlow));
      s.setProperty('--cloud-lit', toCss(c.cloudLit));
      s.setProperty('--cloud-shade', toCss(c.cloudShade));
      s.setProperty('--leak', toCss(c.leak));
      s.setProperty('--sea-horizon', toCss(c.seaHorizon));
      s.setProperty('--sea-deep', toCss(c.seaDeep));
      s.setProperty('--sea-hi', toCss(withAlpha(mix(c.haze, WHITE, 0.25), 0.55)));
      s.setProperty('--sea-lo', toCss(withAlpha(mix(c.seaDeep, BLACK, 0.35), 0.5)));
      s.setProperty('--sea-line', toCss(withAlpha(mix(c.haze, WHITE, 0.4), 0.9)));
      s.setProperty('--glitter', toCss(mix(c.glitter, WHITE, 0.35)));
      s.setProperty('--glint-a', trackAt('glitter', t).toFixed(3));
      s.setProperty('--rays', trackAt('rays', t).toFixed(3));
      s.setProperty('--stars', smoothstep(0.8, 0.98, t).toFixed(3));
      s.setProperty('--moon', smoothstep(0.86, 0.98, t).toFixed(3));

      const night = nightnessAt(t);
      s.setProperty('--night', night.toFixed(3));

      sky!.querySelectorAll<HTMLElement>('.cloud-layer').forEach((el) => {
        const key = el.dataset.layer as CloudLayerKey;
        const depth = Number(el.dataset.depth);
        el.style.opacity = el.dataset.ready ? trackAt(key, t).toFixed(3) : '0';
        el.style.transform = `translate3d(0, ${(-t * depth).toFixed(1)}px, 0)`;
      });

      if (themeUi) {
        for (const [prop, value] of uiTokensAt(night)) scope!.style.setProperty(prop, value);
        scope!.style.setProperty('--night', night.toFixed(3));
        scope!.style.setProperty('--day', t.toFixed(4));
      }
    }

    function applySun(t: number, skyTime: number) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Rises out of the sea bottom-left, arcs over the page, sets into the sea bottom-right.
      // It starts just above the waterline so the sunrise is visible on load.
      const arc = clamp01(t / SUNSET_T);
      const x = 0.16 + arc * 0.68;
      const rest = HORIZON - 0.012;
      const y = t <= SUNSET_T ? rest - Math.sin(Math.PI * arc) * 0.62 : rest + (t - SUNSET_T) * 1.2;
      const altitude = clamp01((HORIZON - y) / 0.3);

      if (sun) {
        sun.style.transform = `translate3d(${(x * vw).toFixed(1)}px, ${(y * vh).toFixed(1)}px, 0)`;
        sun.style.opacity = (1 - smoothstep(0.82, 0.9, t)).toFixed(3);
      }
      // Close to the horizon the sun looks larger and slightly flattened, as it does through thick air.
      if (sunBody) {
        sunBody.style.transform = `scale(${(1.4 - 0.4 * altitude).toFixed(3)}, ${(1.12 - 0.12 * altitude).toFixed(3)})`;
      }

      // The reflection path follows the sun, then the moon once night falls.
      const moonX = vw <= 720 ? 0.82 : 0.78;
      const glintX = x + (moonX - x) * smoothstep(0.8, 0.9, skyTime);
      const s = sky!.style;
      s.setProperty('--sun-x', `${(x * 100).toFixed(2)}%`);
      s.setProperty('--sun-y', `${(y * 100).toFixed(2)}%`);
      s.setProperty('--glint-x', `${(glintX * 100).toFixed(2)}%`);
      s.setProperty('--glint-w', `${(16 + altitude * 24).toFixed(1)}%`);
      // A low sun draws a narrow path; a high sun scatters glints across a wide fan.
      s.setProperty('--glint-ang', `${(34 + altitude * 40).toFixed(1)}deg`);
    }

    let skyT = targetTime();
    let sunT = skyT;
    let appliedSky = -1;
    let appliedSun = -1;
    let raf = 0;
    let last = 0;

    function apply() {
      const skyChanged = Math.abs(skyT - appliedSky) >= 0.0004;
      const sunChanged = Math.abs(sunT - appliedSun) >= 0.0002;
      if (skyChanged) {
        appliedSky = skyT;
        applySky(skyT);
      }
      if (skyChanged || sunChanged) {
        appliedSun = sunT;
        applySun(sunT, skyT);
      }
    }

    function tick(now: number) {
      raf = 0;
      const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      const target = targetTime();
      if (reduced) {
        skyT = target;
        sunT = target;
      } else {
        // Frame-rate independent easing: calm, never snappy.
        skyT += (target - skyT) * (1 - Math.exp(-dt / TAU_SKY));
        sunT += (target - sunT) * (1 - Math.exp(-dt / TAU_SUN));
        if (Math.abs(target - skyT) < 0.0005) skyT = target;
        if (Math.abs(target - sunT) < 0.0003) sunT = target;
      }
      apply();
      if (skyT !== target || sunT !== target) raf = requestAnimationFrame(tick);
    }

    const schedule = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    // Size changes (and newly mounted cloud layers) need a full re-apply even if t is unchanged.
    const reapply = () => {
      appliedSky = -1;
      appliedSun = -1;
      schedule();
    };

    apply();
    const follow = fixedTime === undefined;
    if (follow) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', reapply);
    window.addEventListener(SKY_REFRESH, reapply);
    const ro = new ResizeObserver(schedule);
    if (follow) ro.observe(scope);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', reapply);
      window.removeEventListener(SKY_REFRESH, reapply);
      ro.disconnect();
      cancelAnimationFrame(raf);
      if (themeUi) {
        for (const [prop] of uiTokensAt(0)) scope.style.removeProperty(prop);
        scope.style.removeProperty('--night');
        scope.style.removeProperty('--day');
      }
    };
  }, [scopeRef, fixedTime, themeUi]);

  // Re-apply once new cloud layers mount so their opacity is set immediately.
  useEffect(() => {
    window.dispatchEvent(new Event(SKY_REFRESH));
  }, [clouds.length]);

  const depthFor: Record<CloudLayerKey, number> = { far: 40, bank: 70, mid: 110, near: 190 };

  return (
    <div className="sky" ref={skyRef} aria-hidden style={{ '--horizon': `${HORIZON * 100}%` } as CSSProperties}>
      <div className="sky-gradient" />
      <div className="sky-stars">
        {stars.map((url, i) => (
          <span key={url} className={`stars stars-${i}`} style={{ backgroundImage: `url(${url})` }} />
        ))}
      </div>
      <div className="sky-moon">
        <span className="moon-glow" />
        <span className="moon-disc" />
      </div>
      <div className="sky-horizon" />
      {CLOUD_LAYERS.map((spec) => {
        const tex = clouds.find((c) => c.key === spec.key);
        return (
          <div
            key={spec.key}
            className={`cloud-layer cloud-${spec.key}`}
            data-layer={spec.key}
            data-depth={depthFor[spec.key]}
            data-ready={tex ? '1' : undefined}
          >
            {tex ? (
              <div className="cloud-drift">
                <div className="cloud-body" style={maskStyle(tex.body)} />
                <div className="cloud-shade" style={maskStyle(tex.shade)} />
              </div>
            ) : null}
          </div>
        );
      })}
      {/* Above the clouds, but blended additively: the sun shines through them rather than hiding. */}
      <div className="sky-sun">
        <span className="sun-rays" style={{ backgroundImage: RAYS }} />
        <span className="sun-glow" />
        <span className="sun-body">
          <span className="sun-bloom" />
          <span className="sun-core" />
        </span>
      </div>
      <div className="sea">
        <div className="sea-body" />
        {sea ? (
          <>
            <div className="sea-tex sea-hi" style={maskStyle(sea[0])} />
            <div className="sea-tex sea-lo" style={maskStyle(sea[1])} />
            <div className="sea-glow" />
            <div className="sea-glints">
              <div className="sea-glint sea-glint-a" style={glintStyle(sea[2])} />
              <div className="sea-glint sea-glint-b" style={glintStyle(sea[3])} />
            </div>
          </>
        ) : null}
        <div className="sea-line" />
      </div>
      <div className="sky-leak" />
      <div className="sky-vignette" />
      <div className="sky-grain" />
    </div>
  );
}
