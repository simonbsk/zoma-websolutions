import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { FullPageSpinner } from '../components/ui/misc';
import { Button } from '../components/ui/Button';

/** Route guard: only authenticated users present in `admin_users` get through. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, session, adminStatus, user, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }

  if (adminStatus === 'unknown' || adminStatus === 'checking') return <FullPageSpinner />;

  if (adminStatus !== 'admin') {
    return (
      <div className="center-screen" style={{ padding: 24 }}>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 16px' }}>
            <ShieldAlert size={20} />
          </div>
          <h1 className="auth-title">No admin access</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            {user?.email} is signed in but is not authorised to use the dashboard.
          </p>
          <Button variant="dark" block style={{ marginTop: 24 }} onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
