import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { buttonClass } from '../../components/ui/Button';
import { StartLink } from '../../components/public/StartLink';
import { CaseStudyVisual } from '../../components/visuals/CaseStudyVisual';
import { CASE_STUDIES } from '../../content/site';
import './pages.css';

export function CaseStudyPage() {
  const { slug } = useParams();
  const study = CASE_STUDIES.find((c) => c.slug === slug);

  if (!study) {
    return (
      <div className="page-missing container">
        <h1 className="serif">That project isn’t here.</h1>
        <Link to="/" className={buttonClass('dark')}>
          Back to the studio
        </Link>
      </div>
    );
  }

  const facts = [
    { label: 'Client', value: `${study.client}, ${study.location}` },
    { label: 'Service', value: study.service },
    { label: 'Timeline', value: study.duration },
    { label: 'Launched', value: String(study.year) },
  ];

  return (
    <article className="case">
      <header className="case-hero">
        <div className="container">
          <Link to="/#work" className="back-link">
            <ArrowLeft size={15} /> Back to the studio
          </Link>
          <span className="eyebrow">Case study · {study.sector}</span>
          <h1 className="serif">{study.headline}</h1>
          <p className="case-summary">{study.summary}</p>
          <dl className="case-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container case-visual">
        <CaseStudyVisual />
      </div>

      <div className="container">
        <ul className="case-metrics">
          {study.metrics.map((m) => (
            <li key={m.label}>
              <strong className="serif">{m.value}</strong>
              <span>{m.label}</span>
            </li>
          ))}
        </ul>

        <div className="case-body">
          <section>
            <h2>The brief</h2>
            <p>{study.brief}</p>
          </section>
          <section>
            <h2>What we did</h2>
            <ul>
              {study.approach.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>The result</h2>
            <p>{study.outcome}</p>
          </section>
        </div>

        <figure className="case-quote">
          <blockquote className="serif">“{study.quote.text}”</blockquote>
          <figcaption>
            <strong>{study.quote.name}</strong> · {study.quote.role}
          </figcaption>
        </figure>

        <section className="case-cta">
          <h2 className="serif">Planning something similar?</h2>
          <p>Tell us about your business in two minutes. You’ll get honest feedback and a fixed-price estimate.</p>
          <StartLink from="case-study" label="Your website starts here" className="btn btn-lg btn-inverse" />
          <Link to="/book" className="case-cta-call">
            Rather talk first? Book a free call <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </article>
  );
}
