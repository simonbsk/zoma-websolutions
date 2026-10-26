import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleCheck, Plus } from 'lucide-react';
import { buttonClass } from '../../components/ui/Button';
import { HeroFlow } from '../../components/showcase/HeroFlow';
import { DraftsExample, FeedbackExample, StyleExample } from '../../components/showcase/examples';

interface Feature {
  title: string;
  text: string;
  link: { href: string; label: string };
  Example: ComponentType;
}

const FEATURES: Feature[] = [
  {
    title: 'Jeder Stil. Ihre Wahl.',
    text: 'Minimalistisch oder mutig, verspielt oder edel — Sie entscheiden, wie Ihre Marke aussieht und wirkt. Wir starten nie mit einem Template: Jede Website wird von Grund auf gestaltet, rund um Ihren Geschmack, Ihre Farben und Ihre Kunden.',
    link: { href: '/book', label: 'Erzählen Sie uns von Ihrer Vision' },
    Example: StyleExample,
  },
  {
    title: 'Drei Entwürfe. Ein Favorit.',
    text: 'Sie bekommen nicht nur ein einziges Design zum Annehmen oder Ablehnen. Wir entwickeln drei eigenständige Richtungen für Ihre Website — Sie wählen Ihren Favoriten, kombinieren die besten Elemente, und wir verfeinern ihn, bis er sich nach Ihnen anfühlt.',
    link: { href: '/#pricing', label: 'Leistungen ansehen' },
    Example: DraftsExample,
  },
  {
    title: 'Änderungen erwünscht. Immer.',
    text: 'Feedback ist Teil des Prozesses, kein Extra. Kommentieren Sie direkt im Design und wünschen Sie sich Änderungen, bis alles stimmt — vor dem Launch und lange danach.',
    link: { href: '/#team', label: 'Das Team kennenlernen' },
    Example: FeedbackExample,
  },
];

// Starting prices — every project gets a fixed quote after the consultation.
const PLANS = [
  {
    name: 'Start',
    audience: 'Für One-Pager',
    price: '990',
    features: [
      'One-Page-Website',
      '3 Designentwürfe',
      'Optimiert für Smartphone & Tablet',
      'Kontaktformular',
      'SEO-Grundeinrichtung',
      'Überarbeitungen, bis Sie zufrieden sind',
    ],
  },
  {
    name: 'Business',
    audience: 'Für wachsende Unternehmen',
    price: '2.490',
    featured: true,
    features: [
      'Alles aus Start',
      'Bis zu 8 Seiten',
      'Einfacher Editor (CMS)',
      'Animationen & Interaktionen',
      'SEO- & Analytics-Einrichtung',
      'Buchungs- oder Anfrageformulare',
    ],
  },
  {
    name: 'Premium',
    audience: 'Für Shops & individuelle Funktionen',
    price: '4.990',
    features: [
      'Alles aus Business',
      'Unbegrenzte Seitenanzahl',
      'Onlineshop oder Web-App',
      'Mehrsprachigkeit',
      'Individuelle Integrationen',
      'Bevorzugter Support',
    ],
  },
];

const CARE = {
  price: '49',
  features: [
    'Schnelles, sicheres Hosting & SSL',
    'Updates, Backups & Monitoring',
    'Kleine Inhaltsänderungen inklusive',
    'Bevorzugter E-Mail-Support',
  ],
};

const FAQ = [
  {
    q: 'Warum stehen die Preise mit „ab“ da?',
    a: 'Jedes Projekt ist anders. Nach Ihrem kostenlosen Erstgespräch erhalten Sie ein Festpreisangebot für genau Ihren Umfang — ohne versteckte Kosten und ohne spätere Überraschungen.',
  },
  {
    q: 'Was, wenn mir keiner der Entwürfe gefällt?',
    a: 'Dann machen wir weiter. Sagen Sie uns, was fehlt, und wir überarbeiten die Richtung, bis sie stimmt — genau dafür sind die Überarbeitungen da.',
  },
  {
    q: 'Kann ich die Website selbst bearbeiten?',
    a: 'Ja. Business- und Premium-Websites kommen mit einem einfachen Editor für Texte, Bilder und Seiten, und zum Launch zeigen wir Ihnen, wie er funktioniert.',
  },
  {
    q: 'Wem gehört die fertige Website?',
    a: 'Ihnen. Domain, Inhalte und Design gehören Ihnen, und der Code ist sauber und dokumentiert — Sie sind nie an uns gebunden.',
  },
];

interface Member {
  name: string;
  role: string;
  quote: string;
  /** Optional portrait, e.g. '/team/jakob.jpg' in /public. Shown in black & white. */
  photo?: string;
}

const TEAM: Member[] = [
  {
    name: 'Jakob',
    role: 'Gründungsmitglied',
    quote: 'Eine Website sollte sich anfühlen wie das Unternehmen dahinter — nicht wie ein Template mit neuem Logo.',
  },
  {
    name: 'Simon',
    role: 'Gründungsmitglied',
    quote: 'Schnell, barrierefrei und leicht zu pflegen. Die beste Technik ist die, über die man nie nachdenken muss.',
  },
  {
    name: 'Anton',
    role: 'Gründungsmitglied',
    quote: 'Gutes Design erklärt sich von selbst. Ihre Kunden sollen finden, was sie suchen — ohne lange zu suchen.',
  },
  {
    name: 'Eyüp',
    role: 'Gründungsmitglied',
    quote: 'Wir hören erst zu und gestalten dann. Die besten Ideen entstehen im Gespräch mit unseren Kunden.',
  },
];

