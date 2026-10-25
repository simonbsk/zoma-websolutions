import { Check, ShoppingBag, Gauge, ShieldCheck, LayoutGrid, CalendarCheck2 } from 'lucide-react';
import type { ServiceVisual as VisualKind } from '../../lib/types';
import './visuals.css';

/* Small building blocks ----------------------------------------------------- */

function Bar({ w, tone = 'ink', h = 6 }: { w: string; tone?: 'ink' | 'soft' | 'teal' | 'mist'; h?: number }) {
  return <span className={`v-bar v-bar-${tone}`} style={{ width: w, height: h }} />;
}

function BrowserChrome({ url = 'zoma.studio' }: { url?: string }) {
  return (
    <div className="v-chrome">
      <span className="v-dots">
        <i />
        <i />
        <i />
      </span>
      <span className="v-url">{url}</span>
    </div>
  );
}

function Ring({ value, label }: { value: number; label: string }) {
  const r = 15.5;
  const c = 2 * Math.PI * r;
  return (
    <div className="v-ring">
      <svg viewBox="0 0 36 36" width="44" height="44" aria-hidden>
        <circle cx="18" cy="18" r={r} className="v-ring-track" />
        <circle
          cx="18"
          cy="18"
          r={r}
          className="v-ring-value"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform="rotate(-90 18 18)"
        />
        <text x="18" y="21.5" textAnchor="middle">
          {value}
        </text>
      </svg>
      <span>{label}</span>
    </div>
  );
}

/* Service card visuals ------------------------------------------------------ */

function LandingVisual() {
  return (
    <div className="v-float v-browser">
      <BrowserChrome />
      <div className="v-page">
        <div className="v-nav">
          <span className="v-logo" />
          <Bar w="22%" tone="mist" h={5} />
          <span className="v-pill-mini" />
        </div>
        <div className="v-hero-split">
          <div className="v-stack">
            <Bar w="90%" h={8} />
            <Bar w="70%" h={8} />
            <Bar w="80%" tone="soft" h={4} />
            <span className="v-cta" />
          </div>
          <div className="v-image" />
        </div>
      </div>
    </div>
  );
}

function EcommerceVisual() {
  return (
    <div className="v-commerce">
      <div className="v-float v-product">
        <div className="v-product-img">
          <ShoppingBag size={22} strokeWidth={1.5} />
        </div>
        <Bar w="70%" h={6} />
        <Bar w="40%" tone="soft" h={4} />
        <div className="v-row">
          <Bar w="30%" tone="teal" h={7} />
          <span className="v-cta v-cta-sm" />
        </div>
      </div>
      <div className="v-float v-cart">
        <span className="v-check">
          <Check size={12} strokeWidth={3} />
        </span>
        <div className="v-stack">
          <Bar w="64px" h={5} />
          <Bar w="40px" tone="soft" h={4} />
        </div>
      </div>
    </div>
  );
}

function BrandVisual() {
  return (
    <div className="v-float v-brand">
      <div className="v-specimen">
        <span className="v-aa">Aa</span>
        <div className="v-stack">
          <Bar w="80%" h={5} />
          <Bar w="60%" tone="soft" h={4} />
          <Bar w="70%" tone="soft" h={4} />
        </div>
      </div>
      <div className="v-swatches">
        <i style={{ background: '#1f4e4a' }} />
        <i style={{ background: '#5b958c' }} />
        <i style={{ background: '#e2ece9' }} />
        <i style={{ background: '#17191c' }} />
        <i style={{ background: '#f3f2ee' }} />
      </div>
    </div>
  );
}

