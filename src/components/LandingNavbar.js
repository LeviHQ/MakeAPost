'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { GoogleIcon } from '@/components/NavbarAuth';
import { Settings, ArrowRight, Menu, X } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function LandingNavbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setLoading(false);
      return;
    }

    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted) setUser(user || null);
      } catch {
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user || null);
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
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/editor`,
        },
      });
    } catch (err) {
      console.error('Google OAuth error:', err);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>
        <Logo size={38} />

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {!loading && !user && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn-brutal"
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                gap: '6px',
                cursor: 'pointer',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
              title="Sign in with Google"
            >
              <GoogleIcon size={15} />
              <span style={{ fontWeight: 700 }}>Continue with Google</span>
            </button>
          )}

          {!loading && user && (
            <Link
              href="/settings"
              className="btn-brutal"
              style={{
                padding: '7px 14px',
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
              title="Account & Settings"
            >
              <Settings size={15} />
              <span style={{ fontWeight: 700 }}>Settings</span>
            </Link>
          )}

          <Link
            href="/editor"
            className="btn-brutal btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.9rem', gap: '6px' }}
          >
            <span>Go to Editor</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`btn-brutal ${styles.hamburgerBtn}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className={styles.mobileDropdown}>
          <Link
            href="/editor"
            onClick={() => setMenuOpen(false)}
            className="btn-brutal btn-primary"
            style={{
              padding: '10px 16px',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <span>Go to Editor</span>
            <ArrowRight size={15} />
          </Link>

          {!loading && !user && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                handleGoogleLogin();
              }}
              className="btn-brutal"
              style={{
                padding: '10px 16px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
            >
              <GoogleIcon size={16} />
              <span style={{ fontWeight: 700 }}>Continue with Google</span>
            </button>
          )}

          {!loading && user && (
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="btn-brutal"
              style={{
                padding: '10px 16px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                backgroundColor: 'var(--surface)',
                color: 'var(--ink)',
              }}
            >
              <Settings size={16} />
              <span style={{ fontWeight: 700 }}>Account Settings</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
