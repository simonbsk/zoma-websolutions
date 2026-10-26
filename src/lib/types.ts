export const SERVICE_VISUALS = ['landing', 'ecommerce', 'brand', 'webapp', 'seo', 'care'] as const;
export type ServiceVisual = (typeof SERVICE_VISUALS)[number];

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  /** Typical project price ("Projects from …"). Added by 0002_marketing.sql — may be absent. */
  project_from_cents?: number | null;
  currency: string;
  visual: ServiceVisual;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

export interface ExperimentResult {
  variant: string;
  views: number;
  cta_clicks: number;
  bookings: number;
}

export interface Appointment {
  id: string;
  service_id: string;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string; // yyyy-MM-dd
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithService extends Appointment {
  services: Pick<Service, 'id' | 'name' | 'duration_minutes'> | null;
}

export interface BusinessHour {
  id: string;
  weekday: number; // 0 = Sunday … 6 = Saturday
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export interface BlockedDate {
  id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export interface WebdesignSettings {
  id: string;
  business_name: string;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  timezone: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  max_advance_days: number;
  created_at: string;
  updated_at: string;
}

export interface BookedRange {
  appointment_date: string;
  start_time: string;
  end_time: string;
}

/** A normalized, bookable time slot. `start` and `end` are always real Dates. */
export interface Slot {
  start: Date;
  end: Date;
  label: string;
}