function WebAppVisual() {
  const bars = [38, 56, 44, 70, 52, 84, 66];
  return (
    <div className="v-float v-app">
      <div className="v-app-side">
        <span className="v-logo" />
        <LayoutGrid size={12} />
        <CalendarCheck2 size={12} />
        <Bar w="14px" tone="mist" h={4} />
      </div>
      <div className="v-app-main">
        <div className="v-row">
          <Bar w="38%" h={6} />
          <span className="v-pill-mini" />
        </div>
        <div className="v-chart">
          {bars.map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} className={i === 5 ? 'is-hi' : ''} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SeoVisual() {
  return (
    <div className="v-float v-seo">
      <div className="v-seo-head">
        <Gauge size={14} />
        <Bar w="44%" h={5} />
      </div>
      <div className="v-rings">
        <Ring value={100} label="Perf." />
        <Ring value={98} label="A11y" />
        <Ring value={100} label="SEO" />
      </div>
    </div>
  );
}

function CareVisual() {
  return (
    <div className="v-float v-care">
      <div className="v-seo-head">
        <ShieldCheck size={14} />
        <Bar w="40%" h={5} />
      </div>
      {['Backups', 'Updates', 'Monitoring'].map((item) => (
        <div className="v-care-row" key={item}>
          <span className="v-check">
            <Check size={10} strokeWidth={3} />
          </span>
          <span>{item}</span>
          <Bar w="28px" tone="mist" h={4} />
        </div>
      ))}
    </div>
  );
}

const VISUALS: Record<VisualKind, () => JSX.Element> = {
  landing: LandingVisual,
  ecommerce: EcommerceVisual,
  brand: BrandVisual,
  webapp: WebAppVisual,
  seo: SeoVisual,
  care: CareVisual,
};

export function ServiceVisual({ kind, compact }: { kind: VisualKind; compact?: boolean }) {
  const Visual = VISUALS[kind] ?? LandingVisual;
  return (
    <div className={`v-stage ${compact ? 'v-stage-compact' : ''}`} aria-hidden>
      <Visual />
    </div>
  );
}

/* Hero collage --------------------------------------------------------------- */

export function HeroCollage() {
  return (
    <div className="hero-collage" aria-hidden>
      <div className="v-float hc-browser">
        <BrowserChrome url="yourbrand.com" />
        <div className="hc-page">
          <div className="v-nav">
            <span className="v-logo" />
            <span className="v-row" style={{ gap: 10 }}>
              <Bar w="34px" tone="mist" h={5} />
              <Bar w="34px" tone="mist" h={5} />
              <Bar w="34px" tone="mist" h={5} />
            </span>
            <span className="v-pill-mini" />
          </div>
          <div className="hc-hero">
            <div className="v-stack" style={{ gap: 10 }}>
              <Bar w="40%" tone="teal" h={5} />
              <Bar w="92%" h={12} />
              <Bar w="74%" h={12} />
              <Bar w="84%" tone="soft" h={5} />
              <Bar w="62%" tone="soft" h={5} />
              <div className="v-row" style={{ gap: 8, marginTop: 6 }}>
                <span className="v-cta" />
                <span className="v-cta v-cta-ghost" />
              </div>
            </div>
            <div className="hc-image">
              <div className="hc-image-inner" />
            </div>
          </div>
          <div className="hc-cards">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className="v-float hc-booking">
        <div className="hc-booking-head">
          <span className="v-check v-check-lg">
            <Check size={14} strokeWidth={3} />
          </span>
          <div>
            <strong>Request received</strong>
            <span>Strategy call · 45 min</span>
          </div>
        </div>
        <div className="hc-slots">
          <span>09:30</span>
          <span className="is-active">10:00</span>
          <span>10:30</span>
        </div>
      </div>

      <div className="v-float hc-score">
        <Ring value={100} label="Performance" />
      </div>

      <div className="v-float hc-palette">
        <span className="v-aa">Aa</span>
        <div className="v-swatches">
          <i style={{ background: '#1f4e4a' }} />
          <i style={{ background: '#5b958c' }} />
          <i style={{ background: '#e2ece9' }} />
        </div>
      </div>
    </div>
  );
}

/* About composition --------------------------------------------------------- */

export function AboutComposition() {
  return (
    <div className="about-comp" aria-hidden>
      <div className="ac-panel">
        <div className="ac-grid" />
        <div className="v-float ac-wire">
          <div className="v-row" style={{ justifyContent: 'space-between' }}>
            <Bar w="30%" h={6} />
            <Bar w="18%" tone="mist" h={6} />
          </div>
          <div className="ac-wire-blocks">
            <span className="tall" />
            <span />
            <span />
          </div>
          <Bar w="70%" tone="soft" h={4} />
          <Bar w="50%" tone="soft" h={4} />
        </div>
        <div className="v-float ac-tokens">
          <div className="ac-token">
            <i style={{ background: '#1f4e4a' }} />
            <span>teal-800</span>
          </div>
          <div className="ac-token">
            <i style={{ background: '#17191c' }} />
            <span>ink</span>
          </div>
          <div className="ac-token">
            <i style={{ background: '#f3f2ee', boxShadow: 'inset 0 0 0 1px #e6e4de' }} />
            <span>band</span>
          </div>
        </div>
        <div className="v-float ac-code">
          <span>
            <b>const</b> site = <em>build</em>(&#123;
          </span>
          <span>&nbsp;&nbsp;fast: <b>true</b>,</span>
          <span>&nbsp;&nbsp;accessible: <b>true</b>,</span>
          <span>&#125;);</span>
        </div>
      </div>
    </div>
  );
}
