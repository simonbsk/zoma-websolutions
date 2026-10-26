import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './concepts.css';

/*
 * Three concept websites for the showcase — one per ink colour, three business models:
 *   Vela      (iris)    software as a service — an invoicing app
 *   Wildpath  (verdant) tours & bookings — guided hikes
 *   Crumb     (saffron) local shop & pre-orders — a neighbourhood bakery, shown on a phone
 * They are pictures built from HTML: every size is in `em`, and the root font size follows the
 * frame width (container query units), so each site scales like a screenshot.
 */

export function BrowserFrame({
  url,
  children,
  className = '',
  ...rest
}: { url: string; children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bframe ${className}`} {...rest}>
      <div className="bframe-bar" aria-hidden>
        <span className="bframe-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="bframe-url">{url}</span>
      </div>
      <div className="bframe-screen">{children}</div>
    </div>
  );
}

export function PhoneFrame({ children, className = '', ...rest }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pframe ${className}`} {...rest}>
      <div className="pframe-screen">{children}</div>
    </div>
  );
}

function PhoneStatus() {
  return (
    <div className="phone-status">
      <span>9:41</span>
      <span className="phone-icons">
        <i />
        <i />
        <i />
        <b />
      </span>
    </div>
  );
}

/* Vela ------------------------------------------------------------------------ */

const VELA_BARS = [42, 55, 38, 64, 58, 72, 49, 80, 68, 88, 76, 95];

function VelaMark() {
  return (
    <svg className="vela-mark" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.5 14.6 9.4 21.5 12 14.6 14.6 12 21.5 9.4 14.6 2.5 12 9.4 9.4Z" fill="currentColor" />
    </svg>
  );
}

