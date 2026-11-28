import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getEffectivePlanId,
  getPlanConfig,
  normalizeDailyCredits,
  enforceWatermarkForPlan,
  getFreeCycleDates,
  DEFAULT_WATERMARK_TEXT,
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

    let userRow = null;
    try {
      const admin = createAdminClient();
      const { data: existingRow } = await admin
        .from('users')
        .select(
          'plan, plan_status, image_credits_used, ai_credits_used, last_credit_reset, current_period_end, billing_customer_id, default_watermark, created_at'
        )
        .eq('id', user.id)
        .single();

      if (existingRow) {
        userRow = existingRow;
      } else {
        // Auto-provision public.users row if missing for an authenticated Google user
        const { data: insertedRow } = await admin
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
              theme: 'light',
              default_watermark: DEFAULT_WATERMARK_TEXT,
              plan: 'free',
              plan_status: 'active',
            },
            { onConflict: 'id' }
          )
          .select(
            'plan, plan_status, image_credits_used, ai_credits_used, last_credit_reset, current_period_end, billing_customer_id, default_watermark, created_at'
          )
          .single();
        userRow = insertedRow || null;
      }

      if (userRow) {
        const normalizedCheck = normalizeDailyCredits(userRow);
        if (normalizedCheck.needsReset) {
          await admin
            .from('users')
            .update({
              image_credits_used: 0,
              ai_credits_used: { x: 0, linkedin: 0, reddit: 0 },
              last_credit_reset: normalizedCheck.today,
            })
            .eq('id', user.id);
        }
      }
    } catch (adminErr) {
      console.warn('Admin client fallback in /api/credits/status:', adminErr?.message || adminErr);
      // Fallback to user-scoped RLS client if service role key is missing
      const { data: rlsRow } = await supabase
        .from('users')
        .select(
          'plan, plan_status, image_credits_used, ai_credits_used, last_credit_reset, current_period_end, billing_customer_id, default_watermark, created_at'
        )
        .eq('id', user.id)
        .single();
      userRow = rlsRow || null;
    }

    const planId = getEffectivePlanId(userRow);
    const planConfig = getPlanConfig(planId);
    const normalized = normalizeDailyCredits(userRow);

    const effectiveWatermark = enforceWatermarkForPlan(
      userRow?.default_watermark || DEFAULT_WATERMARK_TEXT,
      planId
    );

    const accountCreatedAt = userRow?.created_at || user.created_at || new Date().toISOString();
    let cycleStart = null;
    let cycleEnd = null;
    if (planId === 'free') {
      const freeCycle = getFreeCycleDates(accountCreatedAt);
      cycleStart = freeCycle.cycleStart;
      cycleEnd = freeCycle.cycleEnd;
    } else if (userRow?.current_period_end) {
      cycleEnd = userRow.current_period_end;
      const startDt = new Date(userRow.current_period_end);
      if (!Number.isNaN(startDt.getTime())) {
        startDt.setMonth(startDt.getMonth() - 1);
        cycleStart = startDt.toISOString();
      }
    }

    let byokRow = null;
    if (planId === 'advanced') {
      try {
        const admin = createAdminClient();
        const { data: keyData } = await admin
          .from('users')
          .select('use_custom_gemini_key, custom_gemini_api_key')
          .eq('id', user.id)
          .single();
        byokRow = keyData || null;
      } catch {}
    }

    const hasCustomGeminiKey = Boolean(byokRow?.custom_gemini_api_key?.trim());
    const useCustomGeminiKey =
      planId === 'advanced' && Boolean(byokRow?.use_custom_gemini_key) && hasCustomGeminiKey;

    return NextResponse.json({
      authenticated: true,
      planId,
      planName: planConfig.name,
      planStatus: userRow?.plan_status || 'active',
      currentPeriodEnd: userRow?.current_period_end || null,
      cycleStart,
      cycleEnd,
      accountCreatedAt,
      hasBillingCustomer: Boolean(userRow?.billing_customer_id),
      defaultWatermark: effectiveWatermark,
      useCustomGeminiKey,
      hasCustomGeminiKey,
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
