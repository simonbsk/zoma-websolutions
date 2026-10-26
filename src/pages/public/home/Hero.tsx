import { buttonClass } from '../../../components/ui/Button';
import { SectionLink } from '../../../components/public/SectionLink';
import { StartLink } from '../../../components/public/StartLink';
import { NotePin } from '../../../components/notes/DesignNotes';
import { HEADLINE_EXPERIMENT, REPLY_DAYS } from '../../../content/site';

export function Hero({ headline }: { headline: { lead: string; accent: string } }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <div className="hero-top note-host">
          <p className="kicker">Web design &amp; development studio</p>
          <h1 id="hero-title" className="hero-title">
            {headline.lead} <span className="hero-accent">{headline.accent}</span>
            <span className="hero-drop" aria-hidden />
            <span className="sr-only">.</span>
          </h1>
          <NotePin id="headline-winner" n={1} tag="Experiment" title="Let the headline test pick a winner" style={{ top: 0, right: 0 }}>
            <p>
              Three headlines rotate at random — results are in <strong>Admin → Overview</strong>. After about 1,000
              views each (or 2–4 weeks), keep the winner and delete the rest.
            </p>
            <p>
              Preview a variant with <code>?{HEADLINE_EXPERIMENT}=drop</code>. Check whether the test needs consent under
              the TTDSG before launch.
            </p>
          </NotePin>
        </div>

        <div className="hero-bottom">
          <ul className="hero-facts">
            <li>
              <strong>from €890</strong>
              <span>fixed prices</span>
            </li>
            <li>
              <strong>{REPLY_DAYS} days</strong>
              <span>to your first answer</span>
            </li>
            <li>
              <strong>100%</strong>
              <span>yours to keep</span>
            </li>
          </ul>
          <div className="hero-side note-host">
            <p className="hero-lede">
              We design and build custom websites for small businesses — no templates, no lock-in, no surprises. You
              make the choices. We make them real.
            </p>
            <div className="hero-actions">
              <StartLink from="hero" label="Your website starts here" className={buttonClass('primary', 'lg')} />
              <SectionLink id="work" className="link-underline">
                See what’s possible
              </SectionLink>
            </div>
            <NotePin id="ink-play" n={2} tag="Delight" title="Let visitors drop ink themselves" style={{ bottom: -10, right: -10 }}>
              <p>
                The liquid already ripples when the drops land. A click (or tap) on empty background could release a drop
                in a random ink colour — a tiny toy that makes people stay a few seconds longer.
              </p>
              <p>Keep it subtle and off for reduced motion, like the rest of the animation.</p>
            </NotePin>
          </div>
        </div>
      </div>
      <SectionLink id="services" className="scroll-cue">
        <span className="mono">Scroll</span>
        <i aria-hidden />
      </SectionLink>
    </section>
  );
}
