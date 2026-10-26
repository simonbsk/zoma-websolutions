import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { StartLink } from '../../../components/public/StartLink';
import { NotePin } from '../../../components/notes/DesignNotes';
import { REPLY_DAYS } from '../../../content/site';

/** The closing call to action. Three new drops fall behind it when it scrolls into view. */
export function Closing() {
  return (
    <section className="section closing" id="start" aria-labelledby="start-title">
      <div className="container">
        <div className="closing-panel note-host" data-ink-cta>
          <p className="kicker closing-kicker">Start today</p>
          <h2 id="start-title" className="closing-title">
            The ink is ready. <span>Your idea is next.</span>
          </h2>
          <p className="closing-text">
            Tell us about your business in two minutes. We read every request personally and answer within{' '}
            {REPLY_DAYS} working days — by email, phone, WhatsApp or video call, whichever you prefer.
          </p>
          <div className="closing-actions">
            <StartLink from="closing" label="Your website starts here" className="btn btn-xl btn-inverse" />
            <Link to="/book" className="closing-call">
              Rather talk first? Book a free call <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <ul className="closing-facts mono">
            <li>No obligation</li>
            <li>Fixed-price offer</li>
            <li>Answer in {REPLY_DAYS} working days</li>
          </ul>
          <NotePin id="request-alerts" n={9} tag="Follow-up" title="Ping the team for every new request" style={{ top: 18, right: 18 }}>
            <p>
              Requests land in <strong>Admin → Requests</strong>. A Supabase Edge Function could also email the team (or
              post to a group chat) the moment one arrives, and send the visitor a confirmation with a copy of their
              answers.
            </p>
            <p>Fast first replies win projects — the 3-day promise gets easy to keep.</p>
          </NotePin>
        </div>
      </div>
    </section>
  );
}
