'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import { GoogleIcon } from '@/components/NavbarAuth';
import { Settings, ArrowRight, Menu, X } from 'lucide-react';
import styles from '@/app/page.module.css';

const NAV_LINKS = [
  { href: '#problem', label: 'The Problem' },
  { href: '#features', label: 'Studio & AI' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#privacy-architecture', label: 'Privacy' },
  { href: '#faq', label: 'FAQ' },
];

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
        {/* Left: Brand Logo */}
        <div className={styles.navBrandGroup}>
          <Logo size={36} />
        </div>

        {/* Center: Smooth Anchor Links (Desktop) */}
        <nav className={styles.navLinksDesktop} aria-label="Landing sections">
          {NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href} className={styles.navSectionLink}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: Dynamic Auth & Studio CTA (Desktop) */}
        <div className={styles.desktopNav}>
          {!loading && !user && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-brutal"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.84rem',
                  gap: '6px',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                }}
                title="Sign in with Google"
              >
                <GoogleIcon size={15} />
                <span>Sign In with Google</span>
              </button>

              <Link
                href="/editor"
                className="btn-brutal btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.88rem', gap: '6px' }}
              >
                <span>Launch Studio Free</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link
                href="/settings"
                className="btn-brutal"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.84rem',
                  gap: '6px',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                }}
                title="Account & Settings"
              >
                <Settings size={15} />
                <span>Settings</span>
              </Link>

              <Link
                href="/editor"
                className="btn-brutal btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.88rem', gap: '6px' }}
              >
                <span>Open Studio</span>
                <ArrowRight size={14} />
              </Link>
            </>
          )}

          {loading && (
            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.88rem', gap: '6px' }}
            >
              <span>Launch Studio Free</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Mobile Controls: Hamburger */}
        <div className={styles.mobileControls}>
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
      </div>

      {/* Mobile Dropdown Overlay (Zero Layout Shift) */}
      {menuOpen && (
        <div className={styles.mobileDropdown}>
          <div className={styles.mobileSectionLinks}>
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={styles.mobileSectionLink}
              >
                {item.label}
              </a>
            ))}
          </div>

          <Link
            href="/editor"
            onClick={() => setMenuOpen(false)}
            className="btn-brutal btn-primary"
            style={{ width: '100%', padding: '10px 16px', fontSize: '0.92rem' }}
          >
            <span>{user ? 'Open Studio' : 'Launch Studio Free'}</span>
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
              style={{ width: '100%', padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <GoogleIcon size={16} />
              <span>Sign In with Google</span>
            </button>
          )}

          {!loading && user && (
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="btn-brutal"
              style={{ width: '100%', padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <Settings size={16} />
              <span>Account Settings</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
