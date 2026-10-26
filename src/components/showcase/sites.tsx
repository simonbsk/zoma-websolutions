import { useId } from 'react';
import './sites.css';

/*
 * Fictional client websites used as showcase artwork. Every dimension inside a
 * site is expressed in `cqw` (1% of the site's width), so the same mock-up renders
 * identically as a small hero tile or inside a large browser window. Content
 * below the first screen (50cqw) only shows in taller frames.
 */

const img = (name: string) => `/showcase/${name}.webp`;

function Photo({ name, className = '' }: { name: string; className?: string }) {
  return <img className={`s-photo ${className}`} src={img(name)} alt="" loading="lazy" decoding="async" />;
}

/* Architecture studio — Swiss minimal ------------------------------------- */

export function AtelierNord() {
  return (
    <div className="site s-atelier">
      <div className="s-nav">
        <span className="s-logo">Atelier Nord</span>
        <span className="s-links">
          <span>Projects</span>
          <span>Studio</span>
          <span>Journal</span>
          <span>Contact</span>
        </span>
        <span className="s-talk">Let's talk ↗</span>
      </div>
      <div className="s-hero">
        <div className="s-copy">
          <span className="s-index">(01) Selected work 2019 — 2026</span>
          <div>
            <div className="s-title">
              Quiet spaces,
              <br />
              built to last.
            </div>
            <div className="s-row">
              <p>Architecture and interiors for homes, studios and small public buildings across Northern Germany.</p>
              <span className="s-more">View projects ↗</span>
            </div>
          </div>
        </div>
        <div className="s-media">
          <Photo name="atelier-facade" />
          <span className="s-caption">Haus am Hang — 2025</span>
        </div>
      </div>
      <div className="s-work">
        <div className="s-work-head">
          <span>Selected projects</span>
          <span className="s-count">(12)</span>
        </div>
        <div className="s-work-grid">
          {[
            ['atelier-timber', 'Timber House', 'Lüneburg'],
            ['atelier-interior', 'Studio Elbe', 'Hamburg'],
            ['atelier-facade', 'Haus am Hang', 'Kiel'],
          ].map(([photo, name, city]) => (
            <div key={name} className="s-work-item">
              <Photo name={photo} />
              <div className="s-work-meta">
                <span>{name}</span>
                <span>{city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Coffee roaster — loud and warm ----------------------------------------- */

export function GlutRoastery() {
  return (
    <div className="site s-glut">
      <div className="s-nav">
        <span className="s-logo">glut.</span>
        <span className="s-links">
          <span>Shop</span>
          <span>Subscriptions</span>
          <span>Café</span>
          <span>Story</span>
        </span>
        <span className="s-cart">Cart (2)</span>
      </div>
      <div className="s-hero">
        <div className="s-title">
          Roasted
          <br />
          with fire.
        </div>
        <p className="s-sub">Small-batch speciality coffee from Leipzig. Roasted every Tuesday, at your door by Friday.</p>
        <div className="s-actions">
          <span className="s-btn">Shop the beans</span>
          <span className="s-btn s-btn-line">Try a subscription</span>
        </div>
        <div className="s-disc">
          <Photo name="glut-cup" />
        </div>
        <span className="s-sticker">
          New
          <br />
          Ethiopia
          <br />
          Guji
        </span>
      </div>
      <div className="s-band">
        <span>Free shipping from €30</span>
        <span>✺</span>
        <span>Roasted to order</span>
        <span>✺</span>
        <span>Compostable bags</span>
      </div>
    </div>
  );
}

/* Bicycle brand — dark, sporty, lime ------------------------------------- */

export function VeloNine() {
  return (
    <div className="site s-velo">
      <div className="s-hero">
        <Photo name="velo-riders" className="s-bg" />
        <div className="s-shade" />
        <div className="s-nav">
          <span className="s-logo">
            Velo<b>/9</b>
          </span>
          <span className="s-links">
            <span>Bikes</span>
            <span>Gear</span>
            <span>Rides</span>
            <span>Service</span>
          </span>
          <span className="s-shop">Shop now</span>
        </div>
        <div className="s-copy">
          <span className="s-kicker">New · Aero 9 Carbon</span>
          <div className="s-title">
            Ride
            <br />
            further<b>.</b>
          </div>
          <div className="s-row">
            <span className="s-cta">Configure yours ↗</span>
            <span className="s-spec">7.4 kg · Shimano 105 Di2 · from €3,490</span>
          </div>
        </div>
        <div className="s-dots">
          <i className="is-on" />
          <i />
          <i />
        </div>
      </div>
      <div className="s-more">
        <div className="s-more-title">Built for the long way round.</div>
        <div className="s-cards">
          <div className="s-card s-card-photo">
            <Photo name="velo-ride" />
            <span>Gravel 9 — from €2,790</span>
          </div>
          <div className="s-card s-card-lime">
            <span className="s-big">Free bike fitting</span>
            <span>with every new frame. Book in store or online.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Law firm — navy, serif, restrained ------------------------------------- */

export function HafenLegal() {
  return (
    <div className="site s-hafen">
      <div className="s-nav">
        <span className="s-logo">
          Hafen &amp; Co.
          <small>Attorneys at law</small>
        </span>
        <span className="s-links">
          <span>Expertise</span>
          <span>Team</span>
          <span>Insights</span>
          <span>Careers</span>
        </span>
        <span className="s-btn">Book a consultation</span>
      </div>
      <div className="s-hero">
        <div className="s-copy">
          <span className="s-kicker">Commercial · Employment · Real estate</span>
          <div className="s-title">
            Clarity in every
            <br />
            <em>decision.</em>
          </div>
          <p>Independent advice for owner-led companies — precise, discreet and always on your side of the table.</p>
          <div className="s-stats">
            <span>
              <b>35+</b> years of practice
            </span>
            <span>
              <b>1,200</b> cases closed
            </span>
            <span>
              <b>4.9</b> client rating
            </span>
          </div>
        </div>
        <div className="s-media">
          <Photo name="hafen-towers" />
          <div className="s-quote">
            “They made a complex merger feel simple.”
            <small>Managing director, logistics group</small>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Florist — blush, editorial serif --------------------------------------- */

export function MaisonFlora() {
  return (
    <div className="site s-flora">
      <div className="s-nav">
        <span className="s-links">
          <span>Bouquets</span>
          <span>Weddings</span>
          <span>Events</span>
        </span>
        <span className="s-logo">Maison Flora</span>
        <span className="s-links s-links-end">
          <span>Workshops</span>
          <span>Bag (0)</span>
        </span>
      </div>
      <div className="s-hero">
        <div className="s-title">
          Flowers for the
          <br />
          <em>in-between</em> days
        </div>
        <div className="s-arch">
          <Photo name="flora-tulips" />
        </div>
        <div className="s-note">
          Same-day delivery
          <br />
          across Munich
          <span>Order by 2 pm →</span>
        </div>
        <span className="s-badge">
          Seasonal
          <br />
          &amp; hand-tied
        </span>
      </div>
    </div>
  );
}

/* SaaS product — bright, precise, violet --------------------------------- */

export function OrbitAnalytics() {
  // The site renders several times in the hero, so the gradient id must be unique.
  const fillId = `orbit-fill${useId().replace(/:/g, '')}`;
  return (
    <div className="site s-orbit">
      <div className="s-nav">
        <span className="s-logo">
          <i />
          orbit
        </span>
        <span className="s-links">
          <span>Product</span>
          <span>Pricing</span>
          <span>Customers</span>
          <span>Docs</span>
        </span>
        <span className="s-auth">
          <span>Sign in</span>
          <span className="s-btn">Start free trial</span>
        </span>
      </div>
      <div className="s-hero">
        <span className="s-pill">✦ New: AI forecasts →</span>
        <div className="s-title">
          Know your numbers
          <br />
          before they happen.
        </div>
        <p>Live revenue, retention and forecasting for teams that would rather act than wait for reports.</p>
        <div className="s-actions">
          <span className="s-btn">Start free trial</span>
          <span className="s-btn s-btn-ghost">Book a demo</span>
        </div>
        <div className="s-dash">
          <div className="s-dash-side">
            <i className="is-on" />
            <i />
            <i />
            <i />
          </div>
          <div className="s-dash-main">
            <div className="s-kpis">
              <span>
                Revenue <b>€128.4k</b> <em>+12.6%</em>
              </span>
              <span>
                Active users <b>8,214</b> <em>+4.1%</em>
              </span>
              <span>
                Churn <b>1.8%</b> <em>−0.3%</em>
              </span>
            </div>
            <svg className="s-chart" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#5b3df5" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#5b3df5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 96 C40 90 60 70 100 74 S160 88 200 60 S260 40 300 46 S360 22 400 12 L400 120 L0 120 Z"
                fill={`url(#${fillId})`}
              />
              <path
                d="M0 96 C40 90 60 70 100 74 S160 88 200 60 S260 40 300 46 S360 22 400 12"
                fill="none"
                stroke="#5b3df5"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Café — the same brief in three design directions ------------------------ */

export function LindeNordic() {
  return (
    <div className="site s-linde-a">
      <div className="s-nav">
        <span className="s-logo">Café Linde</span>
        <span className="s-links">
          <span>Menu</span>
          <span>Breakfast</span>
          <span>Events</span>
          <span>Visit</span>
        </span>
        <span className="s-btn s-btn-line">Reserve a table</span>
      </div>
      <div className="s-hero">
        <div className="s-copy">
          <span className="s-open">
            <i /> Open today · 8:00 – 18:00
          </span>
          <div className="s-title">
            Slow coffee.
            <br />
            Good company.
          </div>
          <p>Seasonal breakfast, house-baked cardamom buns and coffee from small roasters — right by the canal.</p>
          <div className="s-actions">
            <span className="s-btn">See the menu</span>
            <span className="s-link">Find us →</span>
          </div>
        </div>
        <div className="s-media">
          <Photo name="linde-interior" />
        </div>
      </div>
      <div className="s-menu">
        {[
          ['Cardamom bun', '3.80'],
          ['Flat white', '3.90'],
          ['Sourdough & eggs', '9.50'],
        ].map(([item, price]) => (
          <span key={item}>
            {item}
            <b>{price}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function LindeBistro() {
  return (
    <div className="site s-linde-b">
      <div className="s-nav">
        <span className="s-links">
          <span>Menu</span>
          <span>Wine</span>
          <span>Events</span>
        </span>
        <span className="s-logo">
          Café Linde
          <small>est. 1987</small>
        </span>
        <span className="s-btn s-btn-line">Reservations</span>
      </div>
      <div className="s-hero">
        <div className="s-media">
          <Photo name="linde-bar" />
        </div>
        <div className="s-copy">
          <span className="s-kicker">Bistro · Bar · Kaffeehaus</span>
          <div className="s-title">
            Coffee by day,
            <br />
            <em>wine by night.</em>
          </div>
          <p>Hand-brewed coffee until five, natural wines and small plates until late. Thursday to Saturday until midnight.</p>
          <span className="s-btn">Book a table</span>
        </div>
      </div>
      <div className="s-menu">
        {[
          ['Espresso tonic', '4.50'],
          ['Burrata & figs', '12.00'],
          ['Glass of Riesling', '7.00'],
        ].map(([item, price]) => (
          <span key={item}>
            {item}
            <i />
            <b>{price}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

export function LindePop() {
  return (
    <div className="site s-linde-c">
      <div className="s-nav">
        <span className="s-logo">linde!</span>
        <span className="s-links">
          <span>Menu</span>
          <span>Bowls</span>
          <span>Catering</span>
          <span>Hi!</span>
        </span>
        <span className="s-btn">Order pickup</span>
      </div>
      <div className="s-hero">
        <div className="s-title">
          Berry
          <br />
          good
          <br />
          mornings.
        </div>
        <p>Bowls, buns and very good coffee. Open daily from 7 — come hungry.</p>
        <div className="s-tile">
          <Photo name="linde-berries" />
        </div>
        <span className="s-sticker">
          New
          <br />
          menu!
        </span>
      </div>
      <div className="s-band">
        <span>Fresh pastry</span>
        <span>✦</span>
        <span>Organic coffee</span>
        <span>✦</span>
        <span>Berry bowls</span>
        <span>✦</span>
        <span>Fresh pastry</span>
      </div>
      <div className="s-bowls">
        <span className="s-bowls-title">Today's bowls</span>
        <div className="s-bowls-grid">
          {[
            ['Berry blast', '8.50'],
            ['Green glow', '8.90'],
            ['Choco crunch', '7.90'],
          ].map(([name, price]) => (
            <span key={name}>
              <b>{name}</b>€{price}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
