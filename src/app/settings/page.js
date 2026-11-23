'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Zap,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Save,
  Check,
  ShieldCheck,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingWatermark, setSavingWatermark] = useState(false);
  const [watermark, setWatermark] = useState('');
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState(null);
  const [showProModal, setShowProModal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (!user) {
          router.push('/?auth_required=true');
          return;
        }

        setUser(user);

        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData && isMounted) {
          setProfile(profileData);
          setTheme(profileData.theme || 'light');
          setWatermark(profileData.default_watermark || '');
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

    showToast(`Theme updated to ${newTheme} mode`);

    try {
      const supabase = createClient();
      await supabase
        .from('users')
        .update({ theme: newTheme })
        .eq('id', user.id);
    } catch (err) {
      console.error('Failed to sync theme to Supabase:', err);
    }
  };

  // Handle Watermark Save
  const handleSaveWatermark = async (e) => {
    e?.preventDefault();
    setSavingWatermark(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({ default_watermark: watermark.trim() })
        .eq('id', user.id);

      if (error) throw error;

      try {
        localStorage.setItem('makeapost-default-watermark', watermark.trim());
      } catch {}

      showToast('Default watermark saved successfully!');
    } catch (err) {
      console.error('Failed to save watermark:', err);
      showToast('Error saving watermark. Please retry.');
    } finally {
      setSavingWatermark(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.settingsContainer} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="badge-brutal badge-yellow" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
          <Sparkles size={16} />
          <span>Loading Account &amp; Settings...</span>
        </div>
      </div>
    );
  }

  // Calculate Subscription & Credit Metrics
  const plan = profile?.plan || 'trial';
  const dailyCreditsUsed = profile?.daily_credits_used || 0;
  const isPro = plan === 'pro';
  const isExpired = plan === 'expired';

  const maxDaily = isPro ? 40 : 5;
  const creditsRemaining = Math.max(0, maxDaily - dailyCreditsUsed);
  const percentUsed = Math.min(100, Math.round((dailyCreditsUsed / maxDaily) * 100));

  // Time remaining on trial
  let trialRemainingText = '3 Days';
  if (profile?.trial_ends_at) {
    const msLeft = new Date(profile.trial_ends_at) - new Date();
    if (msLeft <= 0) {
      trialRemainingText = 'Expired';
    } else {
      const hours = Math.floor(msLeft / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days >= 1) {
        trialRemainingText = `${days} day${days > 1 ? 's' : ''} left`;
      } else {
        trialRemainingText = `${hours} hour${hours > 1 ? 's' : ''} left`;
      }
    }
  }

  return (
    <div className={styles.settingsContainer}>
      {/* Top Header */}
      <header className={styles.settingsHeader}>
        <div className={styles.headerInner}>
          <Logo size={36} />

          <div className={styles.headerRight}>
            <Link
              href="/editor"
              className="btn-brutal btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Settings Canvas */}
      <main className={styles.mainContent}>
        {/* Title */}
        <div className={styles.pageHeading}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Account &amp; Settings</h1>
            <div className="badge-brutal badge-blue" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={13} />
              <span>PostgreSQL Synced</span>
            </div>
          </div>
          <p className={styles.pageSubtitle}>
            Manage your profile, cross-device design preferences, and daily AI post credits.
          </p>
        </div>

        {/* Card 1: Profile Card */}
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
                fontSize: '0.8rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                borderColor: '#EF4444',
              }}
              title="Sign out of your MakeAPost account"
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

        {/* Card 2: Subscription & Daily Credits */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Zap size={18} />
              <span>Subscription &amp; Daily AI Credits</span>
            </div>

            <div
              className={`badge-brutal ${
                isPro ? 'badge-blue' : isExpired ? '' : 'badge-yellow'
              }`}
              style={{
                fontSize: '0.78rem',
                ...(isExpired
                  ? {
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#EF4444',
                      borderColor: '#EF4444',
                    }
                  : {}),
              }}
            >
              {isPro ? 'PRO PLAN (ACTIVE)' : isExpired ? 'TRIAL EXPIRED' : '3-DAY FREE TRIAL'}
            </div>
          </div>

          <div className={styles.metricGrid}>
            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Daily Credits Remaining</span>
              <div className={styles.metricValue}>
                <Zap size={20} style={{ color: 'var(--accent-yellow)' }} />
                <span>{creditsRemaining} / {maxDaily}</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                Resets daily at midnight (00:00 UTC)
              </span>
            </div>

            <div className={styles.metricBox}>
              <span className={styles.metricLabel}>Trial Status</span>
              <div className={styles.metricValue}>
                <Clock size={20} style={{ color: 'var(--accent-blue)' }} />
                <span>{isPro ? 'Unlimited' : trialRemainingText}</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                {isPro ? 'Pro membership active' : 'No credit card required for trial'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '6px',
              }}
            >
              <span>Daily AI Generation Usage</span>
              <span>{dailyCreditsUsed} of {maxDaily} used ({percentUsed}%)</span>
            </div>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${percentUsed}%`,
                  backgroundColor: percentUsed >= 100 ? '#EF4444' : 'var(--accent-yellow)',
                }}
              />
            </div>
          </div>

          {/* Upgrade CTA */}
          {!isPro && (
            <div
              style={{
                backgroundColor: 'var(--card-bg-subtle)',
                border: '1.5px dashed var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                  Need more daily multimodal generations?
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Upgrade to MakeAPost Pro for 40 AI posts / day + priority Gemini quota.
                </div>
              </div>

              <button
                type="button"
                className="btn-brutal btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setShowProModal(true)}
              >
                <Sparkles size={14} />
                <span>Upgrade to Pro</span>
              </button>
            </div>
          )}
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

          {/* 1. Theme Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          </div>

          {/* 2. Default Watermark Handle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 800 }}>
              Default Watermark Handle
            </label>
            <form onSubmit={handleSaveWatermark} className={styles.watermarkForm}>
              <input
                type="text"
                className="input-brutal"
                placeholder="e.g. @adarshmishra or yoursite.com"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={savingWatermark}
                className="btn-brutal btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
              >
                {savingWatermark ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Preference</span>
                  </>
                )}
              </button>
            </form>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Saved to your PostgreSQL account profile and pre-fills your watermark in the image editor.
            </span>
          </div>
        </section>
      </main>

      {/* Pro Modal */}
      {showProModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setShowProModal(false)}
        >
          <div
            className="card-brutal"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              backgroundColor: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="badge-brutal badge-yellow" style={{ fontSize: '0.8rem' }}>
                <Sparkles size={14} />
                <span>MAKEAPOST PRO</span>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="btn-brutal"
                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900 }}>
              Supercharge Your Social Reach
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                <span><strong>40 AI post generations</strong> per day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                <span>Priority multimodal vision pipeline</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                <span>Zero wait times &amp; extended token limits</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                <span>100% Stateless &amp; Private</span>
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--card-bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Phase 5 Beta: Pro upgrades will open alongside Stripe checkout integration!
            </div>

            <button
              type="button"
              className="btn-brutal btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              onClick={() => {
                setShowProModal(false);
                showToast('Thanks for your interest in Pro! Checkout integration coming soon.');
              }}
            >
              <span>Got It</span>
            </button>
          </div>
        </div>
      )}

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
          }}
        >
          <Check size={16} style={{ color: 'var(--accent-yellow)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
