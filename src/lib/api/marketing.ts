import { supabase } from '../supabase';
import type { ExperimentResult, Subscriber } from '../types';
import { toApiError, unwrap } from './errors';

// ---- Subscribers ----------------------------------------------------------

/** Adds an email to the list. Already-subscribed addresses count as success. */
export async function subscribe(email: string, source = 'footer'): Promise<'subscribed' | 'already'> {
  const { error } = await supabase.from('subscribers').insert({ email: email.trim().toLowerCase(), source });
  if (!error) return 'subscribed';
  if (error.code === '23505') return 'already';
  throw toApiError(error, 'We could not save your email right now.');
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const result = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
  return unwrap(result, 'Could not load subscribers.') ?? [];
}

export async function deleteSubscriber(id: string): Promise<void> {
  const { error } = await supabase.from('subscribers').delete().eq('id', id);
  if (error) throw toApiError(error, 'Could not remove subscriber.');
}

// ---- Experiments ----------------------------------------------------------

export async function getExperimentSummary(experiment: string): Promise<ExperimentResult[]> {
  const result = await supabase.rpc('experiment_summary', { p_experiment: experiment });
  const rows = (unwrap(result, 'Could not load experiment results.') as ExperimentResult[] | null) ?? [];
  // bigint counts arrive as strings or numbers depending on the driver.
  return rows.map((r) => ({
    variant: r.variant,
    views: Number(r.views),
    cta_clicks: Number(r.cta_clicks),
    bookings: Number(r.bookings),
    // Absent until 0003_project_requests.sql has been applied.
    requests: Number(r.requests ?? 0),
  }));
}
