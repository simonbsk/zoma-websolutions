import { useEffect, useId, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { isToday, isTomorrow } from 'date-fns';
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { buttonClass } from '../../components/ui/Button';
import { NotePin } from '../../components/notes/DesignNotes';
import { ServiceFinder } from '../../components/public/ServiceFinder';
import { Portrait } from '../../components/visuals/Portrait';
import {
  FEATURED_CASE_STUDY,
  HEADLINES,
  HEADLINE_EXPERIMENT,
  HEADLINE_VARIANTS,
  PRINCIPLES,
  PROCESS,
  TEAM,
  TESTIMONIALS,
  type ProcessStep,
} from '../../content/site';
import { listActiveServices } from '../../lib/api/services';
import { track, useVariant } from '../../lib/experiments';
import { useAsync } from '../../lib/useAsync';
import { useNextFreeSlot } from '../../lib/useNextFreeSlot';
import { formatDuration, formatMoney, formatPrice, safeFormat, toDbDate } from '../../lib/time';
import { hasBooked, readBookingDraft, recordVisit } from '../../lib/visitor';

const bookingHref = (slug: string, extra = '') => `/book?service=${encodeURIComponent(slug)}${extra}`;
const trackBooking = () => track('cta_click');

/** Fades content in as it enters the viewport (instant with reduced motion, see CSS). */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** A quiet line for returning visitors — and a way back into an unfinished booking. */
function Greeting() {
  const [visitor] = useState(() => ({ ...recordVisit(), booked: hasBooked(), draft: readBookingDraft() }));

  if (visitor.booked) {
    return (
      <p className="greeting">
        <i aria-hidden />
        Your consultation request is in — we’ll be in touch soon.
      </p>
    );
  }
  if (visitor.draft) {
    return (
      <Link className="greeting greeting-link" to={bookingHref(visitor.draft.slug)} onClick={trackBooking}>
        <i aria-hidden />
        Welcome back — continue booking your {visitor.draft.name} session <ArrowRight size={14} />
      </Link>
    );
  }
  if (visitor.returning) {
    return (
      <p className="greeting">
        <i aria-hidden />
        Welcome back — good to see you again.
      </p>
    );
  }
  return null;
}

function TimelineStep({ step, index }: { step: ProcessStep; index: number }) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <li className={`timeline-step ${open ? 'is-open' : ''}`} style={{ '--i': index } as CSSProperties}>
      <span className="timeline-dot" aria-hidden />
      <span className="timeline-n">
        {String(index + 1).padStart(2, '0')}
        <span className="timeline-when">{step.duration}</span>
      </span>
      <h3>{step.title}</h3>
      <p>{step.text}</p>
      <button
        type="button"
        className="timeline-toggle"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Less' : 'What happens'} <Plus size={14} aria-hidden />
      </button>
      <div className="timeline-details" id={detailsId} aria-hidden={!open}>
        <ul>
          {step.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function slotDay(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return safeFormat(date, 'EEEE d MMMM');
}

export function HomePage() {
  const services = useAsync(listActiveServices, []);
  const variant = useVariant(HEADLINE_EXPERIMENT, HEADLINE_VARIANTS);
  const headline = HEADLINES[variant];
  const [booked] = useState(hasBooked);
  const [recommended, setRecommended] = useState<string | null>(null);
  const nextSlot = useNextFreeSlot();
  const caseStudy = FEATURED_CASE_STUDY;
  useReveal();

  return (
    <>
      {/* Sunrise ------------------------------------------------------------ */}
      <section className="scene scene-hero" data-sky-stop="0" data-sky-at="0">
        <div className="container hero-inner note-host">
          <NotePin id="headline-winner" n={1} tag="Experiment" title="Pick a headline winner, then delete the rest" style={{ top: 0, right: 0 }}>
            <p>
              Three headlines now rotate at random; results live in <strong>Admin → Overview</strong>. Let it run until
              each variant has around 1,000 views (or 2–4 weeks), keep the winner and remove the others.
            </p>
            <p>
              Preview a variant with <code>?hero-headline=clients</code>. Before launch, check whether the test needs
              consent under the TTDSG — or switch to a cookieless split.
            </p>
          </NotePin>
          <Greeting />
          <span className="eyebrow eyebrow-plain">Web design & development studio</span>
          <h1 className="serif hero-title">
            {headline.lead} <em>{headline.accent}</em>
          </h1>
          <p className="hero-lede">
            We design and build calm, fast, beautifully crafted websites for businesses that care how they’re
            perceived.
          </p>
          <div className="hero-actions note-host">
            <Link to="/book" className={buttonClass('primary', 'lg', 'btn-midnight')} onClick={trackBooking}>
              Book a free consultation <ArrowRight size={18} />
            </Link>
            <a href="#services" className="link-quiet">
              Explore services
            </a>
            <NotePin id="work-index" n={2} tag="Trust" title="Grow the proof into a /work page" style={{ top: -16, right: -8 }}>
              <p>
                One case study is live. Next: three or four more, a <strong>/work overview</strong>, and a link from each
                service to the project that shows it best.
              </p>
              <p>Visitors convert best when they see work from their own industry.</p>
            </NotePin>
          </div>
          <Link to={`/work/${caseStudy.slug}`} className="proof-line">
            <span className="proof-label">Recently launched</span>
            <span className="proof-text">
              <strong>{caseStudy.client}</strong> — {caseStudy.teaser}
            </span>
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <a href="#services" className="scroll-cue">
          <span>Scroll</span>
          <i aria-hidden />
        </a>
      </section>

      {/* Morning → midday: services ----------------------------------------- */}
      <section className="scene scene-services" id="services" data-sky-stop="0.28">
        <div className="container services-layout scrim">
          <header className="services-intro note-host" data-reveal>
            <span className="eyebrow eyebrow-plain">Services</span>
            <h2 className="serif">Everything your website needs, done properly.</h2>
            <p>
              Pick the session that fits. Each one is a free, focused conversation with the people who will design and
              build your site.
            </p>
            <ServiceFinder services={services.data ?? []} onRecommend={setRecommended} />
            <NotePin id="finder-notes" n={3} tag="Booking" title="Carry the finder’s answers into the booking" style={{ bottom: 8, right: -6 }}>
              <p>
                Pre-fill the booking notes with the three answers (<em>“Redesign · sells products · 2–3 months”</em>) so
                the first call starts informed.
              </p>
              <p>You’ll also learn which needs bring in the most clients.</p>
            </NotePin>
          </header>

          <div className="services-list note-host" data-reveal>
            <ol className="service-list">
              {services.loading && !services.data
                ? Array.from({ length: 4 }, (_, i) => (
                    <li key={i} className="service-skeleton" aria-hidden>
                      <span className="skeleton" />
                    </li>
                  ))
                : services.data?.map((service, i) => {
                    const isRecommended = recommended === service.id;
                    return (
                      <li key={service.id}>
                        <Link
                          to={bookingHref(service.slug)}
                          className={`service-row ${isRecommended ? 'is-recommended' : ''}`}
                          onClick={trackBooking}
                        >
                          <span className="service-index">{String(i + 1).padStart(2, '0')}</span>
                          <span className="service-main">
                            <span className="service-name">
                              {service.name}
                              {isRecommended ? <span className="service-tag">Recommended</span> : null}
                            </span>
                            {service.description ? <span className="service-desc">{service.description}</span> : null}
                          </span>
                          <span className="service-meta">
                            {service.project_from_cents ? (
                              <>
                                <span className="service-from">
                                  Projects from {formatMoney(service.project_from_cents, service.currency)}
                                </span>
                                <span>
                                  {formatDuration(service.duration_minutes)} call ·{' '}
                                  {service.price_cents ? formatMoney(service.price_cents, service.currency) : 'free'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span>{formatDuration(service.duration_minutes)}</span>
                                <span className="service-price">{formatPrice(service.price_cents, service.currency)}</span>
                              </>
                            )}
                          </span>
                          <ArrowUpRight className="service-arrow" size={20} aria-hidden />
                        </Link>
                      </li>
                    );
                  })}
            </ol>
            {!services.loading && !services.data?.length ? (
              <p className="service-fallback">
                Our services are being finalised. <Link to="/book">Book a call</Link> and we’ll talk it through.
              </p>
            ) : null}
            <NotePin id="included" n={4} tag="Clarity" title="Show what’s included at each price" style={{ bottom: -14, left: -14 }}>
              <p>
                “Projects from €2,400” answers <em>how much?</em> The next question is <em>what do I get?</em> — a short
                “Typically includes” line per service (pages, CMS, SEO setup) stops visitors from guessing.
              </p>
            </NotePin>
          </div>
        </div>
      </section>

      {/* Afternoon: process — the line fills as the sun moves ---------------- */}
      <section className="scene scene-process" id="process" data-sky-stop="0.5">
        <div className="container scrim">
          <header className="scene-head note-host" data-reveal>
            <span className="eyebrow eyebrow-plain">How we work</span>
            <h2 className="serif">From first call to launch in about seven weeks.</h2>
            <NotePin id="faq" n={5} tag="Objections" title="A short FAQ before the sunset" style={{ top: 0, right: 0 }}>
              <p>
                Five or six honest answers — cost, who owns the site, hosting, who writes the content, what happens after
                launch — right after the process catches the last doubts before the final ask.
              </p>
            </NotePin>
          </header>
          <ol className="timeline" data-reveal>
            {PROCESS.map((step, i) => (
              <TimelineStep key={step.title} step={step} index={i} />
            ))}
          </ol>
        </div>
      </section>

      {/* Golden hour: the studio --------------------------------------------- */}
      <section className="scene scene-about" id="about" data-sky-stop="0.66">
        <div className="container about-inner scrim note-host" data-reveal>
          <NotePin id="photos" n={6} tag="Trust" title="Swap the silhouettes for real photos" style={{ top: 0, right: '8%' }}>
            <p>
              The illustrations set the mood, but real faces build more trust. A 30-minute shoot at golden hour, backlit
              and graded warm, would slot straight in — same composition, real people.
            </p>
          </NotePin>
          <span className="eyebrow">The studio</span>
          <h2 className="serif">Small, senior and deliberately focused.</h2>
          <p className="about-lede">
            You work directly with the people designing and building your site — no hand-offs, no account managers, no
            guesswork.
          </p>
          <ul className="team">
            {TEAM.map((member) => (
              <li key={member.name}>
                <span className="portrait-frame">
                  <Portrait hair={member.portrait.hair} sunX={member.portrait.sunX} />
                </span>
                <strong>{member.name}</strong>
                <span className="team-role">{member.role}</span>
                <span className="team-line">{member.line}</span>
              </li>
            ))}
          </ul>
          <ul className="principles">
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Dusk: client voices, appearing like the first stars ------------------ */}
      <section className="scene scene-dusk" id="voices" data-sky-stop="0.8">
        <div className="container dusk-inner scrim note-host">
          <NotePin id="verifiable" n={7} tag="Social proof" title="Make every quote verifiable" style={{ top: 0, right: 0 }}>
            <p>
              Link each quote to the live site or a Google review and add the client’s logo. Replace the sample quotes
              with real, approved ones before launch.
            </p>
          </NotePin>
          <header className="scene-head" data-reveal>
            <span className="eyebrow">In their words</span>
            <h2 className="serif">What clients notice first.</h2>
          </header>
          <ul className="quotes">
            {TESTIMONIALS.map((t, i) => (
              <li key={t.name} className="quote" data-reveal style={{ '--i': i } as CSSProperties}>
                <span className="quote-star" aria-hidden />
                <span className="quote-result">{t.result}</span>
                <blockquote>
                  <p>“{t.quote}”</p>
                </blockquote>
                <span className="quote-who">
                  <strong>{t.name}</strong> · {t.company}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Midnight: final invitation ------------------------------------------- */}
      <section className="midnight" aria-labelledby="midnight-title" data-sky-stop="0.88" data-sky-at="1">
        <div className="midnight-spot" aria-hidden />
        <div className="container note-host midnight-host">
          <div className="midnight-inner" data-sky-stop="1" data-sky-at="0.5">
            <span className="midnight-eyebrow">{booked ? 'See you soon' : 'Before the day ends'}</span>
            <h2 id="midnight-title" className="serif">
              {booked ? 'Your request is in. Sleep on it — we’ll take it from here.' : 'Let’s make tomorrow’s website.'}
            </h2>
            <p>
              {booked
                ? 'We’ll confirm your consultation by email. Want to plan something else too?'
                : 'One calm conversation. You’ll leave with a clear plan, an honest estimate and no obligation.'}
            </p>
            <div className="midnight-cta note-host">
              <Link to="/book" className="btn btn-midnight btn-midnight-xl" onClick={trackBooking}>
                {booked ? 'Book another session' : 'Book a free consultation'} <ArrowRight size={19} />
              </Link>
              <NotePin id="emails" n={8} tag="Follow-up" title="Confirmation emails and calendar invites" style={{ top: -12, right: -40 }}>
                <p>
                  Send an email with an <strong>.ics invite</strong> when a request arrives and again when you confirm it
                  — a Supabase Edge Function with Resend or Postmark is enough.
                </p>
                <p>It makes the booking feel finished and cuts no-shows.</p>
              </NotePin>
            </div>
            {nextSlot ? (
              <Link
                to={bookingHref(nextSlot.service.slug, `&date=${toDbDate(nextSlot.slot.start)}&time=${nextSlot.slot.label}`)}
                className="next-slot"
                onClick={trackBooking}
              >
                <i aria-hidden />
                Next free slot: <strong>{slotDay(nextSlot.slot.start)}, {nextSlot.slot.label}</strong>
                <ArrowRight size={14} aria-hidden />
              </Link>
            ) : null}
            <span className="midnight-meta">Free · No obligation · Takes two minutes to book</span>
          </div>
        </div>
      </section>
    </>
  );
}
