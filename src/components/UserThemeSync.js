'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserThemeSync() {
  useEffect(() => {
    let isMounted = true;
    let supabase;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    async function syncTheme() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (user) {
          // Logged-in user: database is source of truth
          const { data: profile } = await supabase
            .from('users')
            .select('theme')
            .eq('id', user.id)
            .single();

          if (!isMounted) return;

          if (profile?.theme) {
            const userTheme = profile.theme === 'dark' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', userTheme);
            try {
              localStorage.setItem('makeapost-theme', userTheme);
            } catch {}
            return;
          }
        }

        // Guest / Not logged in: Default to 'light'
        const saved = localStorage.getItem('makeapost-theme');
        const defaultTheme = saved === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', defaultTheme);
      } catch (err) {
        console.error('Theme sync error:', err);
      }
    }

    syncTheme();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        // User signed in: load and apply their account theme from database
        const { data: profile } = await supabase
          .from('users')
          .select('theme')
          .eq('id', session.user.id)
          .single();

        if (profile?.theme && isMounted) {
          const userTheme = profile.theme === 'dark' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', userTheme);
          try {
            localStorage.setItem('makeapost-theme', userTheme);
          } catch {}
        }
      } else if (event === 'SIGNED_OUT') {
        // Reset to default light mode on sign out
        document.documentElement.setAttribute('data-theme', 'light');
        try {
          localStorage.setItem('makeapost-theme', 'light');
        } catch {}
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return null;
}
