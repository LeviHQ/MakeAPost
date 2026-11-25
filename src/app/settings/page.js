'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Check,
  ShieldCheck,
  Home,
  Menu,
  X,
  Zap,
  Lock,
  Smartphone,
} from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'light';
    }
    return 'light';
  });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (!user) {
          router.push('/?auth_required=true');
          return;
        }

        setUser(user);

        // Fetch user profile from PostgreSQL
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && isMounted) {
          setProfile(profileData);
          const activeTheme = profileData.theme === 'dark' ? 'dark' : 'light';
          setTheme(activeTheme);
          document.documentElement.setAttribute('data-theme', activeTheme);
          try {
            localStorage.setItem('makeapost-theme', activeTheme);
          } catch {}
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Handle Theme Preference Change
  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('makeapost-theme', newTheme);
    } catch {}

    if (!user) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ theme: newTheme })
        .eq('id', user.id);

      if (error) {
        const errorMsg = error?.message || error?.details || 'Database permission error';
        console.error('Failed to sync theme to Supabase:', errorMsg, error);
        showToast(`Error: ${errorMsg}`);
      } else {
        showToast(`Theme updated to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
      }
    } catch (err) {
      console.error('Failed to sync theme to Supabase exception:', err?.message || err);
      showToast('Error saving theme to account. Please retry.');
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      document.documentElement.setAttribute('data-theme', 'light');
      try {
        localStorage.setItem('makeapost-theme', 'light');
      } catch {}
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div
        className={styles.settingsContainer}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="badge-brutal badge-yellow" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
          <Sparkles size={16} />
          <span>Loading Account &amp; Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      {/* Top Header */}
      <header className={styles.settingsHeader}>
        <div className={styles.headerInner}>
          <Logo size={36} />

          {/* Desktop Navigation Links */}
          <div className={styles.desktopNav}>
            <Link
              href="/"
              className="btn-brutal"
              style={{ padding: '8px 16px', fontSize: '0.88rem', gap: '6px' }}
            >
              <Home size={15} />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.88rem', gap: '6px' }}
            >
              <Sparkles size={15} />
              <span>Back to Studio</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className={`btn-brutal ${styles.hamburgerBtn}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileDropdown}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`btn-brutal ${styles.mobileMenuItem}`}
            >
              <Home size={16} />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/editor"
              onClick={() => setMobileMenuOpen(false)}
              className={`btn-brutal btn-primary ${styles.mobileMenuItem}`}
            >
              <Sparkles size={16} />
              <span>Back to Studio</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Settings Content */}
      <main className={styles.mainContent}>
        <div className={styles.pageHeading}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Account &amp; Settings</h1>
            <div className="badge-brutal badge-blue" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
              <ShieldCheck size={13} />
              <span>POSTGRESQL SYNCED</span>
            </div>
          </div>
          <p className={styles.pageSubtitle}>
            Manage your creator profile, trial status, and cross-device design preferences.
          </p>
        </div>

        {/* Card 1: Profile Information */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <User size={18} />
              <span>Profile Information</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-brutal"
              style={{
                padding: '6px 12px',
                fontSize: '0.82rem',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                borderColor: '#DC2626',
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          <div className={styles.profileRow}>
            {user?.user_metadata?.avatar_url || profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user?.user_metadata?.avatar_url || profile?.avatar_url}
                alt={user?.user_metadata?.full_name || 'User avatar'}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {(user.email?.[0] || 'U').toUpperCase()}
              </div>
            )}

            <div className={styles.profileInfo}>
              <div className={styles.userName}>
                {user?.user_metadata?.full_name || profile?.full_name || 'MakeAPost Creator'}
              </div>
              <div className={styles.userEmail}>{user.email}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px' }}>
                Signed in via Google Auth • User ID: {user.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </section>

        {/* Card 2: Plan & Credit Status */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Zap size={18} />
              <span>Plan &amp; Access Status</span>
            </div>
            <div className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              100% FREE BETA
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.94rem', fontWeight: 800 }}>
              <span style={{ color: '#16A34A' }}>●</span>
              <span>Unlimited Free Access • 5 AI Credits / Day</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              Enjoy unrestricted canvas styling, 2x high-resolution PNG exports, and multimodal Gemini AI post generation.
              No credit card required.
            </p>
          </div>
        </section>

        {/* Card 3: Privacy-First 1-Click Social Sharing & Platform Guide */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Lock size={18} />
              <span>Zero-Storage Social Sharing</span>
            </div>
            <div className="badge-brutal badge-green" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              NO TOKENS STORED
            </div>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, lineHeight: 1.55 }}>
            MakeAPost never asks for or stores your social passwords, API keys, or OAuth tokens. Instead, it uses{' '}
            <strong>client-side web intents</strong>, your clipboard, and balanced 1600px PNG graphics so every post stays 100% under your control:
          </p>

          {/* Platform-by-Platform Guide Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '10px',
              marginTop: '4px',
            }}
          >
            {/* X (Twitter) Guide */}
            <div
              style={{
                padding: '12px',
                border: 'var(--border)',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.84rem', fontWeight: 800 }}>
                  <XIcon size={14} />
                  <span>X (Twitter)</span>
                </div>
                <span className="tag-mono" style={{ fontSize: '0.66rem' }}>TEXT + CTRL+V</span>
              </div>
              <p style={{ fontSize: '0.77rem', color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
                Opens X with your post text pre-filled and copies the screenshot to your clipboard. Press{' '}
                <strong>Ctrl + V</strong> in the composer to attach the image.
              </p>
            </div>

            {/* LinkedIn Guide */}
            <div
              style={{
                padding: '12px',
                border: 'var(--border)',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.84rem', fontWeight: 800 }}>
                  <LinkedInIcon size={14} />
                  <span>LinkedIn</span>
                </div>
                <span className="tag-mono" style={{ fontSize: '0.66rem' }}>TEXT + MEDIA</span>
              </div>
              <p style={{ fontSize: '0.77rem', color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
                Opens LinkedIn with pre-filled text and auto-downloads the graphic (LinkedIn web disables image paste). Click the{' '}
                <strong>Media / Photo icon</strong> to attach it.
              </p>
            </div>

            {/* Reddit Guide */}
            <div
              style={{
                padding: '12px',
                border: 'var(--border)',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '0.84rem', fontWeight: 800 }}>
                  <RedditIcon size={15} />
                  <span>Reddit</span>
                </div>
                <span className="tag-mono" style={{ fontSize: '0.66rem' }}>TEXT + CTRL+V</span>
              </div>
              <p style={{ fontSize: '0.77rem', color: 'var(--muted)', margin: 0, lineHeight: 1.45 }}>
                Opens Reddit with your title &amp; markdown body pre-filled and copies the image. Press{' '}
                <strong>Ctrl + V</strong> inside the body, choose a subreddit, and post.
              </p>
            </div>
          </div>

          {/* Mobile Native Share Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              border: '1.5px dashed var(--border-color)',
              backgroundColor: 'var(--card-bg-subtle)',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              color: 'var(--ink)',
            }}
          >
            <Smartphone size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-yellow)' }} />
            <div>
              <strong>Mobile (Android &amp; iOS):</strong> Tapping Post launches your phone&apos;s native Share Sheet,
              sending <strong>both the screenshot file and post text</strong> to X or Reddit, and automatically copies the text to your clipboard so if the LinkedIn app only imports the image, you can simply tap <strong>Paste</strong>.
            </div>
          </div>
        </section>

        {/* Card 4: Cross-Device Preferences (Synced to Supabase) */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Sparkles size={18} />
              <span>Cross-Device Studio Preferences</span>
            </div>
            <div className="tag-mono" style={{ fontSize: '0.72rem' }}>
              AUTO-SYNCED
            </div>
          </div>

          {/* Theme Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 800 }}>
              Theme Preference
            </label>
            <div className={styles.themeButtonGroup}>
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`btn-brutal ${styles.themeBtn} ${
                  theme === 'light' ? styles.themeBtnActive : ''
                }`}
              >
                <Sun size={16} />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`btn-brutal ${styles.themeBtn} ${
                  theme === 'dark' ? styles.themeBtnActive : ''
                }`}
              >
                <Moon size={16} />
                <span>Dark Mode</span>
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Saved to your PostgreSQL account profile and automatically synced across all your devices.
            </span>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'var(--ink)',
            color: 'var(--bg-primary)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            boxShadow: '4px 4px 0px var(--accent-yellow)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 100,
            maxWidth: '380px',
          }}
        >
          <Check size={16} style={{ color: 'var(--accent-yellow)', flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
