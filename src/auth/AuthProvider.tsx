import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AdminStatus = 'unknown' | 'checking' | 'admin' | 'not-admin';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True until the initial session has been restored. */
  loading: boolean;
  adminStatus: AdminStatus;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Admin membership is verified against the `admin_users` table.
 * RLS only lets a user read their own row, and every admin-only table
 * independently enforces `is_admin()` server-side — this check gates the UI.
 */
async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>('unknown');
  const checkedFor = useRef<string | null>(null);

  const resolveAdmin = useCallback(async (next: Session | null) => {
    const userId = next?.user.id ?? null;
    if (!userId) {
      checkedFor.current = null;
      setAdminStatus('not-admin');
      return;
    }
    if (checkedFor.current === userId) return;
    checkedFor.current = userId;
    setAdminStatus('checking');
    const ok = await checkIsAdmin(userId);
    // Ignore stale results if the user changed meanwhile.
    if (checkedFor.current === userId) setAdminStatus(ok ? 'admin' : 'not-admin');
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
      void resolveAdmin(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
      // Defer Supabase calls out of the auth callback to avoid deadlocks.
      setTimeout(() => void resolveAdmin(next), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [resolveAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      throw new Error(
        error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message,
      );
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    checkedFor.current = null;
    setAdminStatus('not-admin');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      adminStatus,
      isAdmin: adminStatus === 'admin',
      signIn,
      signOut,
    }),
    [session, loading, adminStatus, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
