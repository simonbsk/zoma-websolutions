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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
          <span>Projekte</span>
          <span>Studio</span>
          <span>Journal</span>
          <span>Kontakt</span>
        </span>
        <span className="s-talk">Anfragen ↗</span>
      </div>
      <div className="s-hero">
        <div className="s-copy">
          <span className="s-index">(01) Ausgewählte Arbeiten 2019 — 2026</span>
          <div>
            <div className="s-title">
              Ruhige Räume,
              <br />
              die bleiben.
            </div>
            <div className="s-row">
              <p>Architektur und Innenräume für Wohnhäuser, Ateliers und kleine öffentliche Bauten in ganz Norddeutschland.</p>
              <span className="s-more">Projekte ansehen ↗</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
          <span>Selected projects</span>
=======
          <span>Ausgewählte Projekte</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          <span>Selected projects</span>
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          <span className="s-count">(12)</span>
        </div>
        <div className="s-work-grid">
          {[
<<<<<<< HEAD
<<<<<<< HEAD
            ['atelier-timber', 'Timber House', 'Lüneburg'],
=======
            ['atelier-timber', 'Holzhaus', 'Lüneburg'],
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
            ['atelier-timber', 'Timber House', 'Lüneburg'],
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
          <span>Abos</span>
          <span>Café</span>
          <span>Geschichte</span>
        </span>
        <span className="s-cart">Warenkorb (2)</span>
      </div>
      <div className="s-hero">
        <div className="s-title">
          Feurig
          <br />
          geröstet.
        </div>
        <p className="s-sub">Spezialitätenkaffee in kleinen Chargen aus Leipzig. Jeden Dienstag geröstet, freitags bei Ihnen.</p>
        <div className="s-actions">
          <span className="s-btn">Bohnen kaufen</span>
          <span className="s-btn s-btn-line">Abo testen</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        </div>
        <div className="s-disc">
          <Photo name="glut-cup" />
        </div>
        <span className="s-sticker">
<<<<<<< HEAD
<<<<<<< HEAD
          New
          <br />
          Ethiopia
=======
          Neu
          <br />
          Äthiopien
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          New
          <br />
          Ethiopia
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          <br />
          Guji
        </span>
      </div>
      <div className="s-band">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        <span>Free shipping from €30</span>
        <span>✺</span>
        <span>Roasted to order</span>
        <span>✺</span>
        <span>Compostable bags</span>
<<<<<<< HEAD
=======
        <span>Gratisversand ab 30 €</span>
        <span>✺</span>
        <span>Auf Bestellung geröstet</span>
        <span>✺</span>
        <span>Kompostierbare Tüten</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
            <span>Räder</span>
            <span>Ausrüstung</span>
            <span>Touren</span>
            <span>Service</span>
          </span>
          <span className="s-shop">Jetzt shoppen</span>
        </div>
        <div className="s-copy">
          <span className="s-kicker">Neu · Aero 9 Carbon</span>
          <div className="s-title">
            Weiter
            <br />
            fahren<b>.</b>
          </div>
          <div className="s-row">
            <span className="s-cta">Jetzt konfigurieren ↗</span>
            <span className="s-spec">7,4 kg · Shimano 105 Di2 · ab 3.490 €</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          </div>
        </div>
        <div className="s-dots">
          <i className="is-on" />
          <i />
          <i />
        </div>
      </div>
      <div className="s-more">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        <div className="s-more-title">Built for the long way round.</div>
        <div className="s-cards">
          <div className="s-card s-card-photo">
            <Photo name="velo-ride" />
            <span>Gravel 9 — from €2,790</span>
          </div>
          <div className="s-card s-card-lime">
            <span className="s-big">Free bike fitting</span>
            <span>with every new frame. Book in store or online.</span>
<<<<<<< HEAD
=======
        <div className="s-more-title">Gebaut für den langen Weg.</div>
        <div className="s-cards">
          <div className="s-card s-card-photo">
            <Photo name="velo-ride" />
            <span>Gravel 9 — ab 2.790 €</span>
          </div>
          <div className="s-card s-card-lime">
            <span className="s-big">Kostenloses Bikefitting</span>
            <span>zu jedem neuen Rahmen. Im Laden oder online buchen.</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
          <small>Rechtsanwälte</small>
        </span>
        <span className="s-links">
          <span>Kompetenzen</span>
          <span>Team</span>
          <span>Einblicke</span>
          <span>Karriere</span>
        </span>
        <span className="s-btn">Beratung vereinbaren</span>
      </div>
      <div className="s-hero">
        <div className="s-copy">
          <span className="s-kicker">Wirtschaft · Arbeitsrecht · Immobilien</span>
          <div className="s-title">
            Klarheit in jeder
            <br />
            <em>Entscheidung.</em>
          </div>
          <p>Unabhängige Beratung für inhabergeführte Unternehmen — präzise, diskret und immer auf Ihrer Seite des Tisches.</p>
          <div className="s-stats">
            <span>
              <b>35+</b> Jahre Erfahrung
            </span>
            <span>
              <b>1.200</b> abgeschlossene Mandate
            </span>
            <span>
              <b>4,9</b> Mandantenbewertung
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
            </span>
          </div>
        </div>
        <div className="s-media">
          <Photo name="hafen-towers" />
          <div className="s-quote">
<<<<<<< HEAD
<<<<<<< HEAD
            “They made a complex merger feel simple.”
            <small>Managing director, logistics group</small>
=======
            „Sie haben eine komplexe Fusion einfach wirken lassen.“
            <small>Geschäftsführung, Logistikgruppe</small>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
            “They made a complex merger feel simple.”
            <small>Managing director, logistics group</small>
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
          <span>Bouquets</span>
          <span>Weddings</span>
=======
          <span>Sträuße</span>
          <span>Hochzeiten</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          <span>Bouquets</span>
          <span>Weddings</span>
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          <span>Events</span>
        </span>
        <span className="s-logo">Maison Flora</span>
        <span className="s-links s-links-end">
          <span>Workshops</span>
<<<<<<< HEAD
<<<<<<< HEAD
          <span>Bag (0)</span>
=======
          <span>Warenkorb (0)</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          <span>Bag (0)</span>
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        </span>
      </div>
      <div className="s-hero">
        <div className="s-title">
<<<<<<< HEAD
<<<<<<< HEAD
          Flowers for the
          <br />
          <em>in-between</em> days
=======
          Blumen für die
          <br />
          <em>Tage</em> dazwischen
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          Flowers for the
          <br />
          <em>in-between</em> days
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        </div>
        <div className="s-arch">
          <Photo name="flora-tulips" />
        </div>
        <div className="s-note">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          Same-day delivery
          <br />
          across Munich
          <span>Order by 2 pm →</span>
        </div>
        <span className="s-badge">
          Seasonal
          <br />
          &amp; hand-tied
<<<<<<< HEAD
=======
          Lieferung am selben Tag
          <br />
          in ganz München
          <span>Bestellung bis 14 Uhr →</span>
        </div>
        <span className="s-badge">
          Saisonal
          <br />
          &amp; handgebunden
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
          <span>Produkt</span>
          <span>Preise</span>
          <span>Kunden</span>
          <span>Doku</span>
        </span>
        <span className="s-auth">
          <span>Anmelden</span>
          <span className="s-btn">Kostenlos testen</span>
        </span>
      </div>
      <div className="s-hero">
        <span className="s-pill">✦ Neu: KI-Prognosen →</span>
        <div className="s-title">
          Kennen Sie Ihre Zahlen,
          <br />
          bevor sie entstehen.
        </div>
        <p>Live-Umsatz, Kundenbindung und Prognosen für Teams, die lieber handeln, als auf Reports zu warten.</p>
        <div className="s-actions">
          <span className="s-btn">Kostenlos testen</span>
          <span className="s-btn s-btn-ghost">Demo buchen</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
                Revenue <b>€128.4k</b> <em>+12.6%</em>
              </span>
              <span>
                Active users <b>8,214</b> <em>+4.1%</em>
              </span>
              <span>
                Churn <b>1.8%</b> <em>−0.3%</em>
<<<<<<< HEAD
=======
                Umsatz <b>128.400 €</b> <em>+12,6 %</em>
              </span>
              <span>
                Aktive Nutzer <b>8.214</b> <em>+4,1 %</em>
              </span>
              <span>
                Abwanderung <b>1,8 %</b> <em>−0,3 %</em>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          <span>Menu</span>
          <span>Breakfast</span>
          <span>Events</span>
          <span>Visit</span>
        </span>
        <span className="s-btn s-btn-line">Reserve a table</span>
<<<<<<< HEAD
=======
          <span>Karte</span>
          <span>Frühstück</span>
          <span>Events</span>
          <span>Anfahrt</span>
        </span>
        <span className="s-btn s-btn-line">Tisch reservieren</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
      </div>
      <div className="s-hero">
        <div className="s-copy">
          <span className="s-open">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
            <i /> Heute geöffnet · 8:00 – 18:00
          </span>
          <div className="s-title">
            Kaffee in Ruhe.
            <br />
            Gute Leute.
          </div>
          <p>Saisonales Frühstück, hausgebackene Kardamomschnecken und Kaffee von kleinen Röstereien — direkt am Kanal.</p>
          <div className="s-actions">
            <span className="s-btn">Zur Karte</span>
            <span className="s-link">Anfahrt →</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          </div>
        </div>
        <div className="s-media">
          <Photo name="linde-interior" />
        </div>
      </div>
      <div className="s-menu">
        {[
<<<<<<< HEAD
<<<<<<< HEAD
          ['Cardamom bun', '3.80'],
          ['Flat white', '3.90'],
          ['Sourdough & eggs', '9.50'],
=======
          ['Kardamomschnecke', '3,80'],
          ['Flat White', '3,90'],
          ['Sauerteigbrot & Eier', '9,50'],
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          ['Cardamom bun', '3.80'],
          ['Flat white', '3.90'],
          ['Sourdough & eggs', '9.50'],
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
          <span>Menu</span>
          <span>Wine</span>
=======
          <span>Karte</span>
          <span>Wein</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          <span>Menu</span>
          <span>Wine</span>
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
          <span>Events</span>
        </span>
        <span className="s-logo">
          Café Linde
<<<<<<< HEAD
<<<<<<< HEAD
          <small>est. 1987</small>
        </span>
        <span className="s-btn s-btn-line">Reservations</span>
=======
          <small>seit 1987</small>
        </span>
        <span className="s-btn s-btn-line">Reservierung</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          <small>est. 1987</small>
        </span>
        <span className="s-btn s-btn-line">Reservations</span>
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
      </div>
      <div className="s-hero">
        <div className="s-media">
          <Photo name="linde-bar" />
        </div>
        <div className="s-copy">
          <span className="s-kicker">Bistro · Bar · Kaffeehaus</span>
          <div className="s-title">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
            Coffee by day,
            <br />
            <em>wine by night.</em>
          </div>
          <p>Hand-brewed coffee until five, natural wines and small plates until late. Thursday to Saturday until midnight.</p>
          <span className="s-btn">Book a table</span>
<<<<<<< HEAD
=======
            Tagsüber Kaffee,
            <br />
            <em>abends Wein.</em>
          </div>
          <p>Handgebrühter Kaffee bis fünf, Naturweine und kleine Teller bis spät. Donnerstag bis Samstag bis Mitternacht.</p>
          <span className="s-btn">Tisch buchen</span>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        </div>
      </div>
      <div className="s-menu">
        {[
<<<<<<< HEAD
<<<<<<< HEAD
          ['Espresso tonic', '4.50'],
          ['Burrata & figs', '12.00'],
          ['Glass of Riesling', '7.00'],
=======
          ['Espresso Tonic', '4,50'],
          ['Burrata & Feigen', '12,00'],
          ['Glas Riesling', '7,00'],
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
          ['Espresso tonic', '4.50'],
          ['Burrata & figs', '12.00'],
          ['Glass of Riesling', '7.00'],
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
          <span>Karte</span>
          <span>Bowls</span>
          <span>Catering</span>
          <span>Hallo!</span>
        </span>
        <span className="s-btn">Abholung bestellen</span>
      </div>
      <div className="s-hero">
        <div className="s-title">
          Beeren-
          <br />
          starke
          <br />
          Morgen.
        </div>
        <p>Bowls, Gebäck und richtig guter Kaffee. Täglich ab 7 Uhr geöffnet — kommen Sie hungrig.</p>
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
        <div className="s-tile">
          <Photo name="linde-berries" />
        </div>
        <span className="s-sticker">
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
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
<<<<<<< HEAD
=======
          Neue
          <br />
          Karte!
        </span>
      </div>
      <div className="s-band">
        <span>Frisches Gebäck</span>
        <span>✦</span>
        <span>Bio-Kaffee</span>
        <span>✦</span>
        <span>Beeren-Bowls</span>
        <span>✦</span>
        <span>Frisches Gebäck</span>
      </div>
      <div className="s-bowls">
        <span className="s-bowls-title">Bowls des Tages</span>
        <div className="s-bowls-grid">
          {[
            ['Beerenrausch', '8,50'],
            ['Grüner Glanz', '8,90'],
            ['Schoko-Crunch', '7,90'],
          ].map(([name, price]) => (
            <span key={name}>
              <b>{name}</b>
              {price} €
>>>>>>> 6960f0b622f2295ac36c61a8b41b0122fb35071c
=======
>>>>>>> 19c8353 (Small Changes  - Interactions and Main Page adjustments)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
