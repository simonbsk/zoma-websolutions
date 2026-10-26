import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { hasChosenDesign, useDesign, type DesignId } from './DesignProvider';

type OptionId = DesignId | 'soon';

const OPTIONS: { id: OptionId; name: string; blurb: string }[] = [
  { id: 'classic', name: 'Classic', blurb: 'Clean & professional' },
  { id: 'sky', name: 'Sky', blurb: 'A day by the sea' },
  { id: 'soon', name: 'Design three', blurb: 'Coming soon' },
];

const HINT_KEY = 'zoma:design-hint-dismissed';

function hintDismissed(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1';
  } catch {
    return true;
  }
}

function dismissHint() {
  try {
    localStorage.setItem(HINT_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** A column of three design buttons, each a tiny preview of the look it switches to. */
const isCompact = () => window.matchMedia('(max-width: 720px)').matches;

export function DesignSwitcher() {
  const { design, switching, switchDesign } = useDesign();
  const [hint, setHint] = useState(false);
  const [soon, setSoon] = useState(false);
  // On phones the column folds into the current look until tapped.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element).closest('.ds')) setExpanded(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [expanded]);

  // First visit: after a moment, invite the visitor to try another look.
  useEffect(() => {
    if (hasChosenDesign() || hintDismissed()) return;
    const timer = window.setTimeout(() => setHint(true), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!soon) return;
    const timer = window.setTimeout(() => setSoon(false), 2800);
    return () => window.clearTimeout(timer);
  }, [soon]);

  function choose(id: OptionId, e: MouseEvent<HTMLButtonElement>) {
    if (hint) {
      setHint(false);
      dismissHint();
    }
    if (isCompact() && !expanded) {
      setExpanded(true);
      return;
    }
    if (id === 'soon') {
      setSoon(true);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    setExpanded(false);
    switchDesign(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }

  return (
    <aside
      className={['ds', hint ? 'has-hint' : '', expanded ? 'is-expanded' : ''].filter(Boolean).join(' ')}
      aria-label="Choose a website design"
    >
      <span className="ds-title" aria-hidden>
        Designs
      </span>
      {OPTIONS.map((option, i) => {
        const active = option.id === design;
        return (
          <button
            key={option.id}
            type="button"
            className={`ds-btn ds-${option.id} ${active ? 'is-active' : ''}`}
            aria-pressed={option.id === 'soon' ? undefined : active}
            aria-label={`${option.name} design — ${option.blurb}`}
            disabled={switching}
            onClick={(e) => choose(option.id, e)}
            style={{ '--i': i } as CSSProperties}
          >
            <span className="ds-thumb" aria-hidden>
              <span className="ds-art" />
              {option.id === 'soon' ? <Sparkles size={16} className="ds-soon-icon" /> : null}
            </span>
            <span className="ds-num" aria-hidden>
              {active ? <Check size={11} strokeWidth={3} /> : i + 1}
            </span>
            <span className="ds-label" aria-hidden>
              <strong>{option.name}</strong>
              <span>{active ? 'You’re viewing this' : option.blurb}</span>
            </span>
          </button>
        );
      })}
      <span className="ds-cue" aria-hidden>
        3 looks
      </span>

      {hint ? (
        <div className="ds-callout" role="status">
          <span>
            This website has more than one look. <strong>Tap a design to transform it.</strong>
          </span>
          <button
            type="button"
            className="ds-callout-close"
            aria-label="Dismiss"
            onClick={() => {
              setHint(false);
              dismissHint();
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : null}
      {soon ? (
        <div className="ds-callout ds-callout-soon" role="status">
          <Sparkles size={15} />
          <span>A third design is in the works — check back soon.</span>
        </div>
      ) : null}
    </aside>
  );
}
