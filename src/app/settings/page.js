'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import UpgradeModal from '@/components/UpgradeModal';
import { XIcon, LinkedInIcon, RedditIcon } from '@/components/SocialIcons';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_WATERMARK_TEXT, enforceWatermarkForPlan, PLANS } from '@/lib/billing';
// [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: import { sanitizeProjectsList, MAX_SUMMARY_CHARS } from '@/lib/projectMemory';
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
  Tag,
  Save,
  EyeOff,
  CreditCard,
  Image as ImageIcon,
  ArrowRight,
  // FolderKanban,
  // Pencil,
  // Trash2,
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
  const [watermarkMode, setWatermarkMode] = useState('default'); // 'default' | 'custom' | 'none'
  const [customWatermarkText, setCustomWatermarkText] = useState('');
  const [savingWatermark, setSavingWatermark] = useState(false);
  const [usage, setUsage] = useState({
    planId: 'free',
    planName: 'Free',
    planStatus: 'active',
    currentPeriodEnd: null,
    hasBillingCustomer: false,
    imageCreditsUsed: 0,
    imageLimit: PLANS.free.dailyImages,
    aiCreditsUsed: { x: 0, linkedin: 0, reddit: 0 },
    aiLimitPerPlatform: PLANS.free.dailyAiPerPlatform,
  });
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({
    open: false,
    title: '',
    desc: '',
  });
  /* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Project Memory State
  const [projects, setProjects] = useState([]);
  const [editingSlug, setEditingSlug] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [projectSaving, setProjectSaving] = useState(false);
  */

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
          /* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]:
          if (Array.isArray(profileData.projects)) {
            setProjects(sanitizeProjectsList(profileData.projects));
          }
          */
          const activeTheme = profileData.theme === 'dark' ? 'dark' : 'light';
          setTheme(activeTheme);
          document.documentElement.setAttribute('data-theme', activeTheme);
          try {
            localStorage.setItem('makeapost-theme', activeTheme);
          } catch {}

          // Load Watermark Preference
          const savedMark = profileData.default_watermark;
          if (savedMark === 'none' || savedMark === 'hide') {
            setWatermarkMode('none');
            setCustomWatermarkText('');
          } else if (!savedMark || savedMark === 'made with makeapost.app') {
            setWatermarkMode('default');
            setCustomWatermarkText('');
          } else {
            setWatermarkMode('custom');
            setCustomWatermarkText(savedMark);
          }
          // Load live billing & usage status from server
          try {
            const usageRes = await fetch('/api/credits/status');
            if (usageRes.ok) {
              const usageData = await usageRes.json();
              if (usageData?.authenticated && isMounted) {
                setUsage({
                  planId: usageData.planId || 'free',
                  planName: usageData.planName || 'Free',
                  planStatus: usageData.planStatus || 'active',
                  currentPeriodEnd: usageData.currentPeriodEnd || null,
                  hasBillingCustomer: Boolean(usageData.hasBillingCustomer),
                  imageCreditsUsed: usageData.imageCreditsUsed || 0,
                  imageLimit: usageData.imageLimit || PLANS.free.dailyImages,
                  aiCreditsUsed: usageData.aiCreditsUsed || { x: 0, linkedin: 0, reddit: 0 },
                  aiLimitPerPlatform: usageData.aiLimitPerPlatform || PLANS.free.dailyAiPerPlatform,
                });
              }
            }
          } catch {}

          // Show success toast if redirected back from Dodo checkout
          if (typeof window !== 'undefined' && window.location.search.includes('billing=success')) {
            showToast('Subscription updated! Your new plan limits are active.');
          }
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

  // Handle Watermark Preference Save
  const handleSaveWatermark = async (e) => {
    e?.preventDefault();
    setSavingWatermark(true);
    try {
      let rawMark = DEFAULT_WATERMARK_TEXT;
      if (watermarkMode === 'none') {
        rawMark = 'none';
      } else if (watermarkMode === 'custom') {
        rawMark = customWatermarkText.trim() || DEFAULT_WATERMARK_TEXT;
      }

      const finalMark = enforceWatermarkForPlan(rawMark, usage.planId);

      if (user) {
        const supabase = createClient();
        const { error } = await supabase
          .from('users')
          .update({ default_watermark: finalMark })
          .eq('id', user.id);

        if (error) {
          const errorMsg = error?.message || error?.details || 'Database permission error';
          console.error('Failed to sync watermark to Supabase:', errorMsg, error);
          showToast(`Error: ${errorMsg}`);
          return;
        }
      }

      try {
        localStorage.setItem('makeapost-default-watermark', finalMark);
      } catch {}

      showToast('Watermark branding preference saved!');
    } catch (err) {
      console.error('Failed to save watermark:', err);
      showToast(`Error: ${err?.message || 'Failed to save watermark'}`);
    } finally {
      setSavingWatermark(false);
    }
  };

  // Open Dodo Customer Billing Portal
  const handleOpenBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data?.portalUrl) {
        throw new Error(data?.error || 'Could not open billing portal.');
      }
      window.location.href = data.portalUrl;
    } catch (err) {
      showToast(err?.message || 'Unable to open Dodo billing portal.');
    } finally {
      setPortalLoading(false);
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

  /* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Project Memory Handlers
  // Start Inline Project Edit
  const handleStartEditProject = (proj) => {
    setEditingSlug(proj.slug);
    setEditName(proj.name);
    setEditSummary(proj.summary);
  };

  // Save Edited Project Summary
  const handleSaveProject = async (slug) => {
    const trimmed = editSummary.trim();
    if (!trimmed) {
      showToast('Project summary cannot be empty.');
      return;
    }
    setProjectSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: editName.trim(),
          summary: trimmed.slice(0, MAX_SUMMARY_CHARS),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project');
      }
      setProjects(sanitizeProjectsList(data.projects));
      setEditingSlug(null);
      showToast('Project context updated!');
    } catch (err) {
      console.error('Save project error:', err);
      showToast(`Error: ${err.message || 'Could not update project'}`);
    } finally {
      setProjectSaving(false);
    }
  };

  // Delete Saved Project
  const handleDeleteProject = async (slug, name) => {
    setProjectSaving(true);
    try {
      const res = await fetch(`/api/projects?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete project');
      }
      setProjects(sanitizeProjectsList(data.projects));
      if (editingSlug === slug) setEditingSlug(null);
      showToast(`Removed "${name}" from memory`);
    } catch (err) {
      console.error('Delete project error:', err);
      showToast(`Error: ${err.message || 'Could not delete project'}`);
    } finally {
      setProjectSaving(false);
    }
  };
  */

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

        {/* Card 2: Plan, Billing & Daily Usage Limits */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Zap size={18} />
              <span>Plan &amp; Daily Usage</span>
            </div>
            <div
              className={`badge-brutal ${
                usage.planId === 'advanced'
                  ? 'badge-yellow'
                  : usage.planId === 'pro'
                  ? 'badge-blue'
                  : 'badge-green'
              }`}
              style={{ fontSize: '0.72rem', padding: '2px 10px' }}
            >
              {usage.planName.toUpperCase()} PLAN
            </div>
          </div>

          {/* Plan Summary & Subscription Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink)' }}>
              {usage.planId === 'free'
                ? 'Free Tier • 5 Image Edits & 2 AI Posts / Platform Daily'
                : usage.planId === 'pro'
                ? 'Pro Plan ($7/mo) • 30 Image Edits & 15 AI Posts / Platform Daily'
                : 'Advanced Plan ($15/mo) • 50 Image Edits & 20 AI Posts / Platform Daily'}
            </div>
            {usage.currentPeriodEnd && (
              <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
                {usage.planStatus === 'cancelled' ? 'Ends on ' : 'Renews '}
                {new Date(usage.currentPeriodEnd).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* 1. Image Editing Credits Meter */}
          <div
            style={{
              padding: '12px 14px',
              border: 'var(--border)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 800 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={15} />
                <span>Daily Image Editing Credits</span>
              </span>
              <span className="tag-mono" style={{ fontSize: '0.78rem' }}>
                {usage.imageCreditsUsed} / {usage.imageLimit} used today
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--card-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (usage.imageCreditsUsed / Math.max(1, usage.imageLimit)) * 100)}%`,
                  height: '100%',
                  backgroundColor: usage.imageCreditsUsed >= usage.imageLimit ? '#EF4444' : 'var(--accent-yellow)',
                  transition: 'width 0.25s ease',
                }}
              />
            </div>
          </div>

          {/* 2. Per-Platform AI Post Credits Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { id: 'x', label: 'X (Twitter)', Icon: XIcon },
              { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
              { id: 'reddit', label: 'Reddit', Icon: RedditIcon },
            ].map(({ id, label, Icon }) => {
              const used = usage.aiCreditsUsed?.[id] || 0;
              const limit = usage.aiLimitPerPlatform || 2;
              const pct = Math.min(100, (used / Math.max(1, limit)) * 100);
              return (
                <div
                  key={id}
                  style={{
                    padding: '12px',
                    border: 'var(--border)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={13} />
                      <span>{label}</span>
                    </span>
                    <span className="tag-mono" style={{ fontSize: '0.72rem' }}>
                      {used} / {limit}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--card-bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: used >= limit ? '#EF4444' : 'var(--accent-blue)',
                        transition: 'width 0.25s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Billing Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Daily credits reset automatically at 00:00 UTC.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {usage.planId !== 'advanced' && (
                <button
                  type="button"
                  onClick={() =>
                    setUpgradeModal({
                      open: true,
                      title: 'Upgrade Your MakeAPost Plan',
                      desc: 'Get up to 50 daily image edits, 20 AI posts per platform/day, Clean Exports, and Custom Brand Handles.',
                    })
                  }
                  className="btn-brutal btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.84rem', gap: '6px' }}
                >
                  <Sparkles size={14} />
                  <span>{usage.planId === 'pro' ? 'Upgrade to Advanced ($15/mo)' : 'Upgrade Plan'}</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {usage.hasBillingCustomer && (
                <button
                  type="button"
                  disabled={portalLoading}
                  onClick={handleOpenBillingPortal}
                  className="btn-brutal"
                  style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '6px', backgroundColor: 'var(--surface)' }}
                >
                  <CreditCard size={14} />
                  <span>{portalLoading ? 'Opening Portal...' : 'Manage / Cancel Subscription'}</span>
                </button>
              )}
            </div>
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

        {/* Card 5: Watermark & Brand Handle */}
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Tag size={18} />
              <span>Canvas Watermark &amp; Branding</span>
            </div>
            <div className="badge-brutal badge-yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {usage.planId === 'advanced'
                ? 'ADVANCED UNLOCKED'
                : usage.planId === 'pro'
                ? 'PRO TIER'
                : 'FREE TIER'}
            </div>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
            Configure how your graphics are branded when exported from MakeAPost. You can use our default badge, promote your own social handle or website, or export completely unbranded graphics.
          </p>

          {/* 3-Way Mode Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {/* Option 1: Default Watermark */}
            <div
              className="card-brutal"
              style={{
                padding: '14px',
                cursor: 'pointer',
                backgroundColor: watermarkMode === 'default' ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                color: watermarkMode === 'default' ? '#09090B' : 'var(--ink)',
                border: 'var(--border)',
                boxShadow: watermarkMode === 'default' ? '3px 3px 0px var(--shadow-color)' : '1.5px 1.5px 0px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setWatermarkMode('default')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.88rem' }}>
                  Default Badge
                </span>
                {watermarkMode === 'default' && <Check size={16} />}
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.85, lineHeight: 1.4 }}>
                Displays official &quot;made with makeapost.app&quot; badge pill.
              </span>
            </div>

            {/* Option 2: Custom Brand Handle (Advanced Only) */}
            <div
              className="card-brutal"
              style={{
                padding: '14px',
                cursor: 'pointer',
                backgroundColor: watermarkMode === 'custom' ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                color: watermarkMode === 'custom' ? '#09090B' : 'var(--ink)',
                border: 'var(--border)',
                boxShadow: watermarkMode === 'custom' ? '3px 3px 0px var(--shadow-color)' : '1.5px 1.5px 0px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.15s ease',
                opacity: usage.planId === 'advanced' ? 1 : 0.78,
              }}
              onClick={() => {
                if (usage.planId !== 'advanced') {
                  setUpgradeModal({
                    open: true,
                    title: 'Custom Brand Handle Requires Advanced',
                    desc: 'Promote your personal handle (@you) or startup domain on every exported image with the Advanced Plan ($15/mo).',
                  });
                  return;
                }
                setWatermarkMode('custom');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.88rem' }}>
                  Custom Brand Handle
                </span>
                {usage.planId !== 'advanced' ? (
                  <span className="badge-brutal badge-yellow" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                    <Lock size={10} />
                    <span>ADVANCED</span>
                  </span>
                ) : (
                  watermarkMode === 'custom' && <Check size={16} />
                )}
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.85, lineHeight: 1.4 }}>
                Promote your personal handle (e.g. @founder) or domain.
              </span>
            </div>

            {/* Option 3: Clean Export (Pro & Advanced) */}
            <div
              className="card-brutal"
              style={{
                padding: '14px',
                cursor: 'pointer',
                backgroundColor: watermarkMode === 'none' ? 'var(--accent-yellow)' : 'var(--bg-secondary)',
                color: watermarkMode === 'none' ? '#09090B' : 'var(--ink)',
                border: 'var(--border)',
                boxShadow: watermarkMode === 'none' ? '3px 3px 0px var(--shadow-color)' : '1.5px 1.5px 0px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.15s ease',
                opacity: usage.planId === 'free' ? 0.78 : 1,
              }}
              onClick={() => {
                if (usage.planId === 'free') {
                  setUpgradeModal({
                    open: true,
                    title: 'Hide Watermark Requires Pro or Advanced',
                    desc: 'Remove the MakeAPost watermark for clean, unbranded exports by upgrading to Pro ($7/mo) or Advanced ($15/mo).',
                  });
                  return;
                }
                setWatermarkMode('none');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.88rem' }}>
                  Hide Watermark (Clean)
                </span>
                {usage.planId === 'free' ? (
                  <span className="badge-brutal badge-blue" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                    <Lock size={10} />
                    <span>PRO+</span>
                  </span>
                ) : (
                  watermarkMode === 'none' && <Check size={16} />
                )}
              </div>
              <span style={{ fontSize: '0.74rem', opacity: 0.85, lineHeight: 1.4 }}>
                Export clean, unbranded graphics with zero watermark pills.
              </span>
            </div>
          </div>

          {/* Custom Handle Input (Visible when Custom is selected) */}
          {watermarkMode === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: '0.84rem', fontWeight: 800 }}>
                  Enter Your Custom Brand / Handle
                </label>
                <span className="tag-mono" style={{ fontSize: '0.68rem' }}>
                  {customWatermarkText.length} / 40
                </span>
              </div>
              <input
                type="text"
                className="input-brutal"
                placeholder="e.g. @adarshmishra or startup.dev"
                value={customWatermarkText}
                onChange={(e) => setCustomWatermarkText(e.target.value.slice(0, 40))}
                style={{ width: '100%', fontSize: '0.88rem', padding: '10px 14px' }}
                maxLength={40}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                Tip: Enter your Twitter/X handle, GitHub username, or project URL to turn every viral post into personal promotion.
              </span>
            </div>
          )}

          {/* Live Preview Box */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-xs)',
              border: '1.5px dashed var(--border-color)',
              backgroundColor: 'var(--card-bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.8rem', color: 'var(--ink)' }}>
                Live Canvas Badge Preview:
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                This is how the bottom-right watermark will render on your exported images.
              </span>
            </div>

            {/* Badge Render Simulation */}
            {watermarkMode === 'none' ? (
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1.5px dashed var(--border-color)',
                  color: 'var(--muted)',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <EyeOff size={14} />
                <span>Zero Watermark (Clean Export)</span>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: '#09090B',
                  border: '1.5px solid #FFD93D',
                  boxShadow: '2px 2px 0px #09090B',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  letterSpacing: '0.02em',
                }}
              >
                {watermarkMode === 'custom'
                  ? (customWatermarkText.trim() || '@yourhandle')
                  : 'made with makeapost.app'}
              </div>
            )}
          </div>

          {/* Action Row: Save Button & Future Billing Note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              disabled={savingWatermark}
              onClick={handleSaveWatermark}
              className="btn-brutal btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', gap: '6px' }}
            >
              <Save size={15} />
              <span>{savingWatermark ? 'Saving...' : 'Save Watermark Preference'}</span>
            </button>

            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.45, maxWidth: '420px' }}>
              <strong>Upcoming Billing Notice:</strong> Currently 100% free for Beta creators. When billing is enabled:
              Free Tier (Default Badge) • Pro Tier (Clean Export) • Advanced Tier (Custom Brand Handle).
            </div>
          </div>
        </section>

        {/* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Card 5: Auto-Learned Project Context (Max 5, Latest-First, 300-char crisp summary) */}
        {/*
        <section className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FolderKanban size={18} />
              <span>Auto-Learned Project Context</span>
            </div>
            <div className="badge-brutal badge-blue" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
              {projects.length} / 5 PROJECTS
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
            MakeAPost automatically remembers up to 300 characters per project as you generate posts—zero post history is ever stored.
          </p>

          {projects.length === 0 ? (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-xs)',
                border: '1.5px dashed var(--border-color)',
                backgroundColor: 'var(--card-bg-subtle)',
                fontSize: '0.8rem',
                color: 'var(--muted)',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              No projects learned yet. Generate an AI post about your product in the Studio and MakeAPost will automatically remember its context here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {projects.map((proj, idx) => {
                const isEditing = editingSlug === proj.slug;
                const formattedDate = proj.updatedAt
                  ? new Date(proj.updatedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={proj.slug}
                    style={{
                      padding: '12px 14px',
                      border: 'var(--border)',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.92rem', color: 'var(--ink)' }}>
                          {proj.name}
                        </span>
                        {idx === 0 && (
                          <span className="badge-brutal badge-yellow" style={{ fontSize: '0.65rem', padding: '1px 7px' }}>
                            LATEST
                          </span>
                        )}
                        {formattedDate && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                            Updated {formattedDate}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="tag-mono" style={{ fontSize: '0.68rem' }}>
                          {isEditing ? editSummary.length : proj.summary.length} / {MAX_SUMMARY_CHARS}
                        </span>
                        {!isEditing && (
                          <>
                            <button
                              type="button"
                              className="btn-brutal"
                              onClick={() => handleStartEditProject(proj)}
                              disabled={projectSaving}
                              style={{ padding: '4px 9px', fontSize: '0.74rem', gap: '4px', backgroundColor: 'var(--surface)' }}
                              title="Edit project context"
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn-brutal"
                              onClick={() => handleDeleteProject(proj.slug, proj.name)}
                              disabled={projectSaving}
                              style={{
                                padding: '4px 9px',
                                fontSize: '0.74rem',
                                gap: '4px',
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                borderColor: '#DC2626',
                              }}
                              title="Delete project from memory"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={editName}
                          maxLength={60}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Project name"
                          className="input-brutal"
                          style={{ fontSize: '0.82rem', padding: '6px 10px', fontWeight: 700 }}
                        />
                        <textarea
                          rows={3}
                          value={editSummary}
                          maxLength={MAX_SUMMARY_CHARS}
                          onChange={(e) => setEditSummary(e.target.value.slice(0, MAX_SUMMARY_CHARS))}
                          placeholder="Crisp summary up to 300 characters..."
                          className="input-brutal"
                          style={{ fontSize: '0.82rem', padding: '8px 10px', lineHeight: 1.45, resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-brutal"
                            onClick={() => setEditingSlug(null)}
                            disabled={projectSaving}
                            style={{ padding: '5px 12px', fontSize: '0.76rem', backgroundColor: 'var(--surface)' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn-brutal btn-primary"
                            onClick={() => handleSaveProject(proj.slug)}
                            disabled={projectSaving}
                            style={{ padding: '5px 14px', fontSize: '0.76rem', gap: '5px' }}
                          >
                            <Check size={13} />
                            <span>{projectSaving ? 'Saving...' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.82rem', color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
                        {proj.summary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
        */}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Upgrade Plan Modal */}
      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, title: '', desc: '' })}
        reasonTitle={upgradeModal.title}
        reasonDesc={upgradeModal.desc}
        currentPlanId={usage.planId}
      />

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
