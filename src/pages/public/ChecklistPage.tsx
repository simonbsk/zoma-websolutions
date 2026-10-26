import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Printer } from 'lucide-react';
import { buttonClass } from '../../components/ui/Button';
import { CHECKLIST } from '../../content/site';
import { readLocal, writeLocal } from '../../lib/visitor';
import './pages.css';

const STORAGE_KEY = 'zoma:checklist';
const TOTAL = CHECKLIST.reduce((sum, section) => sum + section.items.length, 0);

function readDone(): Set<string> {
  try {
    const parsed = JSON.parse(readLocal(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

/** The free "website launch checklist": tick items off (remembered per browser) or print it. */
export function ChecklistPage() {
  const [done, setDone] = useState<Set<string>>(readDone);

  function toggle(key: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      writeLocal(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return (
    <article className="checklist">
      <header className="checklist-hero container">
        <span className="eyebrow">Free resource</span>
        <h1 className="serif">The website launch checklist</h1>
        <p>
          The {TOTAL} checks we run before every launch. Work through it for your own site — your ticks are saved in this
          browser.
        </p>
        <div className="checklist-bar">
          <div className="checklist-progress">
            <span>
              {done.size} of {TOTAL} done
            </span>
            <span className="checklist-meter" aria-hidden>
              <i style={{ width: `${(done.size / TOTAL) * 100}%` }} />
            </span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            <Printer size={16} /> Print or save as PDF
          </button>
        </div>
      </header>

      <div className="container checklist-grid">
        {CHECKLIST.map((section, si) => (
          <section key={section.title} className="checklist-section">
            <h2>
              <span>{String(si + 1).padStart(2, '0')}</span>
              {section.title}
            </h2>
            <ul>
              {section.items.map((item, ii) => {
                const key = `${si}-${ii}`;
                const checked = done.has(key);
                return (
                  <li key={key}>
                    <label className={checked ? 'is-done' : ''}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(key)} />
                      <span className="check-box" aria-hidden />
                      <span className="check-text">
                        <strong>{item.label}</strong>
                        <small>{item.why}</small>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <aside className="checklist-cta container">
        <p>
          <strong>Want a second pair of eyes?</strong> We’ll run this checklist on your site in a free audit call.
        </p>
        <Link to="/book?service=seo-performance-audit" className={buttonClass('primary')}>
          Book a free audit <ArrowRight size={16} />
        </Link>
      </aside>
    </article>
  );
}
