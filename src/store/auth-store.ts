import { supabase } from '@/src/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const SESSION_KEY = 'spent_it_session';
const PROFILE_KEY = 'spent_it_has_profile';

export interface Session {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  expiresAt: number;
}

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  hasProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setHasProfile: (value: boolean) => Promise<void>;
}

function buildSession(data: { access_token: string; refresh_token: string; expires_at?: number }, userId: string, email: string): Session {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    userId,
    email,
    expiresAt: data.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,
  hasProfile: false,

  loadSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!raw) {
        set({ session: null, hasProfile: false, isLoading: false });
        return;
      }

      let session = JSON.parse(raw) as Session;

      const expiresIn = session.expiresAt - Math.floor(Date.now() / 1000);
      if (expiresIn < 300) {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: session.refreshToken });
        if (!error && data.session) {
          session = buildSession(data.session, data.session.user.id, data.session.user.email!);
          await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
        } else {
          set({ session: null, hasProfile: false, isLoading: false });
          return;
        }
      }

      const profileFlag = await SecureStore.getItemAsync(PROFILE_KEY);
      let hasProfile = profileFlag === 'true';
      try {
        const { profileApi } = await import('@/src/api/profile');
        await profileApi.get();
        hasProfile = true;
        await SecureStore.setItemAsync(PROFILE_KEY, 'true');
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          hasProfile = false;
          await SecureStore.setItemAsync(PROFILE_KEY, 'false');
        }
        // any other error — keep local flag
      }

      set({ session, hasProfile, isLoading: false });
    } catch {
      set({ session: null, hasProfile: false, isLoading: false });
    }
  },

  refreshSession: async () => {
    const current = get().session;
    if (!current) return;
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: current.refreshToken });
    if (error || !data.session) throw new Error('Session refresh failed');
    const refreshed = buildSession(data.session, data.session.user.id, data.session.user.email!);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(refreshed));
    set({ session: refreshed });
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const session = buildSession(data.session, data.user.id, data.user.email!);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));

    let hasProfile = false;
    try {
      const { profileApi } = await import('@/src/api/profile');
      await profileApi.get();
      hasProfile = true;
      await SecureStore.setItemAsync(PROFILE_KEY, 'true');
    } catch (err: any) {
      if (err?.response?.status === 404) {
        await SecureStore.setItemAsync(PROFILE_KEY, 'false');
      }
    }

    set({ session, hasProfile });
  },

  register: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Email confirmation required — disable it in Supabase: Authentication > Providers > Email > Confirm email');
    const session = buildSession(data.session, data.user!.id, data.user!.email!);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    await SecureStore.setItemAsync(PROFILE_KEY, 'false');
    set({ session, hasProfile: false });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(SESSION_KEY);
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    set({ session: null, hasProfile: false });
  },

  setHasProfile: async (value: boolean) => {
    await SecureStore.setItemAsync(PROFILE_KEY, value ? 'true' : 'false');
    set({ hasProfile: value });
  },
}));
