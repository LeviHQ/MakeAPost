'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ThemeToggle from './ThemeToggle';
import { Zap, Settings, AlertCircle, LogIn } from 'lucide-react';

export function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function NavbarAuth({ className = '', style = {} }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let supabase;
    try {
      supabase = createClient();
    } catch (e) {
      console.warn('Supabase not configured in client:', e);
      setLoading(false);
      return;
    }

    async function loadUserAndProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (user) {
          setUser(user);
          // Fetch user profile from public.users
          const { data: profileData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && profileData && isMounted) {
            setProfile(profileData);
            // Cross-device theme sync
            if (profileData.theme) {
              document.documentElement.setAttribute('data-theme', profileData.theme);
              try {
                localStorage.setItem('makeapost-theme', profileData.theme);
              } catch {}
            }
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('NavbarAuth error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        loadUserAndProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const nextPath = window.location.pathname;
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
    } catch (err) {
      console.error('Google OAuth initialization error:', err);
    }
  };

  // Remaining credits calculation
  const plan = profile?.plan || 'trial';
  const dailyCreditsUsed = profile?.daily_credits_used || 0;
  const isTrial = plan === 'trial';
  const isPro = plan === 'pro';
  const isExpired = plan === 'expired';

  const maxDaily = isPro ? 40 : 5;
  const creditsLeft = Math.max(0, maxDaily - dailyCreditsUsed);

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
    >
      <ThemeToggle />

      {!loading && !user && (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-brutal"
          style={{
            padding: '6px 12px',
            fontSize: '0.82rem',
            gap: '6px',
            cursor: 'pointer',
            backgroundColor: 'var(--surface)',
            color: 'var(--ink)',
          }}
          title="Sign in with Google to start your 3-day free trial"
        >
          <GoogleIcon size={15} />
          <span style={{ fontWeight: 700 }}>Continue with Google</span>
        </button>
      )}

      {!loading && user && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {/* Credit Badge */}
          {isExpired ? (
            <Link
              href="/settings"
              className="badge-brutal"
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                borderColor: '#EF4444',
                textDecoration: 'none',
              }}
              title="Trial expired — Click to upgrade to Pro"
            >
              <AlertCircle size={12} />
              <span>Trial Expired</span>
            </Link>
          ) : (
            <Link
              href="/settings"
              className={`badge-brutal ${isPro ? 'badge-blue' : 'badge-yellow'}`}
              style={{
                fontSize: '0.72rem',
                padding: '4px 8px',
                textDecoration: 'none',
              }}
              title={`${creditsLeft} of ${maxDaily} daily AI credits remaining`}
            >
              <Zap size={12} />
              <span>{creditsLeft}/{maxDaily} left</span>
            </Link>
          )}

          {/* User Avatar linking to /settings */}
          <Link
            href="/settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
            title="Settings & Profile"
          >
            {user?.user_metadata?.avatar_url || profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user?.user_metadata?.avatar_url || profile?.avatar_url}
                alt={user?.user_metadata?.full_name || 'User avatar'}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid var(--border-color)',
                  boxShadow: '1.5px 1.5px 0px var(--shadow-color)',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-yellow)',
                  color: '#09090B',
                  border: '2px solid var(--border-color)',
                  boxShadow: '1.5px 1.5px 0px var(--shadow-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {(user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </Link>

          {/* Settings Icon Link */}
          <Link
            href="/settings"
            className="btn-brutal"
            style={{
              padding: '6px 8px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
