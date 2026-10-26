import { NotePin } from '../../../components/notes/DesignNotes';
import {
  BrowserFrame,
  CrumbSite,
  PhoneFrame,
  VelaMobile,
  VelaSite,
  WildpathSite,
} from '../../../components/concepts/ConceptSites';
import { POSSIBILITIES } from '../../../content/site';

/*
 * The three ink colours turn into three websites here. `data-ink-target` tells the background
 * which blob dissolves into which frame (0 iris, 1 saffron, 2 verdant); `data-ink-story-end`
 * marks where the scroll story hands over to them.
 */

function Caption({ name, text, model }: { name: string; text: string; model: string }) {
  return (
    <figcaption className="concept-caption">
      <span className="concept-tag mono">Concept</span>
      <span>
        <strong>{name}</strong> — {text}
      </span>
      <span className="concept-model mono">{model}</span>
    </figcaption>
  );
}

export function Showcase() {
  return (
    <section className="section showcase" id="work" data-ink-story-end aria-labelledby="work-title">
      <div className="container">
        <header className="section-head section-head-split note-host">
          <div>
            <p className="kicker">Design possibilities</p>
            <h2 id="work-title" className="title">
              Three drops. Three businesses. <span className="title-quiet">Anything goes.</span>
            </h2>
          </div>
          <p className="lede">
            The ink you followed down the page just became three websites: a software start-up, an outdoor tour company
            and a neighbourhood bakery. Different business models, different customers, each designed from scratch. Yours
            will look like none of them — that is the point.
          </p>
          <NotePin id="concept-demos" n={5} tag="Showcase" title="Make the concepts clickable" style={{ bottom: -8, right: 0 }}>
            <p>
              Each concept could open as a full-screen, scrollable demo — a whole homepage instead of a screenshot. It
              shows craft better than any sentence, and the demos double as starting points in first calls.
            </p>
            <p>Swap in real client work as it arrives, and keep the “Concept” label honest until then.</p>
          </NotePin>
        </header>

        <div className="concepts">
          <figure className="concept concept-vela accent-iris">
            <div className="concept-stage" data-ink-target="0">
              <BrowserFrame url="vela.example">
                <VelaSite />
              </BrowserFrame>
              <PhoneFrame className="concept-phone">
                <VelaMobile />
              </PhoneFrame>
            </div>
            <Caption name="Vela" text="website for an invoicing app" model="Software as a service" />
          </figure>

          <figure className="concept concept-wild accent-verdant">
            <BrowserFrame url="wildpath.example" data-ink-target="2">
              <WildpathSite />
            </BrowserFrame>
            <Caption name="Wildpath" text="tour booking for a hiking company" model="Tours & bookings" />
          </figure>

          <figure className="concept concept-crumb accent-saffron">
            <PhoneFrame data-ink-target="1">
              <CrumbSite />
            </PhoneFrame>
            <Caption name="Crumb" text="mobile-first site for a bakery" model="Local shop & pre-orders" />
          </figure>
        </div>

        <div className="tile possible" data-reveal>
          <p className="possible-title">If you can describe it, we can build it.</p>
          <ul className="possible-list">
            {POSSIBILITIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
