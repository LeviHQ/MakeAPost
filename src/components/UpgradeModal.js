'use client';

import { useState } from 'react';
import { Sparkles, Check, X, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { PLANS } from '@/lib/billing';

export default function UpgradeModal({
  isOpen,
  onClose,
  reasonTitle = 'Unlock More Power',
  reasonDesc = 'Upgrade your MakeAPost plan to unlock higher daily limits and custom branding.',
  currentPlanId = 'free',
  plansToShow = ['pro', 'advanced'],
}) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const showPro = plansToShow.includes('pro');
  const showAdvanced = plansToShow.includes('advanced');

  const handleCheckout = async (planId) => {
    setLoadingPlan(planId);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.checkoutUrl) {
        throw new Error(data?.error || 'Could not start checkout.');
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to start Dodo checkout.');
      setLoadingPlan(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="card-brutal"
        style={{
          maxWidth: plansToShow.length === 1 ? '460px' : '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: 'var(--surface)',
          color: 'var(--ink)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div className="badge-brutal badge-yellow" style={{ fontSize: '0.76rem' }}>
            <Sparkles size={13} />
            <span>UPGRADE MAKEAPOST</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-brutal"
            style={{ padding: '4px 8px' }}
            aria-label="Close upgrade modal"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>
            {reasonTitle}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.5 }}>
            {reasonDesc}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid #DC2626',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#DC2626',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Pro & Advanced Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* PRO PLAN */}
          {showPro && (
          <div
            className="card-brutal"
            style={{
              padding: '18px',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem' }}>
                Pro Plan
              </span>
              <span className="badge-brutal badge-blue" style={{ fontSize: '0.68rem' }}>
                POPULAR
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 900 }}>
              ${PLANS.pro.priceMonthly}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span><strong>900 Image Edits / month</strong> (30 / day)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span><strong>900 AI Posts / month</strong> (10 per platform / day)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span><strong>Hide Watermark</strong> (Clean Exports)</span>
              </li>
            </ul>
            <button
              type="button"
              disabled={loadingPlan !== null || currentPlanId === 'pro' || currentPlanId === 'advanced'}
              onClick={() => handleCheckout('pro')}
              className="btn-brutal btn-secondary"
              style={{ marginTop: 'auto', width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
            >
              {loadingPlan === 'pro' ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Redirecting to Dodo...</span>
                </>
              ) : currentPlanId === 'pro' ? (
                <span>Current Active Plan</span>
              ) : currentPlanId === 'advanced' ? (
                <span>Included in Advanced</span>
              ) : (
                <>
                  <span>Upgrade to Pro — $7/mo</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
          )}

          {/* ADVANCED PLAN */}
          {showAdvanced && (
          <div
            className="card-brutal"
            style={{
              padding: '18px',
              backgroundColor: 'var(--bg-secondary)',
              border: '3px solid var(--border-color)',
              boxShadow: '5px 5px 0px var(--accent-yellow)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem' }}>
                Advanced Plan
              </span>
              <span className="badge-brutal badge-yellow" style={{ fontSize: '0.68rem' }}>
                CREATOR BRAND
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', fontWeight: 900 }}>
              ${PLANS.advanced.priceMonthly}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span><strong>1,500 Image Edits / month</strong> (50 / day)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span><strong>1,350 AI Posts / month</strong> (15 per platform / day)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span><strong>Custom Brand Handle</strong> (@you / domain) + Clean Export</span>
              </li>
            </ul>
            <button
              type="button"
              disabled={loadingPlan !== null || currentPlanId === 'advanced'}
              onClick={() => handleCheckout('advanced')}
              className="btn-brutal btn-primary"
              style={{ marginTop: 'auto', width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
            >
              {loadingPlan === 'advanced' ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Redirecting to Dodo...</span>
                </>
              ) : currentPlanId === 'advanced' ? (
                <span>Current Active Plan</span>
              ) : (
                <>
                  <span>Upgrade to Advanced — $15/mo</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--muted)' }}>
          <ShieldCheck size={14} />
          <span>Secure monthly checkout powered by Dodo Payments</span>
        </div>
      </div>
    </div>
  );
}
