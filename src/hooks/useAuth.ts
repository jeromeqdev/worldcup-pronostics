"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data as Profile | null;
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await fetchProfile(user.id);
      setState((prev) => ({
        ...prev,
        profile,
        isAdmin: profile?.is_admin ?? false,
      }));
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const profile = await fetchProfile(user.id);
        setState({
          user,
          profile,
          loading: false,
          isAdmin: profile?.is_admin ?? false,
        });
      } else {
        setState({ user: null, profile: null, loading: false, isAdmin: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            loading: false,
            isAdmin: profile?.is_admin ?? false,
          });
        } else {
          setState({ user: null, profile: null, loading: false, isAdmin: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, signOut, refreshProfile };
}
