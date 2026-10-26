import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { Alert, FullPageSpinner } from '../../components/ui/misc';
import { BrandMark } from '../../components/public/Brand';
import { errorMessage } from '../../lib/api/errors';
import './admin.css';

/** Only allow redirects to internal admin paths. */
function safeNext(value: string | null): string {
  if (value && value.startsWith('/admin') && !value.startsWith('//')) return value;
  return '/admin';
}

export function LoginPage() {
  const { session, loading, adminStatus, signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <FullPageSpinner />;
  // Already signed in: the guard on /admin decides between dashboard and "no access".
  if (session && adminStatus !== 'checking' && adminStatus !== 'unknown') return <Navigate to={next} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <BrandMark size={40} />
        </div>
        <h1 className="auth-title">Studio-Dashboard</h1>
        <p className="auth-sub">Melden Sie sich mit Ihrem Administratorkonto an.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <TextField
            label="E-Mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            required
          />
          <TextField
            label="Passwort"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="dark" size="lg" block loading={submitting}>
            {submitting ? 'Anmeldung läuft…' : 'Anmelden'}
          </Button>
        </form>

        <p className="auth-foot">
          <Lock size={13} /> Zugang nur für autorisierte Mitarbeitende.
        </p>
      </div>
      <Link to="/" className="auth-back">
        <ArrowLeft size={15} /> Zurück zur Website
      </Link>
    </div>
  );
}
