import { supabase } from '../supabase';
import type { ProjectRequest, RequestStatus } from '../types';
import { toApiError, unwrap } from './errors';

export interface ProjectRequestInput {
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  service: string;
  budget: string;
  reply_channel: string;
  message: string;
  /** Which "Start today" button the visitor came from. */
  source: string | null;
}

/** Visitors can add a request but never read one back (see 0003_project_requests.sql). */
export async function submitProjectRequest(input: ProjectRequestInput): Promise<void> {
  const { error } = await supabase.from('project_requests').insert(input);
  if (error) throw toApiError(error, 'We could not send your request just now.');
}

export async function listProjectRequests(): Promise<ProjectRequest[]> {
  const result = await supabase.from('project_requests').select('*').order('created_at', { ascending: false });
  return unwrap(result, 'Could not load requests.') ?? [];
}

export async function setProjectRequestStatus(id: string, status: RequestStatus): Promise<void> {
  const { error } = await supabase.from('project_requests').update({ status }).eq('id', id);
  if (error) throw toApiError(error, 'Could not update the request.');
}

export async function deleteProjectRequest(id: string): Promise<void> {
  const { error } = await supabase.from('project_requests').delete().eq('id', id);
  if (error) throw toApiError(error, 'Could not delete the request.');
}
