'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GoogleIcon } from '@/components/NavbarAuth';
import { Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import styles from '@/app/page.module.css';

export default function LandingPricingSection() {
  const [statusLoading, setStatusLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planId, setPlanId] = useState('free');
  const [cycleDates, setCycleDates] = useState({ start: null, end: null });
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUserPlan() {
      try {
        const res = await fetch('/api/credits/status');
        const data = await res.json();
        if (!isMounted) return;
        if (data?.authenticated) {
          setIsAuthenticated(true);
          setPlanId(data.planId || 'free');
          setCycleDates({
            start: data.cycleStart || null,
            end: data.cycleEnd || null,
          });
        } else {
          setIsAuthenticated(false);
          setPlanId('free');
          setCycleDates({ start: null, end: null });
        }
      } catch {
      } finally {
        if (isMounted) setStatusLoading(false);
      }
    }

    loadUserPlan();

    let subscription = null;
    try {
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          loadUserPlan();
        } else {
          setIsAuthenticated(false);
          setPlanId('free');
        }
      });
      subscription = data?.subscription || null;
    } catch {}

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async (nextPath = '/editor') => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  };

  const handleUpgradeCheckout = async (targetPlan) => {
    if (!isAuthenticated) {
      await handleGoogleSignIn('/settings');
      return;
    }

    setCheckoutLoading(targetPlan);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data?.checkoutUrl) {
        throw new Error(data?.error || 'Could not start Dodo checkout.');
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to start checkout right now.');
      setCheckoutLoading(null);
    }
  };

  return (
    <div className={styles.pricingWrapper}>
      {errorMsg && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '2px solid #DC2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            color: '#DC2626',
            fontSize: '0.84rem',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div className={styles.pricingGrid}>
        {/* 1. Free Plan */}
        <div className={styles.pricingCard}>
          <div className={styles.compareCardHeader}>
            <span className={styles.pricingPlanTitle}>Free</span>
            {isAuthenticated && planId === 'free' ? (
              <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem' }}>
                CURRENT PLAN
              </span>
            ) : (
              <span className="badge-brutal badge-green" style={{ fontSize: '0.68rem' }}>
                START FREE
              </span>
            )}
          </div>

          <div className={styles.pricingPriceRow}>
            <div className={styles.pricingPrice}>
              $0<span className={styles.pricingPeriod}>/month</span>
            </div>
            <div className={styles.pricingMonthlyPill}>
              90 Edits + 90 AI Posts / mo
            </div>
            {isAuthenticated && planId === 'free' && cycleDates.end && (
              <div className={styles.pricingCycleNote}>
                Cycle: {cycleDates.start ? `${new Date(cycleDates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ` : ''}
                {new Date(cycleDates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • Auto-renews monthly
              </div>
            )}
          </div>

          <ul className={styles.privacyList}>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>90 Image Edits / month</strong> (3 edits / day)
              </span>
            </li>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>90 AI Posts / month</strong> (1 / platform / day across X, LinkedIn &amp; Reddit)
              </span>
            </li>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                Default <code className={styles.inlineCodeWrap}>made with makeapost.site</code> badge
              </span>
            </li>
          </ul>

          <div className={styles.pricingCtaSlot}>
            {statusLoading || !isAuthenticated ? (
              <button
                type="button"
                onClick={() => handleGoogleSignIn('/editor')}
                className={`btn-brutal ${styles.pricingCtaBtn}`}
              >
                <GoogleIcon size={15} />
                <span>Start Free with Google</span>
                <ArrowRight size={14} />
              </button>
            ) : planId === 'free' ? (
              <Link href="/editor" className={`btn-brutal btn-primary ${styles.pricingCtaBtn}`}>
                <Sparkles size={15} />
                <span>Open Studio</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link href="/editor" className={`btn-brutal ${styles.pricingCtaBtn}`}>
                <span>Included in Your Plan</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* 2. Pro Plan */}
        <div className={styles.pricingCard}>
          <div className={styles.compareCardHeader}>
            <span className={styles.pricingPlanTitle}>Pro</span>
            {isAuthenticated && planId === 'pro' ? (
              <span className="badge-brutal badge-blue" style={{ fontSize: '0.68rem' }}>
                CURRENT ACTIVE PLAN
              </span>
            ) : (
              <span className="badge-brutal badge-blue" style={{ fontSize: '0.68rem' }}>
                POPULAR
              </span>
            )}
          </div>

          <div className={styles.pricingPriceRow}>
            <div className={styles.pricingPrice}>
              $7<span className={styles.pricingPeriod}>/month</span>
            </div>
            <div className={styles.pricingMonthlyPill}>
              900 Edits + 900 AI Posts / mo
            </div>
          </div>

          <ul className={styles.privacyList}>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>900 Image Edits / month</strong> (30 edits / day)
              </span>
            </li>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>900 AI Posts / month</strong> (10 / platform / day across X, LinkedIn &amp; Reddit)
              </span>
            </li>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>Hide Watermark</strong> (Clean unbranded HD PNG exports)
              </span>
            </li>
          </ul>

          <div className={styles.pricingCtaSlot}>
            {isAuthenticated && planId === 'pro' ? (
              <Link href="/editor" className={`btn-brutal btn-secondary ${styles.pricingCtaBtn}`}>
                <Sparkles size={15} />
                <span>Open Studio (Active)</span>
                <ArrowRight size={14} />
              </Link>
            ) : isAuthenticated && planId === 'advanced' ? (
              <Link href="/editor" className={`btn-brutal ${styles.pricingCtaBtn}`}>
                <span>Included in Advanced</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                disabled={checkoutLoading !== null}
                onClick={() => handleUpgradeCheckout('pro')}
                className={`btn-brutal btn-secondary ${styles.pricingCtaBtn}`}
              >
                {checkoutLoading === 'pro' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Opening Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Upgrade for Powerful Experience — $7/mo</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 3. Advanced Plan */}
        <div className={styles.pricingCardFeatured}>
          <div className={styles.compareCardHeader}>
            <span className={styles.pricingPlanTitle}>Advanced</span>
            {isAuthenticated && planId === 'advanced' ? (
              <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem' }}>
                CURRENT ACTIVE PLAN
              </span>
            ) : (
              <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem' }}>
                CREATOR BRAND
              </span>
            )}
          </div>

          <div className={styles.pricingPriceRow}>
            <div className={styles.pricingPrice}>
              $15<span className={styles.pricingPeriod}>/month</span>
            </div>
            <div className={styles.pricingMonthlyPill}>
              1,500 Edits + 1,350 AI Posts / mo
            </div>
          </div>

          <ul className={styles.privacyList}>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>1,500 Image Edits / month</strong> (50 edits / day)
              </span>
            </li>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>1,350 AI Posts / month</strong> (15 / platform / day across X, LinkedIn &amp; Reddit)
              </span>
            </li>
            <li>
              <Check size={16} className={styles.privacyIconYes} />
              <span>
                <strong>Custom Brand Handle</strong> (@you / domain) + Clean Export
              </span>
            </li>
          </ul>

          <div className={styles.pricingCtaSlot}>
            {isAuthenticated && planId === 'advanced' ? (
              <Link href="/editor" className={`btn-brutal btn-primary ${styles.pricingCtaBtn}`}>
                <Sparkles size={15} />
                <span>Open Studio (Active)</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                disabled={checkoutLoading !== null}
                onClick={() => handleUpgradeCheckout('advanced')}
                className={`btn-brutal btn-primary ${styles.pricingCtaBtn}`}
              >
                {checkoutLoading === 'advanced' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Opening Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Upgrade for Powerful Experience — $15/mo</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
