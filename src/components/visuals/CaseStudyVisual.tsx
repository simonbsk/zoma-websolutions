import { Check } from 'lucide-react';
import './case-visual.css';

const PRODUCTS = [
  { name: 'Country sourdough', price: '€5.40', tone: 'a' },
  { name: 'Dark rye', price: '€4.80', tone: 'b' },
  { name: 'Butter croissant', price: '€1.90', tone: 'c' },
  { name: 'Laugenbrezel', price: '€1.20', tone: 'd' },
];

/** Illustration of the (sample) Sonnenhof Bakery site: desktop pre-order page plus the mobile checkout. */
export function CaseStudyVisual() {
  return (
    <div className="cs-stage" aria-hidden>
      <div className="cs-browser">
        <div className="cs-chrome">
          <span className="cs-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="cs-url">sonnenhof-bakery.de</span>
        </div>
        <div className="cs-site">
          <div className="cs-nav">
            <span className="cs-logo">Sonnenhof</span>
            <span className="cs-links">
              <i />
              <i />
              <i />
            </span>
            <span className="cs-pill">Pre-order</span>
          </div>
          <div className="cs-hero">
            <div className="cs-hero-copy">
              <span className="cs-kicker">Since 1961 · Freiburg</span>
              <strong>Baked at four. Yours by seven.</strong>
              <span className="cs-line" />
              <span className="cs-line short" />
              <span className="cs-pill cs-pill-lg">Pre-order for tomorrow</span>
            </div>
            <div className="cs-hero-img">
              <span className="cs-loaf cs-loaf-1" />
              <span className="cs-loaf cs-loaf-2" />
              <span className="cs-sunbeam" />
            </div>
          </div>
          <div className="cs-products">
            {PRODUCTS.map((p) => (
              <div key={p.name} className="cs-product">
                <span className={`cs-product-img tone-${p.tone}`}>
                  <span className="cs-loaf" />
                </span>
                <span className="cs-product-name">{p.name}</span>
                <span className="cs-product-row">
                  <span>{p.price}</span>
                  <span className="cs-add">+</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cs-phone">
        <div className="cs-phone-notch" />
        <span className="cs-phone-title">Your pre-order</span>
        <div className="cs-phone-item">
          <span>2 × Country sourdough</span>
          <span>€10.80</span>
        </div>
        <div className="cs-phone-item">
          <span>4 × Butter croissant</span>
          <span>€7.60</span>
        </div>
        <span className="cs-phone-label">Pickup tomorrow</span>
        <div className="cs-slots">
          <span>6:30</span>
          <span className="is-active">7:00</span>
          <span>7:30</span>
        </div>
        <span className="cs-phone-pay">Pay €18.40</span>
        <span className="cs-phone-done">
          <Check size={11} strokeWidth={3} /> Ready at 7:00
        </span>
      </div>
    </div>
  );
}
