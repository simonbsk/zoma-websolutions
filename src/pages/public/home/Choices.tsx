import { useId, type CSSProperties, type ReactNode } from 'react';
import { Check, KeyRound, Mail, MessageCircle, Phone, Video } from 'lucide-react';
import { buttonClass } from '../../../components/ui/Button';
import { SectionLink } from '../../../components/public/SectionLink';
import { StartLink } from '../../../components/public/StartLink';
import { NotePin } from '../../../components/notes/DesignNotes';
import {
  BUDGET_OPTIONS,
  DIRECTIONS,
  FEATURE_OPTIONS,
  REPLY_CHANNELS,
  REPLY_DAYS,
  type BudgetOption,
  type ReplyChannel,
} from '../../../content/site';
import { useChoice } from '../../../lib/choices';
import './choices.css';

type Accent = 'iris' | 'saffron' | 'verdant';

function ChoiceTile({
  n,
  accent,
  title,
  text,
  children,
}: {
  n: number;
  accent: Accent;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <li className={`tile choice accent-${accent}`} data-reveal>
      <div className="choice-head">
        <span className="choice-step mono">Choice {String(n).padStart(2, '0')}</span>
        <span className="choice-dot" aria-hidden />
      </div>
      <h3>{title}</h3>
      <p className="choice-text">{text}</p>
      <div className="choice-visual">{children}</div>
    </li>
  );
}

/* 1 — three design directions ------------------------------------------------ */

