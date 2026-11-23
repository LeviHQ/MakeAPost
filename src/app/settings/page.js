'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ArrowLeft,
  Home,
  Menu,
  X,
  Share2,
  ExternalLink,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import styles from './settings.module.css';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Social Connections State
  const [connections, setConnections] = useState({
    linkedin: { connected: false, username: null },
    x: { connected: false, username: null },
    reddit: { connected: false, comingSoon: true },
  });
  const [disconnectingPlatform, setDisconnectingPlatform] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check URL query parameters for connection notifications
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected === 'linkedin') {
      showToast('LinkedIn account connected successfully! 🚀');
    } else if (connected === 'x') {
      showToast('X (Twitter) account connected successfully! 🚀');
    } else if (error) {
      showToast(`Connection alert: ${error}`);
    }
  }, [searchParams]);

  // Load user profile & social connections
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

        // 1. Fetch profile from Supabase
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

        // 2. Fetch Social Connections Status
        const connRes = await fetch('/api/connect/status');
        if (connRes.ok && isMounted) {
          const connData = await connRes.json();
          if (connData?.connections) {
            setConnections(connData.connections);
          }
        }
      } catch (err) {
        console.error('Failed to load settings data:', err);
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

  // Handle Disconnect Social Account
  const handleDisconnect = async (platform) => {
    setDisconnectingPlatform(platform);
    try {
      const res = await fetch(`/api/connect/${platform}/disconnect`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setConnections((prev) => ({
          ...prev,
          [platform]: { connected: false, username: null },
        }));
        showToast(`Disconnected ${platform.toUpperCase()} account successfully.`);
      } else {
        showToast(data.error || 'Failed to disconnect account.');
      }
    } catch (err) {
      console.error('Disconnect error:', err);
      showToast('Network error while disconnecting account.');
    } finally {
      setDisconnectingPlatform(null);
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
            Manage your connected social accounts, profile, and cross-device design preferences.
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

        {/* Card 2: Connected Social Accounts (Direct 1-Click Publishing) */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Share2 size={18} />
              <span>Connected Social Accounts</span>
            </div>
            <div className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              DIRECT 1-CLICK PUBLISH
            </div>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
            Connect your personal social accounts to publish screenshots and AI-crafted copy directly from the MakeAPost studio in one click.
            OAuth tokens are encrypted with <strong>AES-256-GCM</strong> and used strictly when you click &quot;Publish&quot;.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* LinkedIn Account Row */}
            <div className={styles.socialRow}>
              <div className={styles.socialLeft}>
                <div className={styles.socialIconWrapper} style={{ backgroundColor: '#0077B5', color: '#FFFFFF' }}>
                  <LinkedInIcon size={20} />
                </div>
                <div className={styles.socialInfo}>
                  <div className={styles.socialName}>
                    <span>LinkedIn</span>
                    {connections.linkedin.connected ? (
                      <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem', padding: '1px 8px', border: '1.5px solid var(--border-color)' }}>
                        ● Connected
                      </span>
                    ) : (
                      <span className="badge-brutal" style={{ fontSize: '0.68rem', padding: '1px 8px', backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1.5px solid var(--border-color)' }}>
                        Not Connected
                      </span>
                    )}
                  </div>
                  <div className={styles.socialSubtext}>
                    {connections.linkedin.connected
                      ? `Connected as ${connections.linkedin.username}`
                      : 'Publish graphics and thought leadership commentary directly to your LinkedIn personal feed.'}
                  </div>
                </div>
              </div>

              <div className={styles.socialAction}>
                {connections.linkedin.connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect('linkedin')}
                    disabled={disconnectingPlatform === 'linkedin'}
                    className="btn-brutal"
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.82rem',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      borderColor: '#DC2626',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>{disconnectingPlatform === 'linkedin' ? 'Disconnecting...' : 'Disconnect'}</span>
                  </button>
                ) : (
                  <a
                    href="/api/connect/linkedin"
                    className="btn-brutal btn-primary"
                    style={{
                      padding: '7px 16px',
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <LinkedInIcon size={14} />
                    <span>Connect LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* X (Twitter) Account Row */}
            <div className={styles.socialRow}>
              <div className={styles.socialLeft}>
                <div className={styles.socialIconWrapper} style={{ backgroundColor: '#09090B', color: '#FFFFFF' }}>
                  <XIcon size={18} />
                </div>
                <div className={styles.socialInfo}>
                  <div className={styles.socialName}>
                    <span>X (Twitter)</span>
                    {connections.x.connected ? (
                      <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem', padding: '1px 8px', border: '1.5px solid var(--border-color)' }}>
                        ● Connected
                      </span>
                    ) : (
                      <span className="badge-brutal" style={{ fontSize: '0.68rem', padding: '1px 8px', backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1.5px solid var(--border-color)' }}>
                        Not Connected
                      </span>
                    )}
                  </div>
                  <div className={styles.socialSubtext}>
                    {connections.x.connected
                      ? `Connected as ${connections.x.username}`
                      : 'Publish viral tweets and threads with attached screenshot in 1 click via official X API.'}
                  </div>
                </div>
              </div>

              <div className={styles.socialAction}>
                {connections.x.connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect('x')}
                    disabled={disconnectingPlatform === 'x'}
                    className="btn-brutal"
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.82rem',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      borderColor: '#DC2626',
                      gap: '6px',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>{disconnectingPlatform === 'x' ? 'Disconnecting...' : 'Disconnect'}</span>
                  </button>
                ) : (
                  <a
                    href="/api/connect/x"
                    className="btn-brutal btn-primary"
                    style={{
                      padding: '7px 16px',
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <XIcon size={13} />
                    <span>Connect X</span>
                  </a>
                )}
              </div>
            </div>

            {/* Reddit Account Row (Coming Soon) */}
            <div className={styles.socialRow} style={{ opacity: 0.85 }}>
              <div className={styles.socialLeft}>
                <div className={styles.socialIconWrapper} style={{ backgroundColor: '#FF4500', color: '#FFFFFF' }}>
                  <RedditIcon size={20} />
                </div>
                <div className={styles.socialInfo}>
                  <div className={styles.socialName}>
                    <span>Reddit</span>
                    <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                      COMING SOON
                    </span>
                  </div>
                  <div className={styles.socialSubtext}>
                    Direct 1-click publishing to Reddit communities with flair tags is in active development.
                    AI post generation and manual copy remain 100% active.
                  </div>
                </div>
              </div>

              <div className={styles.socialAction}>
                <button
                  type="button"
                  disabled
                  className="btn-brutal"
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    opacity: 0.6,
                    cursor: 'not-allowed',
                    gap: '6px',
                  }}
                >
                  <Clock size={13} />
                  <span>Coming Soon</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Card 3: Cross-Device Preferences (Synced to Supabase) */}
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

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <div className="badge-brutal badge-yellow" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
            <Sparkles size={16} />
            <span>Loading Settings...</span>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
