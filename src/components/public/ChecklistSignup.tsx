import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { buttonClass } from '../ui/Button';
import { subscribe } from '../../lib/api/marketing';
import { track } from '../../lib/experiments';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Soft conversion for visitors who aren't ready to book: the launch checklist, one email field, no popup. */
export function ChecklistSignup() {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setState('sending');
    try {
      await subscribe(email, 'checklist');
      track('subscribe');
      setState('done');
    } catch {
      // Never hold the checklist hostage to a failed save.
      setState('failed');
    }
  }

  return (
    <div className="signup">
      <div className="signup-copy">
        <span className="signup-kicker">Free · 24 checks</span>
        <h3>The website launch checklist</h3>
        <p>The checks we run before every launch. Leave your email for occasional notes — the checklist opens right away.</p>
      </div>

      {state === 'done' || state === 'failed' ? (
        <div className="signup-done" role="status">
          <span className="signup-check">
            <Check size={16} strokeWidth={2.6} />
          </span>
          <div>
            <strong>{state === 'done' ? 'You’re on the list.' : 'We couldn’t save your email just now.'}</strong>
            <Link to="/checklist">
              {state === 'done' ? 'Open the checklist' : 'Here’s the checklist anyway'} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ) : (
        <form className="signup-form" onSubmit={onSubmit} noValidate>
          <label className="sr-only" htmlFor={inputId}>
            Email address
          </label>
          <div className="signup-row">
            <input
              id={inputId}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              required
            />
            <button type="submit" className={buttonClass('primary')} disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending…' : 'Get the checklist'}
            </button>
          </div>
          {error ? (
            <span className="signup-error" role="alert">
              {error}
            </span>
          ) : (
            <span className="signup-fine">No spam. Unsubscribe anytime.</span>
          )}
        </form>
      )}
    </div>
  );
}