function DirectionPicker() {
  const [pick, setPick] = useChoice('direction', 'b');
  const name = useId();
  return (
    <fieldset className="dir">
      <legend className="sr-only">Pick a design direction</legend>
      {DIRECTIONS.map((d) => (
        <label key={d.id} className={`dir-card dir-${d.id} ${pick === d.id ? 'is-on' : ''}`}>
          <input
            type="radio"
            className="sr-only"
            name={name}
            value={d.id}
            checked={pick === d.id}
            onChange={() => setPick(d.id)}
          />
          <span className="dir-art" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="dir-name">{d.name}</span>
          <span className="dir-note">{d.note}</span>
          <span className="dir-check" aria-hidden>
            <Check size={12} strokeWidth={3} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

/* 2 — features ---------------------------------------------------------------- */

function FeatureToggles() {
  const [features, setFeatures] = useChoice('features', ['Online booking', 'Two languages']);
  const toggle = (f: string) => setFeatures(features.includes(f) ? features.filter((x) => x !== f) : [...features, f]);
  return (
    <div className="feat">
      <ul>
        {FEATURE_OPTIONS.map((f) => {
          const on = features.includes(f);
          return (
            <li key={f}>
              <label className={`feat-row ${on ? 'is-on' : ''}`}>
                <span>{f}</span>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(f)} />
                <span className="feat-switch" aria-hidden />
              </label>
            </li>
          );
        })}
      </ul>
      <p className="feat-sum mono" aria-live="polite">
        {features.length} of {FEATURE_OPTIONS.length} switched on
      </p>
    </div>
  );
}

/* 3 — budget ------------------------------------------------------------------ */

const FIT: Record<BudgetOption, string> = {
  '800-1200': 'Start',
  '1200-2000': 'Start, with room to grow',
  '2000-3000': 'Business',
  '3000-4000': 'Signature',
  flexible: 'whatever fits — we’ll suggest it',
};

const TICKS = ['800+', '1,200+', '2,000+', '3,000+', 'Open'];

function BudgetSlider() {
  const [budget, setBudget] = useChoice('budget', '2000-3000');
  const id = useId();
  const index = Math.max(
    0,
    BUDGET_OPTIONS.findIndex((b) => b.id === budget),
  );
  const label = BUDGET_OPTIONS[index].label;
  const progress = `${(index / (BUDGET_OPTIONS.length - 1)) * 100}%`;
  return (
    <div className="budget">
      <output htmlFor={id} className="budget-value">
        {label}
      </output>
      <input
        id={id}
        type="range"
        min={0}
        max={BUDGET_OPTIONS.length - 1}
        step={1}
        value={index}
        aria-label="Budget"
        aria-valuetext={label}
        onChange={(e) => setBudget(BUDGET_OPTIONS[Number(e.target.value)].id)}
        style={{ '--p': progress } as CSSProperties}
      />
      <div className="budget-ticks mono" aria-hidden>
        {TICKS.map((tick, i) => (
          <span key={tick} className={i === index ? 'is-on' : ''}>
            {tick}
          </span>
        ))}
      </div>
      <p className="budget-fit">
        Fits <strong>{FIT[budget]}</strong>
        <SectionLink id="pricing" className="link-underline">
          See pricing
        </SectionLink>
      </p>
    </div>
  );
}

/* 4 — reply channel ----------------------------------------------------------- */

const CHANNEL_ICON = { email: Mail, phone: Phone, whatsapp: MessageCircle, video: Video } as const;

const PREVIEW: Record<ReplyChannel, { head: string; text: string }> = {
  email: {
    head: 'Re: Your website idea',
    text: 'We’ve read your request and sketched a first plan. Three quick questions before we put a price on it…',
  },
  phone: {
    head: 'Call at a time you pick',
    text: 'Fifteen minutes to talk your idea through, then a written plan and a fixed price in your inbox.',
  },
  whatsapp: {
    head: 'Zoma Websolutions',
    text: 'Hi Lena! Thanks for your request — we already have an idea for the booking page. Got 10 minutes tomorrow?',
  },
  video: {
    head: 'Invite: Website kick-off · 30 min',
    text: 'We share our screen, sketch with you live, and you leave with a plan and an honest price.',
  },
};

function ChannelPicker() {
  const [channel, setChannel] = useChoice('channel', 'whatsapp');
  const name = useId();
  const Icon = CHANNEL_ICON[channel];
  const preview = PREVIEW[channel];
  return (
    <div className="chan">
      <fieldset className="chan-chips">
        <legend className="sr-only">How should we reply?</legend>
        {REPLY_CHANNELS.map((c) => {
          const ChipIcon = CHANNEL_ICON[c.id];
          return (
            <label key={c.id} className={`chan-chip ${channel === c.id ? 'is-on' : ''}`}>
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={c.id}
                checked={channel === c.id}
                onChange={() => setChannel(c.id)}
              />
              <ChipIcon size={15} aria-hidden />
              {c.label}
            </label>
          );
        })}
      </fieldset>
      <div aria-live="polite">
        {/* Keyed so the bubble pops in again for every channel. */}
        <div key={channel} className="chan-msg">
          <div className="chan-msg-head">
            <span className="chan-avatar" aria-hidden>
              <Icon size={14} />
            </span>
            <strong>{preview.head}</strong>
          </div>
          <p>{preview.text}</p>
          <span className="chan-msg-time mono">within {REPLY_DAYS} working days</span>
        </div>
      </div>
    </div>
  );
}

/* 5 — live preview ------------------------------------------------------------ */

function LivePreview() {
  return (
    <div className="live" aria-hidden>
      <div className="live-window">
        <div className="live-bar">
          <i />
          <i />
          <i />
          <span className="mono">preview.zoma.studio/your-site</span>
        </div>
        <div className="live-page">
          <span className="live-logo" />
          <span className="live-nav" />
          <span className="live-h" />
          <span className="live-h live-h-2" />
          <span className="live-l" />
          <span className="live-l live-l-2" />
          <span className="live-btn" />
          <span className="live-img" />
        </div>
        <span className="live-pin">1</span>
        <div className="live-comment">
          <strong>You</strong>
          Could the logo be a little bigger?
        </div>
        <div className="live-reply">
          <Check size={12} strokeWidth={3} /> Done — updated 2 min ago
        </div>
      </div>
      <span className="live-status mono">
        <i /> Live preview · updated today
      </span>
    </div>
  );
}

/* 6 — ownership --------------------------------------------------------------- */

const OWNED = ['Domain', 'Code', 'Content & images', 'Accounts & logins'];

function Ownership() {
  return (
    <div className="own" aria-hidden>
      <div className="own-card own-card-back" />
      <div className="own-card">
        <div className="own-head">
          <span className="own-key">
            <KeyRound size={17} />
          </span>
          <div>
            <span className="mono">Handover certificate</span>
            <strong>Registered to: you</strong>
          </div>
        </div>
        <ul>
          {OWNED.map((item) => (
            <li key={item}>
              <span>{item}</span>
              <span className="own-check">
                <Check size={13} strokeWidth={2.6} /> yours
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Section --------------------------------------------------------------------- */

export function Choices() {
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="container">
        <header className="section-head note-host">
          <p className="kicker">How it works</p>
          <h2 id="process-title" className="title">
            You make the choices. <span className="title-quiet">We make them real.</span>
          </h2>
          <p className="lede">
            No packages to squeeze into, no decisions made behind your back. At every step you decide — and see exactly
            what each choice means for your site, your budget and your timeline.
          </p>
          <NotePin id="live-estimate" n={4} tag="Conversion" title="Turn the squares into a live estimate" style={{ bottom: 0, right: 0 }}>
            <p>
              The squares already remember what a visitor picks and pre-fill the project form. Next step: a small running
              total (“Business package, around €2,300, about 5 weeks”) that updates with every switch — visitors love
              seeing a number before they ask.
            </p>
          </NotePin>
        </header>

        <ol className="choices">
          <ChoiceTile
            n={1}
            accent="iris"
            title="Pick your direction."
            text="We design three directions for your homepage. Choose one, mix two or send us back to the drawing board — as often as it takes."
          >
            <DirectionPicker />
          </ChoiceTile>
          <ChoiceTile
            n={2}
            accent="saffron"
            title="Decide what it can do."
            text="Bookings, a shop, two languages? Switch on what your business needs today — and add more whenever you are ready."
          >
            <FeatureToggles />
          </ChoiceTile>
          <ChoiceTile
            n={3}
            accent="verdant"
            title="Set the budget. Keep it."
            text="You get a fixed price before any work starts. If something changes, you decide whether it’s worth it — never an hourly surprise."
          >
            <BudgetSlider />
          </ChoiceTile>
          <ChoiceTile
            n={4}
            accent="iris"
            title="Choose how we talk."
            text="Email, phone, WhatsApp or video — you pick the channel and the rhythm. One clear update a week, no chasing."
          >
            <ChannelPicker />
          </ChoiceTile>
          <ChoiceTile
            n={5}
            accent="saffron"
            title="Watch it grow, live."
            text="From week two you have a private preview link. Click around, comment right on the page and see changes the same day."
          >
            <LivePreview />
          </ChoiceTile>
          <ChoiceTile
            n={6}
            accent="verdant"
            title="Keep the keys."
            text="Domain, code, content and accounts are yours from day one. Stay for our care plan or take it all anywhere — no lock-in."
          >
            <Ownership />
          </ChoiceTile>
        </ol>

        <div className="choices-carry" data-reveal>
          <p>
            <strong>Your picks travel with you.</strong> Open the project form and everything you chose above is already
            filled in.
          </p>
          <StartLink from="choices" className={buttonClass('primary', 'lg')} />
        </div>
      </div>
    </section>
  );
}
