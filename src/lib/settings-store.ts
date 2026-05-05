import { create } from 'zustand';
import { api } from './api';

interface SiteSettings {
  store_name: string;
  email: string;
  phone: string;
  address: string;
  instagram_url: string;
  tiktok_id: string;
}

interface SettingsState {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: false,
  error: null,
  fetchSettings: async () => {
    const { settings } = get();
    if (settings) return; // Already loaded
    set({ loading: true, error: null });
    try {
      const res = await api.getSiteSettings();
      if (res.data) {
        set({ settings: res.data as SiteSettings, loading: false });
      } else {
        set({ error: res.error || 'Failed to load settings', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
