import { useId, useState } from 'react';
import { NotePin } from '../../../components/notes/DesignNotes';
import { FAQ } from '../../../content/site';

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`}>
      <h3>
        <button type="button" className="faq-q" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          {q}
          <span className="faq-icon" aria-hidden />
        </button>
      </h3>
      <div className="faq-a" id={id} role="region" aria-hidden={!open}>
        <div>
          <p>{a}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container faq">
        <header className="faq-head note-host">
          <p className="kicker dot-saffron">FAQ</p>
          <h2 id="faq-title" className="title">
            Questions, <span className="title-quiet">answered.</span>
          </h2>
          <p className="lede">Anything else on your mind? Ask it in your request — we answer every single one.</p>
          <NotePin id="faq-schema" n={7} tag="SEO" title="Mark the FAQ up for Google" style={{ bottom: -12, left: 0 }}>
            <p>
              Adding <code>FAQPage</code> structured data (a small JSON-LD block) lets these answers show up directly in
              search results. Five real questions from first calls will beat these placeholders, too.
            </p>
          </NotePin>
        </header>
        <div className="faq-list">
          {FAQ.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
