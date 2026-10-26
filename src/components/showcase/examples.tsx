import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Check, MousePointerClick } from 'lucide-react';
import { AtelierNord, LindeBistro, LindeNordic, LindePop, VeloNine } from './sites';
import './showcase.css';

/** Adds `is-in` once the element scrolls into view (for entrance animations). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView] as const;
}

/** A minimal browser frame. `bar` replaces the centred address pill, e.g. with tabs. */
function BrowserWindow({ address, bar, children }: { address?: string; bar?: ReactNode; children: ReactNode }) {
  return (
    <div className="window">
      <div className="window-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        {bar ?? <span className="window-address">{address}</span>}
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}

/** Small "try it" line above an interactive example; fades once the visitor has used it. */
function ExampleHint({ hidden, children }: { hidden: boolean; children: ReactNode }) {
  return (
    <p className={`example-hint ${hidden ? 'is-hidden' : ''}`} aria-hidden>
      <MousePointerClick size={16} strokeWidth={1.8} />
      {children}
    </p>
  );
}

/* 1 — Any style: restyle the site live from the inspector ------------------ */

const TYPEFACES = [
  { name: 'Inter Tight', family: 'var(--font-tight)', weight: 500 },
  { name: 'Fraunces', family: "'Fraunces', serif", weight: 400 },
  { name: 'Bricolage', family: "'Bricolage Grotesque', var(--font-sans)", weight: 800 },
];

const PALETTES = [
  { name: 'Stein', mood: 'Ruhig · Präzise', bg: '#f1efea', ink: '#161616', muted: '#5d5a54', line: '#d9d5cc' },
  { name: 'Nacht', mood: 'Dunkel · Kraftvoll', bg: '#171716', ink: '#eeeae2', muted: '#a29d93', line: '#34322e' },
  { name: 'Salbei', mood: 'Frisch · Natürlich', bg: '#e3e8dc', ink: '#1d2a21', muted: '#566358', line: '#c5cfbd' },
];

// Radii are in cqw so they scale with the mock-up like everything else in it.
const CORNERS = [
  { name: 'Eckig', radius: '0' },
  { name: 'Sanft', radius: '1cqw' },
  { name: 'Rund', radius: '3cqw' },
];

export function StyleExample() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [type, setType] = useState(0);
  const [palette, setPalette] = useState(0);
  const [corners, setCorners] = useState(0);
  const [touched, setTouched] = useState(false);

  const pick = (set: (i: number) => void) => (i: number) => {
    set(i);
    setTouched(true);
  };
  const { bg, ink, muted, line, mood } = PALETTES[palette];
  const style = {
    '--st-bg': bg,
    '--st-ink': ink,
    '--st-muted': muted,
    '--st-line': line,
    '--st-font': TYPEFACES[type].family,
    '--st-weight': TYPEFACES[type].weight,
    '--st-radius': CORNERS[corners].radius,
  } as CSSProperties;

  return (
    <div ref={ref} className={`example ${inView ? 'is-in' : ''}`}>
      <ExampleHint hidden={touched}>Probieren Sie es aus — gestalten Sie die Website live um</ExampleHint>
      <div className="example-window" aria-hidden>
        <BrowserWindow address="Atelier Nord · Konzept">
          <div className="style-live" style={style}>
            <AtelierNord />
          </div>
        </BrowserWindow>
      </div>
      <div className="inspector">
        <strong>Ihr Stil</strong>
        <div className="inspector-row">
          <span>Schrift</span>
          <span className="inspector-segment" role="group" aria-label="Schrift">
            {TYPEFACES.map(({ name, family, weight }, i) => (
              <button
                key={name}
                type="button"
                aria-pressed={i === type}
                aria-label={name}
                title={name}
                style={{ fontFamily: family, fontWeight: weight }}
                onClick={() => pick(setType)(i)}
              >
                Aa
              </button>
            ))}
          </span>
        </div>
        <div className="inspector-row">
          <span>Farben</span>
          <span className="inspector-swatches" role="group" aria-label="Farben">
            {PALETTES.map(({ name, bg, ink }, i) => (
              <button
                key={name}
                type="button"
                aria-pressed={i === palette}
                aria-label={name}
                title={name}
                style={{ background: `linear-gradient(135deg, ${bg} 50%, ${ink} 50%)` }}
                onClick={() => pick(setPalette)(i)}
              />
            ))}
          </span>
        </div>
        <div className="inspector-row">
          <span>Ecken</span>
          <span className="inspector-segment" role="group" aria-label="Ecken">
            {CORNERS.map(({ name }, i) => (
              <button key={name} type="button" aria-pressed={i === corners} onClick={() => pick(setCorners)(i)}>
                {name}
              </button>
            ))}
          </span>
        </div>
        <div className="inspector-row">
          <span>Wirkung</span>
          <span>{mood}</span>
        </div>
      </div>
    </div>
  );
}

