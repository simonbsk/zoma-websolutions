import { createContext, useContext, type ReactNode } from 'react';
import { getSettings } from './api/settings';
import type { WebdesignSettings } from './types';
import { useAsync } from './useAsync';

interface SiteSettingsValue {
  settings: WebdesignSettings | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsValue>({
  settings: null,
  loading: true,
  reload: async () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data, loading, reload } = useAsync(getSettings, []);
  return (
    <SiteSettingsContext.Provider value={{ settings: data ?? null, loading, reload }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsValue {
  return useContext(SiteSettingsContext);
}

export function useBusinessName(): string {
  const { settings } = useSiteSettings();
  return settings?.business_name || 'ZomaWebsolutions';
}
