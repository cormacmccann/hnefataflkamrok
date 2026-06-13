import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_anonymous: boolean;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAnonymous: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error?: string }>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    // Listener first (sync only inside)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    // Then check current session
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      } else {
        // Auto-create anonymous guest so multiplayer "just works"
        try {
          const { data: a } = await supabase.auth.signInAnonymously();
          if (a.user) await loadProfile(a.user.id);
        } catch (e) {
          // ignore — anonymous may be disabled
        }
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signInAnonymously = useCallback(async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error && data.user) await loadProfile(data.user.id);
  }, [loadProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string, displayName?: string) => {
    // If currently anonymous, link the credential to keep the same user id (preserves history)
    if (user?.is_anonymous) {
      const { error: linkErr } = await supabase.auth.updateUser({
        email,
        password,
        data: displayName ? { display_name: displayName } : undefined,
      });
      if (linkErr) return { error: linkErr.message };
      // Flip the profile flag
      await supabase.from('profiles').update({
        is_anonymous: false,
        ...(displayName ? { display_name: displayName } : {}),
      }).eq('id', user.id);
      await loadProfile(user.id);
      return {};
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return error ? { error: error.message } : {};
  }, [user, loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) return { error: result.error.message || 'Sign-in failed' };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Immediately replace with a new guest so the app keeps working
    await supabase.auth.signInAnonymously();
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
    if (error) return { error: error.message };
    await loadProfile(user.id);
    return {};
  }, [user, loadProfile]);

  return (
    <Ctx.Provider value={{
      user, session, profile,
      isAnonymous: !!user?.is_anonymous,
      loading,
      refreshProfile,
      signInAnonymously,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      updateDisplayName,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