function ArrowLink({ href, children }: { href: string; children: string }) {
  const content = (
    <>
      {children} <ArrowUpRight size={18} strokeWidth={1.8} />
    </>
  );
  // In-page anchors go through a plain link so the hash scroll works from any route.
  return href.includes('#') ? (
    <a href={href} className="link-arrow">
      {content}
    </a>
  ) : (
    <Link to={href} className="link-arrow">
      {content}
    </Link>
  );
}

function Slash() {
  return (
    <svg className="slash" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M1 17 17 1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function HomePage() {
  return (
    <>
      {/* 1 — Hero: flowing website ideas --------------------------------------- */}
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero-title display">
          <span>Sagen Sie Hallo zu</span> <span>Ihrer neuen Website.</span>
        </h1>
        <HeroFlow>
          <span className="flow-badge">Konzeptdesigns von Zoma</span>
        </HeroFlow>
        <div className="hero-aside">
          <Link to="/book" className={buttonClass('primary', 'md', 'btn-cta')}>
            Jetzt kostenloses Erstgespräch buchen <ArrowUpRight size={18} strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      {/* 2 — Flexibility: three boxes, one after another ----------------------- */}
      <section className="approach" id="approach" aria-labelledby="approach-title">
        <div className="wrap">
          <h2 id="approach-title" className="approach-title display">
            Ihre Website. Ihre Regeln.
          </h2>
          <div className="features">
            {FEATURES.map(({ title, text, link, Example }, i) => (
              <article key={title} className={`feature ${i % 2 ? 'is-flipped' : ''}`}>
                <div className="feature-copy">
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <ArrowLink href={link.href}>{link.label}</ArrowLink>
                </div>
                <div className="feature-visual">
                  <Example />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Pricing ------------------------------------------------------------ */}
      <section className="pricing" id="pricing" aria-labelledby="pricing-title">
        <div className="wrap">
          <header className="pricing-head">
            <span className="eyebrow">Preise</span>
            <h2 id="pricing-title">Klare Preise. Keine Überraschungen.</h2>
            <p>
              Jedes Paket enthält drei Designentwürfe, eine für alle Geräte optimierte Umsetzung und Unterstützung beim
              Launch. Nach Ihrem kostenlosen Erstgespräch erhalten Sie ein Festpreisangebot.
            </p>
          </header>

          <div className="plans">
            {PLANS.map((plan) => (
              <article key={plan.name} className={`plan ${plan.featured ? 'is-featured' : ''}`}>
                {plan.featured ? <span className="plan-flag">Am beliebtesten</span> : null}
                <h3>{plan.name}</h3>
                <p className="plan-for">{plan.audience}</p>
                <p className="plan-price">
                  <span className="plan-from">ab</span>
                  <strong>{plan.price}</strong>
                  <span>€</span>
                </p>
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CircleCheck size={17} strokeWidth={1.7} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/book" className={buttonClass(plan.featured ? 'light' : 'ghost', 'lg', 'btn-block')}>
                  Kostenloses Erstgespräch buchen
                </Link>
              </article>
            ))}
          </div>
          <p className="plans-note">
            Einmalige Projektpreise. Hosting und Betreuung sind optional und werden monatlich abgerechnet — siehe unten.
          </p>

          <div className="care-intro">
            <h3>Betreuung nach dem Launch</h3>
            <p>Optional für jedes Paket.</p>
          </div>
          <div className="care">
            <div>
              <h4>Betreuung &amp; Hosting</h4>
              <p className="plan-price">
                <strong>{CARE.price}</strong>
                <span>€</span>
                <span className="plan-from">/ Monat</span>
              </p>
            </div>
            <ul className="plan-features">
              {CARE.features.map((feature) => (
                <li key={feature}>
                  <CircleCheck size={17} strokeWidth={1.7} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="faq">
            <h3 className="faq-title">Ihre Fragen, beantwortet.</h3>
            <div className="faq-list">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="faq-item">
                  <summary>
                    {q}
                    <Plus size={22} strokeWidth={1.6} aria-hidden />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 — The Team ----------------------------------------------------------- */}
      <section className="team" id="team" aria-labelledby="team-title">
        <div className="team-inner">
          <h2 id="team-title" className="team-title">
            Das Team
          </h2>
          <div className="team-grid">
            {TEAM.map((member, i) => (
              <article key={member.name} className="member">
                {/* Checkerboard across the two-column grid: light, dark / dark, light. */}
                <div className={`member-photo ${(i + Math.floor(i / 2)) % 2 ? 'is-dark' : ''}`}>
                  {member.photo ? (
                    <img src={member.photo} alt={`Porträt von ${member.name}`} loading="lazy" />
                  ) : (
                    <span className="member-initial" aria-hidden>
                      {member.name[0]}
                    </span>
                  )}
                </div>
                <p className="member-role">{member.role}</p>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-quote">
                  <Slash />
                  {member.quote}
                </p>
                <ArrowLink href="/book">Termin buchen</ArrowLink>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
