import { useEffect, useRef, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { AtelierNord, GlutRoastery, HafenLegal, LindePop, MaisonFlora, OrbitAnalytics, VeloNine } from './sites';
import './showcase.css';

interface Tile {
  name: [string, string];
  /** Square colour and the stripe/label colour drawn on top of it. */
  bg: string;
  ink: string;
  Site: ComponentType;
}

// Neighbouring squares alternate dark and bright so the diagonal reads clearly.
const TILES: Tile[] = [
  { name: ['Atelier', 'Nord'], bg: '#1d1d1b', ink: '#e9e4da', Site: AtelierNord },
  { name: ['Glut', 'Roastery'], bg: '#ff5a1f', ink: '#ffd9c2', Site: GlutRoastery },
  { name: ['Velo', 'Nine'], bg: '#d4ff3a', ink: '#141414', Site: VeloNine },
  { name: ['Hafen', '& Co.'], bg: '#14213d', ink: '#c8b48a', Site: HafenLegal },
  { name: ['Maison', 'Flora'], bg: '#e04f74', ink: '#ffd3df', Site: MaisonFlora },
  { name: ['Orbit', 'Analytics'], bg: '#5b3df5', ink: '#cbc2ff', Site: OrbitAnalytics },
  { name: ['Café', 'Linde'], bg: '#ffd23f', ink: '#e5285e', Site: LindePop },
];

// Two full cycles plus a buffer keep the staircase filled while the track loops.
const ROWS = Array.from({ length: TILES.length * 2 + 4 }, (_, i) => TILES[i % TILES.length]);

/**
 * The hero's diagonal staircase of website tiles. Each row is a 2:1 "screenshot"
 * next to a colour square; the squares' stripes line up into one long diagonal.
 * The whole track drifts up and to the right and loops seamlessly after one cycle.
 * `children` render on top of the tiles (e.g. a caption badge).
 */
export function HeroFlow({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Pause the animation while the hero is off screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => el.classList.toggle('is-paused', !entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flow" ref={ref} style={{ '--n': TILES.length } as CSSProperties}>
      <div className="flow-track" aria-hidden>
        {ROWS.map(({ name, bg, ink, Site }, i) => (
          <div className="flow-row" key={i} style={{ '--i': i } as CSSProperties}>
            <div className="flow-shot">
              <Site />
            </div>
            <div className="flow-tag" style={{ background: bg, color: ink }}>
              <svg className="flow-stripe" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="0,100 0,84 84,0 100,0 100,16 16,100" />
              </svg>
              <span>
                {name[0]}
                <br />
                {name[1]}
              </span>
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
