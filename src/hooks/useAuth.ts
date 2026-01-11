import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // We need to verify admin role; show loading while we do that.
      setLoading(true);

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: nextSession.user.id,
          _role: 'admin',
        });

        if (error) throw error;
        setIsAdmin(data === true);
      } catch (err) {
        console.error('[useAuth] admin role check failed', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    // THEN get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => applySession(initialSession));

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signOut,
  };
}
