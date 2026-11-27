import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getEffectivePlanId,
  getPlanConfig,
  normalizeDailyCredits,
  enforceWatermarkForPlan,
  getFreeCycleDates,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const admin = createAdminClient();
    const { data: userRow, error: dbError } = await admin
      .from('users')
      .select(
        'plan, plan_status, image_credits_used, ai_credits_used, last_credit_reset, current_period_end, billing_customer_id, default_watermark, created_at'
      )
      .eq('id', user.id)
      .single();

    if (dbError || !userRow) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const planId = getEffectivePlanId(userRow);
    const planConfig = getPlanConfig(planId);
    const normalized = normalizeDailyCredits(userRow);

    if (normalized.needsReset) {
      await admin
        .from('users')
        .update({
          image_credits_used: 0,
          ai_credits_used: { x: 0, linkedin: 0, reddit: 0 },
          last_credit_reset: normalized.today,
        })
        .eq('id', user.id);
    }

    const effectiveWatermark = enforceWatermarkForPlan(
      userRow.default_watermark,
      planId
    );

    const accountCreatedAt = userRow.created_at || user.created_at || new Date().toISOString();
    let cycleStart = null;
    let cycleEnd = null;
    if (planId === 'free') {
      const freeCycle = getFreeCycleDates(accountCreatedAt);
      cycleStart = freeCycle.cycleStart;
      cycleEnd = freeCycle.cycleEnd;
    } else if (userRow.current_period_end) {
      cycleEnd = userRow.current_period_end;
      const startDt = new Date(userRow.current_period_end);
      if (!Number.isNaN(startDt.getTime())) {
        startDt.setMonth(startDt.getMonth() - 1);
        cycleStart = startDt.toISOString();
      }
    }

    return NextResponse.json({
      authenticated: true,
      planId,
      planName: planConfig.name,
      planStatus: userRow.plan_status || 'active',
      currentPeriodEnd: userRow.current_period_end || null,
      cycleStart,
      cycleEnd,
      accountCreatedAt,
      hasBillingCustomer: Boolean(userRow.billing_customer_id),
      defaultWatermark: effectiveWatermark,
      imageCreditsUsed: normalized.imageCreditsUsed,
      imageLimit: planConfig.dailyImages,
      aiCreditsUsed: normalized.aiCreditsUsed,
      aiLimitPerPlatform: planConfig.dailyAiPerPlatform,
    });
  } catch (err) {
    console.error('Credits status error:', err);
    return NextResponse.json(
      { error: 'Failed to load usage credits.' },
      { status: 500 }
    );
  }
}
