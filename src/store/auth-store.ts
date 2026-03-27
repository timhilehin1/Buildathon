import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'spent_it_session';
const PROFILE_KEY = 'spent_it_has_profile';

export interface Session {
  accessToken: string;
  userId: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  hasProfile: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  setHasProfile: (value: boolean) => Promise<void>;
}

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 18);
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  hasProfile: false,

  loadSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      const profileFlag = await SecureStore.getItemAsync(PROFILE_KEY);
      if (raw) {
        const session = JSON.parse(raw) as Session;
        set({ session, hasProfile: profileFlag === 'true', isLoading: false });
      } else {
        set({ session: null, isLoading: false });
      }
    } catch {
      set({ session: null, isLoading: false });
    }
  },

  signIn: async (email: string, _password: string) => {
    const session: Session = {
      accessToken: 'mock_' + Date.now(),
      userId: generateUserId(),
      email,
    };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  register: async (email: string, _password: string) => {
    const session: Session = {
      accessToken: 'mock_' + Date.now(),
      userId: generateUserId(),
      email,
    };
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    await SecureStore.deleteItemAsync(PROFILE_KEY);
    set({ session: null, hasProfile: false });
  },

  setHasProfile: async (value: boolean) => {
    await SecureStore.setItemAsync(PROFILE_KEY, value ? 'true' : 'false');
    set({ hasProfile: value });
  },
}));