export function VelaSite() {
  return (
    <div className="cx vela" aria-hidden>
      <div className="vela-glow" />
      <div className="vela-nav">
        <span className="vela-logo">
          <VelaMark /> vela
        </span>
        <span className="vela-links">
          <span>Product</span>
          <span>Pricing</span>
          <span>Customers</span>
          <span>Docs</span>
        </span>
        <span className="vela-nav-cta">
          <span>Log in</span>
          <span className="vela-btn vela-btn-sm">Start free</span>
        </span>
      </div>
      <div className="vela-hero">
        <span className="vela-pill">
          <b>New</b> Automatic payment reminders →
        </span>
        <div className="vela-title">Invoices that chase themselves.</div>
        <p className="vela-sub">
          Vela sends, tracks and follows up every invoice — so freelancers and studios get paid on time, without the
          awkward emails.
        </p>
        <div className="vela-ctas">
          <span className="vela-btn">Start free — 14 days</span>
          <span className="vela-btn vela-btn-ghost">Book a demo</span>
        </div>
        <span className="vela-fine">No card required · Cancel anytime</span>
      </div>
      <div className="vela-app">
        <div className="vela-side">
          <span className="vela-side-logo">
            <VelaMark />
          </span>
          <i className="is-on" />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="vela-main">
          <div className="vela-main-head">
            <strong>Overview</strong>
            <span>October</span>
          </div>
          <div className="vela-kpis">
            <div>
              <span>Paid this month</span>
              <strong>€48,210</strong>
              <em>+18%</em>
            </div>
            <div>
              <span>Outstanding</span>
              <strong>€12,480</strong>
              <em className="is-quiet">9 invoices</em>
            </div>
            <div>
              <span>Overdue</span>
              <strong>€1,920</strong>
              <em className="is-warn">2 reminders sent</em>
            </div>
          </div>
          <div className="vela-chart">
            {VELA_BARS.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VelaMobile() {
  return (
    <div className="cx cx-phone vela vela-m" aria-hidden>
      <div className="vela-glow" />
      <PhoneStatus />
      <div className="vela-nav">
        <span className="vela-logo">
          <VelaMark /> vela
        </span>
        <span className="vela-burger">
          <i />
          <i />
        </span>
      </div>
      <div className="vela-hero">
        <span className="vela-pill">
          <b>New</b> Auto reminders
        </span>
        <div className="vela-title">Invoices that chase themselves.</div>
        <p className="vela-sub">Sends, tracks and follows up — you get paid on time.</p>
        <span className="vela-btn">Start free</span>
      </div>
      <div className="vela-card">
        <span>Paid this month</span>
        <strong>€48,210</strong>
        <div className="vela-chart">
          {VELA_BARS.slice(4).map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Wildpath ------------------------------------------------------------------- */

/** A ridge of pines: a deterministic zigzag of tree tips along the top edge. */
function forestClip(seed: number): string {
  const points: string[] = ['0% 100%'];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let x = 0; x <= 100; x += 1.4) {
    const base = 40 + Math.sin(x / 9 + seed) * 8;
    points.push(`${x.toFixed(1)}% ${(base + 18 + rand() * 6).toFixed(1)}%`);
    points.push(`${(x + 0.7).toFixed(1)}% ${(base - rand() * 22).toFixed(1)}%`);
  }
  points.push('100% 100%');
  return `polygon(${points.join(', ')})`;
}

const FOREST_FAR = forestClip(3);
const FOREST_NEAR = forestClip(11);

export function WildpathSite() {
  return (
    <div className="cx wild" aria-hidden>
      <div className="wild-sky" />
      <div className="wild-sun" />
      <div className="wild-range wild-range-1" />
      <div className="wild-range wild-range-2" />
      <div className="wild-mist" />
      <div className="wild-forest wild-forest-far" style={{ clipPath: FOREST_FAR } as CSSProperties} />
      <div className="wild-forest wild-forest-near" style={{ clipPath: FOREST_NEAR } as CSSProperties} />

      <div className="wild-nav">
        <span className="wild-logo">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M2 20 9 7l4 6 3-4 6 11Z" fill="currentColor" />
          </svg>
          Wildpath
        </span>
        <span className="wild-links">
          <span>Tours</span>
          <span>Guides</span>
          <span>Huts</span>
          <span>Journal</span>
        </span>
        <span className="wild-btn">Book a tour</span>
      </div>

      <div className="wild-hero">
        <span className="wild-kicker">Guided hikes · Alps &amp; Dolomites</span>
        <div className="wild-title">
          Walk where
          <br />
          the maps end
        </div>
        <p className="wild-sub">Small groups, local guides and huts with a view. 42 routes, from easy to epic.</p>
      </div>

      <div className="wild-rating">
        <b>4.9</b>
        <span className="wild-stars">★★★★★</span>
        <span>1,240 reviews</span>
      </div>

      <div className="wild-search">
        <div>
          <span>Tour</span>
          <strong>Dolomites hut to hut</strong>
        </div>
        <div>
          <span>Dates</span>
          <strong>14 – 19 July</strong>
        </div>
        <div>
          <span>Hikers</span>
          <strong>2 adults</strong>
        </div>
        <span className="wild-btn wild-btn-go">Check availability</span>
      </div>
    </div>
  );
}

/* Crumb ---------------------------------------------------------------------- */

export function CrumbSite() {
  return (
    <div className="cx cx-phone crumb" aria-hidden>
      <PhoneStatus />
      <div className="crumb-nav">
        <span className="crumb-logo">Crumb</span>
        <span className="crumb-icons">
          <span className="crumb-bag">2</span>
          <span className="crumb-burger">
            <i />
            <i />
          </span>
        </span>
      </div>
      <div className="crumb-hero">
        <div className="crumb-sun" />
        <div className="crumb-loaf">
          <i />
          <i />
          <i />
        </div>
        <div className="crumb-bun" />
        <span className="crumb-badge">Fresh from 6:30</span>
      </div>
      <div className="crumb-body">
        <div className="crumb-title">
          Baked before <em>sunrise.</em>
        </div>
        <p className="crumb-sub">Sourdough, cinnamon buns and the best coffee on Linden Street.</p>
        <span className="crumb-btn">Pre-order for tomorrow →</span>
        <span className="crumb-open">
          <i /> Open now · until 6 pm
        </span>
      </div>
      <div className="crumb-row">
        <span className="crumb-label">Today’s bakes</span>
        <div className="crumb-items">
          <div className="crumb-item">
            <span className="crumb-thumb crumb-thumb-bun" />
            <strong>Cinnamon bun</strong>
            <span>€3.10</span>
          </div>
          <div className="crumb-item">
            <span className="crumb-thumb crumb-thumb-sour" />
            <strong>Sourdough</strong>
            <span>€5.20</span>
          </div>
        </div>
      </div>
    </div>
  );
}
