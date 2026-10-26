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
    title: 'Any style. Your call.',
    text: 'Minimal or bold, playful or premium — you decide how your brand looks and feels. We never start from a template: every site is designed from scratch around your taste, your colours and your customers.',
    link: { href: '/book', label: 'Tell us your vision' },
    Example: StyleExample,
  },
  {
    title: 'Three drafts. One favourite.',
    text: "You won't get a single take-it-or-leave-it design. We create three distinct directions for your site — pick your favourite, mix the best parts, and we refine it until it feels like yours.",
    link: { href: '/#pricing', label: "See what's included" },
    Example: DraftsExample,
  },
  {
    title: 'Changes welcome. Always.',
    text: 'Feedback is part of the process, not an extra. Comment right on your design and ask for changes until everything feels right — before launch and long after.',
    link: { href: '/#team', label: 'Meet the team' },
    Example: FeedbackExample,
  },
];

// Starting prices — every project gets a fixed quote after the consultation.
const PLANS = [
  {
    name: 'Start',
    audience: 'For one-page sites',
    price: '990',
    features: [
      'One-page website',
      '3 design drafts',
      'Mobile & tablet ready',
      'Contact form',
      'Basic SEO setup',
      'Revisions until you are happy',
    ],
  },
  {
    name: 'Business',
    audience: 'For growing businesses',
    price: '2,490',
    featured: true,
    features: [
      'Everything in Start',
      'Up to 8 pages',
      'Easy-to-use editor (CMS)',
      'Animations & interactions',
      'SEO & analytics setup',
      'Booking or enquiry forms',
    ],
  },
  {
    name: 'Premium',
    audience: 'For shops & custom features',
    price: '4,990',
    features: [
      'Everything in Business',
      'Unlimited pages',
      'Online shop or web app',
      'Multilingual setup',
      'Custom integrations',
      'Priority support',
    ],
  },
];

const CARE = {
  price: '49',
  features: [
    'Fast, secure hosting & SSL',
    'Updates, backups & monitoring',
    'Small content changes included',
    'Priority email support',
  ],
};

const FAQ = [
  {
    q: 'Why are prices shown as “from”?',
    a: 'Every project is different. After your free consultation you receive a fixed quote for your exact scope — no hidden costs and no surprises later.',
  },
  {
    q: "What if I don't like any of the drafts?",
    a: 'Then we keep going. Tell us what is missing and we rework the direction until it feels right — that is what the revisions are for.',
  },
  {
    q: 'Can I edit the website myself?',
    a: 'Yes. Business and Premium sites come with an easy editor for texts, images and pages, and we show you how it works at launch.',
  },
  {
    q: 'Who owns the finished website?',
    a: 'You do. Domain, content and design belong to you, and the code is clean and documented — you are never locked in.',
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
    role: 'Co-founder',
    quote: 'A website should feel like the business behind it — not like a template with a new logo.',
  },
  {
    name: 'Simon',
    role: 'Co-founder',
    quote: 'Fast, accessible and easy to edit. The best technology is the kind you never have to think about.',
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
          <span>Say Hello To</span> <span>Your New Site.</span>
        </h1>
        <HeroFlow>
          <span className="flow-badge">Concept designs by Zoma</span>
        </HeroFlow>
        <div className="hero-aside">
          <Link to="/book" className={buttonClass('primary', 'md', 'btn-cta')}>
            Book your free consultation date today <ArrowUpRight size={18} strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      {/* 2 — Flexibility: three boxes, one after another ----------------------- */}
      <section className="approach" id="approach" aria-labelledby="approach-title">
        <div className="wrap">
          <h2 id="approach-title" className="approach-title display">
            Your site. Your rules.
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
            <span className="eyebrow">Pricing</span>
            <h2 id="pricing-title">Clear prices. No surprises.</h2>
            <p>
              Every package includes three design drafts, a mobile-ready build and launch support. After your free
              consultation you get a fixed quote.
            </p>
          </header>

          <div className="plans">
            {PLANS.map((plan) => (
              <article key={plan.name} className={`plan ${plan.featured ? 'is-featured' : ''}`}>
                {plan.featured ? <span className="plan-flag">Most popular</span> : null}
                <h3>{plan.name}</h3>
                <p className="plan-for">{plan.audience}</p>
                <p className="plan-price">
                  <span className="plan-from">from</span>
                  <span>€</span>
                  <strong>{plan.price}</strong>
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
                  Book a free consultation
                </Link>
              </article>
            ))}
          </div>
          <p className="plans-note">
            One-time project prices. Hosting and care are optional and billed monthly — see below.
          </p>

          <div className="care-intro">
            <h3>Care after launch</h3>
            <p>Optional for every package.</p>
          </div>
          <div className="care">
            <div>
              <h4>Care &amp; Hosting</h4>
              <p className="plan-price">
                <span>€</span>
                <strong>{CARE.price}</strong>
                <span className="plan-from">/ month</span>
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
            <h3 className="faq-title">Questions, answered.</h3>
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
            The Team
          </h2>
          <div className="team-grid">
            {TEAM.map((member, i) => (
              <article key={member.name} className="member">
                <div className={`member-photo ${i % 2 ? 'is-dark' : ''}`}>
                  {member.photo ? (
                    <img src={member.photo} alt={`Portrait of ${member.name}`} loading="lazy" />
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
                <ArrowLink href="/book">Book a call</ArrowLink>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
