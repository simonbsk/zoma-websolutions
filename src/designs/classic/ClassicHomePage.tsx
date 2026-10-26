import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Accessibility,
  Code2,
  Gauge,
  LayoutTemplate,
  MessagesSquare,
  PenTool,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { buttonClass } from '../../components/ui/Button';
import { HeroCollage, AboutComposition } from './ClassicVisuals';
import { ServiceCard, ServiceCardSkeleton } from './ServiceCard';
import { Alert, EmptyState } from '../../components/ui/misc';
import { listActiveServices } from '../../lib/api/services';
import { useAsync } from '../../lib/useAsync';

const CAPABILITIES = [
  { icon: PenTool, label: 'Interface design' },
  { icon: Code2, label: 'Modern engineering' },
  { icon: Gauge, label: 'Core Web Vitals' },
  { icon: Accessibility, label: 'WCAG accessibility' },
  { icon: Search, label: 'Technical SEO' },
  { icon: ShieldCheck, label: 'Secure hosting' },
];

const PROCESS = [
  {
    icon: MessagesSquare,
    title: 'Consultation',
    text: 'A focused call to understand your business, audience and goals — and whether we are the right fit.',
  },
  {
    icon: LayoutTemplate,
    title: 'Strategy & design',
    text: 'Sitemap, content structure and a refined visual system, reviewed together until it feels right.',
  },
  {
    icon: Code2,
    title: 'Build',
    text: 'Hand-crafted, responsive and fast. Accessible by default, with an editing setup that suits your team.',
  },
  {
    icon: Rocket,
    title: 'Launch & care',
    text: 'Careful launch, analytics and monitoring — plus ongoing support so your site keeps improving.',
  },
];

const PRINCIPLES = [
  { title: 'Clarity over decoration', text: 'Every element earns its place. Calm layouts that guide visitors to act.' },
  { title: 'Performance as a feature', text: 'Lean code and optimised assets — fast on every device and connection.' },
  { title: 'Built to be owned', text: 'Clean, documented code and simple tools, so you are never locked in.' },
];

export function ClassicHomePage() {
  const services = useAsync(listActiveServices, []);

  return (
    <>
      {/* Hero -------------------------------------------------------------- */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Web design & development studio</span>
            <h1 className="serif">
              Websites that earn trust <em>at first glance.</em>
            </h1>
            <p className="hero-lede">
              ZomaWebsolutions designs and builds premium, high-performance websites for businesses that care about
              how they're perceived — clear, considered and engineered to convert.
            </p>
            <div className="hero-actions">
              <Link to="/book" className={buttonClass('primary', 'lg')}>
                Book a free consultation <ArrowRight size={18} />
              </Link>
              <a href="#services" className={buttonClass('ghost', 'lg')}>
                Explore services
              </a>
            </div>
            <ul className="hero-assurances">
              <li>
                <Sparkles size={16} /> Bespoke design, no templates
              </li>
              <li>
                <Gauge size={16} /> Performance-first builds
              </li>
            </ul>
          </div>
          <div className="hero-visual">
            <HeroCollage />
          </div>
        </div>

        <div className="container">
          <ul className="capabilities" aria-label="Capabilities">
            {CAPABILITIES.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={18} strokeWidth={1.7} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services ---------------------------------------------------------- */}
      <section className="section section-band" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Services</span>
              <h2 className="serif">Everything your website needs, done properly.</h2>
            </div>
            <p>
              Choose the session that matches where you are. Each one is a focused, no-obligation conversation with
              the people who will actually design and build your site.
            </p>
          </div>

          {services.error ? <Alert tone="error">{services.error}</Alert> : null}

          <div className="services-grid">
            {services.loading && !services.data
              ? Array.from({ length: 3 }, (_, i) => <ServiceCardSkeleton key={i} />)
              : services.data?.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>

          {!services.loading && !services.error && services.data?.length === 0 ? (
            <EmptyState icon={<LayoutTemplate size={20} />} title="Services coming soon">
              We're finalising our service offering. You can still reach us directly below.
            </EmptyState>
          ) : null}
        </div>
      </section>

      {/* Process ----------------------------------------------------------- */}
      <section className="section" id="process">
        <div className="container">
          <div className="section-head section-head-center">
            <span className="eyebrow">How we work</span>
            <h2 className="serif">A calm, structured process from first call to launch.</h2>
          </div>
          <ol className="process-grid">
            {PROCESS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="process-card">
                <div className="process-top">
                  <span className="process-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <span className="process-step">0{i + 1}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About ------------------------------------------------------------- */}
      <section className="section section-band" id="about">
        <div className="container about-grid">
          <AboutComposition />
          <div className="about-copy">
            <span className="eyebrow">About the studio</span>
            <h2 className="serif">Small, senior and deliberately focused.</h2>
            <p className="about-lede">
              We're an independent web studio. You work directly with the designers and engineers building your site —
              no hand-offs, no account managers, no guesswork. Our work is quiet, precise and built to last.
            </p>
            <ul className="principles">
              {PRINCIPLES.map((p) => (
                <li key={p.title}>
                  <span className="principle-mark" />
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="about-actions">
              <Link to="/book" className={buttonClass('dark', 'md')}>
                Start a conversation
              </Link>
              <a href="#services" className="link-arrow">
                See services <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