/* 2 — Three drafts: one brief, three directions ---------------------------- */

// `swatch` is each draft's page colour, shown as a tiny preview on its tab.
const DRAFTS = [
  { id: 'A', name: 'Nordisch', swatch: '#f5f2ec', Site: LindeNordic },
  { id: 'B', name: 'Bistro', swatch: '#14110e', Site: LindeBistro },
  { id: 'C', name: 'Pop', swatch: '#ffd23f', Site: LindePop },
];

export function DraftsExample() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // The "click to compare" hint goes away once the visitor has tried a tab.
  const [picked, setPicked] = useState(false);

  // Cycle through the drafts while visible, unless the visitor is interacting or prefers less motion.
  useEffect(() => {
    if (!inView || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % DRAFTS.length), 3200);
    return () => window.clearInterval(timer);
  }, [inView, paused]);

  return (
    <div
      ref={ref}
      className={`example ${inView ? 'is-in' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ExampleHint hidden={picked}>Klicken Sie auf einen Tab, um die Entwürfe zu vergleichen</ExampleHint>
      <div className="example-window">
        {/* The drafts switch like browser tabs, so the controls stay out of the page itself. */}
        <BrowserWindow
          bar={
            <div className="window-tabs" role="group" aria-label="Designentwurf ansehen">
              {DRAFTS.map(({ id, name, swatch }, i) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => {
                    setActive(i);
                    setPicked(true);
                  }}
                >
                  <i className="window-tab-swatch" style={{ background: swatch }} />
                  <span>Entwurf {id}</span>
                  <small>{name}</small>
                </button>
              ))}
            </div>
          }
        >
          {DRAFTS.map(({ id, Site }, i) => (
            <div key={id} className={`draft ${i === active ? 'is-active' : ''}`} aria-hidden>
              <Site />
            </div>
          ))}
        </BrowserWindow>
      </div>
    </div>
  );
}

/* 3 — Changes welcome: feedback pinned right onto the design --------------- */

const COMMENTS = [
  { pin: 1, text: 'Kann die Überschrift noch größer sein?', reply: 'Erledigt' },
  { pin: 2, text: 'Super! Können wir den Button in Limette testen?', reply: 'In Entwurf 3 umgesetzt' },
];

// Notes the visitor's own pin cycles through, one per click.
const VISITOR_NOTES = [
  'Kann dieser Bereich etwas größer werden?',
  'Gefällt mir — bitte genau so lassen!',
  'Können wir hier eine wärmere Farbe probieren?',
  'Können wir dieses Foto gegen eines von uns tauschen?',
];

export function FeedbackExample() {
  const [ref, inView] = useInView<HTMLDivElement>();
  // Where the visitor last clicked, in cqw of the window body; `n` counts clicks.
  const [note, setNote] = useState<{ x: number; y: number; n: number } | null>(null);

  const dropPin = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const toCqw = (px: number) => (px / box.width) * 100;
    setNote((prev) => ({
      x: toCqw(event.clientX - box.left),
      y: toCqw(event.clientY - box.top),
      n: (prev?.n ?? -1) + 1,
    }));
  };

  return (
    <div ref={ref} className={`example example-feedback ${inView ? 'is-in' : ''}`} aria-hidden>
      <ExampleHint hidden={note !== null}>Klicken Sie irgendwo ins Design, um eine Notiz zu hinterlassen</ExampleHint>
      <div className="example-window">
        <BrowserWindow address="Velo Nine · Feedback">
          <VeloNine />
          <div className="feedback-canvas" onClick={dropPin} />
          <span className="pin pin-1">1</span>
          <span className="pin pin-2">2</span>
          {note ? (
            <span
              key={note.n}
              className="pin pin-you"
              style={{ left: `${note.x}cqw`, top: `calc(${note.y}cqw - 28px)` }}
            >
              3
            </span>
          ) : null}
        </BrowserWindow>
      </div>
      <div className="comments">
        {COMMENTS.map(({ pin, text, reply }) => (
          <div key={pin} className={`comment comment-${pin}`}>
            <span className="comment-pin">{pin}</span>
            <div>
              <p>{text}</p>
              <span className="comment-reply">
                <Check size={13} strokeWidth={2.6} /> {reply}
              </span>
            </div>
          </div>
        ))}
        {note ? (
          <div key={note.n} className="comment comment-you">
            <span className="comment-pin">3</span>
            <div>
              <p>{VISITOR_NOTES[note.n % VISITOR_NOTES.length]}</p>
              <span className="comment-reply">
                <Check size={13} strokeWidth={2.6} /> Notiert — kommt in die nächste Runde
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
