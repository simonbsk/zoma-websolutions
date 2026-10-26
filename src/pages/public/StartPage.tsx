import { useId, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { isToday, isTomorrow } from 'date-fns';
import { ArrowLeft, ArrowRight, Check, Mail, MessageCircle, Phone, Sparkles, Video } from 'lucide-react';
import { Button, buttonClass } from '../../components/ui/Button';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field';
import { Alert } from '../../components/ui/misc';
import { NotePin } from '../../components/notes/DesignNotes';
import { hasStartAccess, type StartState } from '../../components/public/StartLink';
import {
  BUDGET_OPTIONS,
  REPLY_CHANNELS,
  REPLY_DAYS,
  SERVICE_OPTIONS,
  type BudgetOption,
  type ReplyChannel,
  type ServiceOption,
} from '../../content/site';
import { submitProjectRequest } from '../../lib/api/requests';
import { errorMessage } from '../../lib/api/errors';
import { clearChoices, readChoices } from '../../lib/choices';
import { track } from '../../lib/experiments';
import { useSiteSettings } from '../../lib/SiteSettings';
import { useNextFreeSlot } from '../../lib/useNextFreeSlot';
import { addWorkingDays, safeFormat } from '../../lib/time';
import './start.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()/.-]{6,30}$/;
const CHANNEL_ICON = { email: Mail, phone: Phone, whatsapp: MessageCircle, video: Video } as const;
const needsPhone = (channel: ReplyChannel) => channel === 'phone' || channel === 'whatsapp';

interface FormState {
  name: string;
  email: string;
  phone: string;
  business: string;
  service: ServiceOption | '';
  budget: BudgetOption | '';
  channel: ReplyChannel;
  message: string;
  /** Honeypot: hidden from people, filled in by bots. */
  website: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

function initialState(entry: StartState): { form: FormState; carried: boolean } {
  const choices = readChoices();
  const features = choices.features ?? [];
  const carried = Boolean(choices.budget || choices.channel || features.length);
  return {
    carried,
    form: {
      name: '',
      email: '',
      phone: '',
      business: '',
      service: entry.service ?? '',
      budget: entry.budget ?? choices.budget ?? '',
      channel: choices.channel ?? 'email',
      message: features.length ? `Features I’m thinking about: ${features.join(', ')}.\n\n` : '',
      website: '',
    },
  };
}

function validate(f: FormState): Errors {
  const errors: Errors = {};
  if (f.name.trim().length < 2) errors.name = 'Please tell us your name.';
  if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Please enter a valid email address.';
  const phone = f.phone.trim();
  if (phone && !PHONE_RE.test(phone)) errors.phone = 'That doesn’t look like a phone number.';
  else if (!phone && needsPhone(f.channel)) errors.phone = 'We need a number to call or message you.';
  if (!f.service) errors.service = 'Please choose what you need.';
  if (!f.budget) errors.budget = 'Please choose a budget — “No fixed budget yet” is fine.';
  if (f.message.trim().length < 10) errors.message = 'A sentence or two about your idea helps us a lot.';
  return errors;
}

/** The entry check: only the designated "Start today" buttons open the form. */
export function StartPage() {
  const location = useLocation();
  if (!hasStartAccess(location.state)) return <Navigate to={{ pathname: '/', hash: '#start' }} replace />;
  return <StartForm entry={location.state} />;
}

function StartForm({ entry }: { entry: StartState }) {
  const [{ form: initial, carried }] = useState(() => initialState(entry));
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; channel: ReplyChannel; by: Date } | null>(null);
  const { settings } = useSiteSettings();
  const channelName = useId();
  const formRef = useRef<HTMLFormElement>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, ...(key === 'channel' ? { phone: undefined } : {}) }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      // Once the messages render, move focus to the first field that needs attention.
      requestAnimationFrame(() => {
        const field = formRef.current?.querySelector('.field-error')?.closest('.field');
        field?.querySelector<HTMLElement>('input, select, textarea')?.focus();
      });
      return;
    }
    const done = () => {
      clearChoices();
      setSent({ name: form.name.trim().split(/\s+/)[0], channel: form.channel, by: addWorkingDays(new Date(), REPLY_DAYS) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    // Bots fill the honeypot; let them believe it worked.
    if (form.website) {
      done();
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      await submitProjectRequest({
        full_name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        business_name: form.business.trim() || null,
        service: form.service,
        budget: form.budget,
        reply_channel: form.channel,
        message: form.message.trim(),
        source: entry.from.slice(0, 40),
      });
      track('request_sent');
      done();
    } catch (err) {
      setSendError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const replyBy = addWorkingDays(new Date(), REPLY_DAYS);

  return (
    <div className="start">
      <div className="container">
        <Link to="/" className="back-link">
          <ArrowLeft size={15} /> Back to the homepage
        </Link>

        <header className="start-head">
          <p className="kicker">{sent ? 'Request sent' : 'Start your project'}</p>
          <h1>{sent ? `Thank you, ${sent.name}.` : 'Your website starts here.'}</h1>
          <p className="lede">
            {sent
              ? 'Your request is with us. Here is what happens now.'
              : 'Tell us a little about you and your idea. It takes about two minutes and commits you to nothing.'}
          </p>
        </header>

        <div className="start-grid">
          {sent ? (
            <SentCard {...sent} />
          ) : (
            <form ref={formRef} className="tile start-form note-host" onSubmit={onSubmit} noValidate>
              {carried ? (
                <p className="start-carried">
                  <Sparkles size={16} aria-hidden /> We filled in the choices you made on the homepage — change anything
                  you like.
                </p>
              ) : null}

              <fieldset className="start-group">
                <legend>About you</legend>
                <div className="grid-2">
                  <TextField
                    label="Your name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    error={errors.name}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    error={errors.email}
                  />
                </div>
                <div className="grid-2">
                  <TextField
                    label="Phone number"
                    type="tel"
                    autoComplete="tel"
                    optional={!needsPhone(form.channel)}
                    hint={needsPhone(form.channel) ? 'Needed for a call or WhatsApp reply.' : undefined}
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    error={errors.phone}
                  />
                  <TextField
                    label="Business name"
                    autoComplete="organization"
                    optional
                    value={form.business}
                    onChange={(e) => set('business', e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="start-group">
                <legend>Your project</legend>
                <div className="grid-2">
                  <SelectField
                    label="What do you need?"
                    value={form.service}
                    onChange={(e) => set('service', e.target.value as ServiceOption | '')}
                    error={errors.service}
                  >
                    <option value="" disabled>
                      Choose a service
                    </option>
                    {SERVICE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Your budget"
                    value={form.budget}
                    onChange={(e) => set('budget', e.target.value as BudgetOption | '')}
                    error={errors.budget}
                  >
                    <option value="" disabled>
                      Choose a range
                    </option>
                    {BUDGET_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </fieldset>

              <fieldset className="start-group">
                <legend>How should we reply?</legend>
                <div className="start-channels">
                  {REPLY_CHANNELS.map((c) => {
                    const Icon = CHANNEL_ICON[c.id];
                    const on = form.channel === c.id;
                    return (
                      <label key={c.id} className={`start-channel ${on ? 'is-on' : ''}`}>
                        <input
                          type="radio"
                          className="sr-only"
                          name={channelName}
                          value={c.id}
                          checked={on}
                          onChange={() => set('channel', c.id)}
                        />
                        <Icon size={18} aria-hidden />
                        {c.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="start-group">
                <legend>Your idea</legend>
                <TextAreaField
                  label="What should your website do?"
                  hint="Who is it for, what should visitors do, sites you like, what you already have (logo, texts, photos)… Rough notes are perfect."
                  rows={7}
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  error={errors.message}
                />
              </fieldset>

              <div className="start-hp" aria-hidden>
                <label>
                  Leave this field empty
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set('website', e.target.value)}
                  />
                </label>
              </div>

              {sendError ? (
                <Alert tone="error">
                  {sendError}{' '}
                  {settings?.business_email ? (
                    <>
                      You can also write to us at <a href={`mailto:${settings.business_email}`}>{settings.business_email}</a>.
                    </>
                  ) : null}
                </Alert>
              ) : null}

              <div className="start-submit">
                <Button type="submit" size="lg" loading={sending}>
                  {sending ? 'Sending…' : 'Send my request'} {sending ? null : <ArrowRight size={18} className="btn-arrow" />}
                </Button>
                <p className="start-privacy">
                  We only use your details to answer this request. Nothing is shared, nothing is sold.
                </p>
              </div>

              <NotePin id="form-next" n={10} tag="Next" title="Uploads, confirmations and spam" style={{ top: 18, right: 18 }}>
                <p>
                  Three upgrades for this form: an optional <strong>file upload</strong> (logo, briefing, photos) via
                  Supabase Storage, an automatic <strong>confirmation email</strong> with a copy of the answers, and
                  Cloudflare <strong>Turnstile</strong> if the honeypot ever stops catching spam.
                </p>
              </NotePin>
            </form>
          )}

          <Aside replyBy={sent?.by ?? replyBy} />
        </div>
      </div>
    </div>
  );
}

function SentCard({ channel, by }: { channel: ReplyChannel; by: Date }) {
  const label = REPLY_CHANNELS.find((c) => c.id === channel)?.label ?? 'Email';
  return (
    <div className="tile start-sent" role="status">
      <span className="start-sent-icon" aria-hidden>
        <Check size={26} strokeWidth={2.4} />
      </span>
      <h2>Your request is in.</h2>
      <p>
        We’ll get back to you by <strong>{label.toLowerCase()}</strong> by <strong>{safeFormat(by, 'EEEE, d MMMM')}</strong>{' '}
        at the latest — usually sooner.
      </p>
      <ul className="start-sent-tips">
        <li>Collect two or three websites you like, and what you like about them.</li>
        <li>Gather what you already have: logo, texts, photos, opening hours.</li>
        <li>Think about the one thing a visitor should do on your site.</li>
      </ul>
      <Link to="/" className={buttonClass('primary', 'lg')}>
        Back to the homepage
      </Link>
    </div>
  );
}

function slotDay(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return safeFormat(date, 'EEEE d MMMM');
}

function Aside({ replyBy }: { replyBy: Date }) {
  const nextSlot = useNextFreeSlot();
  const { settings } = useSiteSettings();
  return (
    <aside className="start-aside" aria-label="What happens next">
      <div className="tile start-steps">
        <h2>What happens next</h2>
        <ol>
          <li>
            <span className="start-step-n accent-iris">1</span>
            <div>
              <strong>We read it — personally.</strong>
              <p>Your request goes straight to the four of us. No sales team, no autoresponder pretending to care.</p>
            </div>
          </li>
          <li>
            <span className="start-step-n accent-saffron">2</span>
            <div>
              <strong>We think it through.</strong>
              <p>
                We look at your business, your current site and your ideas, and sketch a first plan: pages, features, the
                package that fits and what it would cost.
              </p>
            </div>
          </li>
          <li>
            <span className="start-step-n accent-verdant">3</span>
            <div>
              <strong>You hear from us within {REPLY_DAYS} working days.</strong>
              <p>
                By email, phone, WhatsApp or video call — whichever you chose. You get honest feedback, our open
                questions and a fixed-price estimate. No obligation, ever.
              </p>
            </div>
          </li>
        </ol>
        <p className="start-promise mono">
          <i aria-hidden /> Reply by {safeFormat(replyBy, 'EEEE, d MMMM')} at the latest
        </p>
      </div>

      <div className="tile start-call">
        <div>
          <strong>Rather talk first?</strong>
          <p>
            Book a free call instead.
            {nextSlot ? (
              <>
                {' '}
                Next free slot: <b>{slotDay(nextSlot.slot.start)}, {nextSlot.slot.label}</b>.
              </>
            ) : null}
          </p>
        </div>
        <Link to="/book" className={buttonClass('ghost')}>
          Book a call
        </Link>
      </div>

      {settings?.business_email ? (
        <p className="start-contact">
          Or simply write to <a href={`mailto:${settings.business_email}`}>{settings.business_email}</a>.
        </p>
      ) : null}
    </aside>
  );
}
