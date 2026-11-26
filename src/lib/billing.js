// MakeAPost — Central Billing, Plan Limits & Credit Normalization Rules

export const DEFAULT_WATERMARK_TEXT = 'made with makeapost.site';

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    dailyImages: 5,
    dailyAiPerPlatform: 2,
    canHideWatermark: false,
    canCustomWatermark: false,
    badgeLabel: 'FREE',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 7,
    dailyImages: 30,
    dailyAiPerPlatform: 15,
    canHideWatermark: true,
    canCustomWatermark: false,
    badgeLabel: 'PRO',
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced',
    priceMonthly: 15,
    dailyImages: 50,
    dailyAiPerPlatform: 20,
    canHideWatermark: true,
    canCustomWatermark: true,
    badgeLabel: 'ADVANCED',
  },
};

export function getTodayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resolves the user's effective active plan ('free' | 'pro' | 'advanced').
 * Cancelled subscriptions retain paid tier access until current_period_end passes.
 */
export function getEffectivePlanId(userRow) {
  if (!userRow) return 'free';
  const rawPlan = userRow.plan;
  if (rawPlan !== 'pro' && rawPlan !== 'advanced') return 'free';

  const status = userRow.plan_status || 'active';
  if (status === 'active') return rawPlan;

  if (status === 'cancelled' && userRow.current_period_end) {
    const endMs = new Date(userRow.current_period_end).getTime();
    if (!Number.isNaN(endMs) && endMs > Date.now()) {
      return rawPlan;
    }
  }

  return 'free';
}

export function getPlanConfig(planId) {
  return PLANS[planId] || PLANS.free;
}

/**
 * Normalizes daily image & per-platform AI credits, resetting if last_credit_reset !== today.
 */
export function normalizeDailyCredits(userRow) {
  const today = getTodayUtcDate();
  const lastReset = userRow?.last_credit_reset
    ? String(userRow.last_credit_reset).slice(0, 10)
    : null;

  if (lastReset !== today) {
    return {
      today,
      needsReset: true,
      imageCreditsUsed: 0,
      aiCreditsUsed: { x: 0, linkedin: 0, reddit: 0 },
    };
  }

  const rawAi = userRow?.ai_credits_used && typeof userRow.ai_credits_used === 'object'
    ? userRow.ai_credits_used
    : {};

  return {
    today,
    needsReset: false,
    imageCreditsUsed: Math.max(0, Number(userRow?.image_credits_used || 0)),
    aiCreditsUsed: {
      x: Math.max(0, Number(rawAi.x || 0)),
      linkedin: Math.max(0, Number(rawAi.linkedin || 0)),
      reddit: Math.max(0, Number(rawAi.reddit || 0)),
    },
  };
}

/**
 * Enforces watermark permissions based on the user's plan.
 * - free: locked to DEFAULT_WATERMARK_TEXT
 * - pro: allows DEFAULT_WATERMARK_TEXT or 'none'
 * - advanced: allows DEFAULT_WATERMARK_TEXT, 'none', or custom brand handle (<= 40 chars)
 */
export function enforceWatermarkForPlan(watermark, planId) {
  const clean = typeof watermark === 'string' ? watermark.trim().slice(0, 40) : DEFAULT_WATERMARK_TEXT;

  if (planId === 'free') {
    return DEFAULT_WATERMARK_TEXT;
  }

  if (planId === 'pro') {
    if (clean === 'none' || clean === 'hide' || clean === '') {
      return 'none';
    }
    return DEFAULT_WATERMARK_TEXT;
  }

  // advanced
  if (clean === 'none' || clean === 'hide' || clean === '') {
    return 'none';
  }
  return clean || DEFAULT_WATERMARK_TEXT;
}
