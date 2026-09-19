import { create } from 'zustand';
import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'busy';
  error: string | null;
  notice: 'check-email' | null;
  init: () => void;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  /**
   * Deletes the signed-in user and, by cascade, their synced rows. The anon key
   * cannot touch auth.users, so this calls the `delete_account` security-definer
   * function (see supabase/schema.sql). Local posts are untouched by design.
   */
  deleteAccount: () => Promise<boolean>;
}

const toUser = (u: { id: string; email?: string } | null | undefined): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? '' } : null;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'idle',
  error: null,
  notice: null,
  init: () => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => set({ user: toUser(data.session?.user) }));
    supabase.auth.onAuthStateChange((_event, session) => set({ user: toUser(session?.user) }));
  },
  signUp: async (email, password) => {
    if (!supabase) return false;
    set({ status: 'busy', error: null, notice: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ status: 'idle', error: error.message });
      return false;
    }
    set({ status: 'idle', notice: data.session ? null : 'check-email', user: toUser(data.session?.user) });
    return true;
  },
  signIn: async (email, password) => {
    if (!supabase) return false;
    set({ status: 'busy', error: null, notice: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ status: 'idle', error: error.message });
      return false;
    }
    set({ status: 'idle', user: toUser(data.user) });
    return true;
  },
  signOut: async () => {
    await supabase?.auth.signOut();
    set({ user: null });
  },
  deleteAccount: async () => {
    if (!supabase) return false;
    set({ status: 'busy', error: null, notice: null });
    const { error } = await supabase.rpc('delete_account');
    if (error) {
      set({ status: 'idle', error: error.message });
      return false;
    }
    // The row is gone, but this device still holds the old session; clear it so
    // nothing retries with a token whose user no longer exists.
    await supabase.auth.signOut();
    set({ status: 'idle', user: null });
    return true;
  },
}));
