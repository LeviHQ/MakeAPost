import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getEffectivePlanId,
  getPlanConfig,
  normalizeDailyCredits,
} from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: 'Please sign in with Google to upload and edit custom images.',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { data: userRow, error: dbError } = await admin
      .from('users')
      .select(
        'plan, plan_status, image_credits_used, ai_credits_used, last_credit_reset, current_period_end'
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

    if (normalized.imageCreditsUsed >= planConfig.dailyImages) {
      return NextResponse.json(
        {
          error: `Daily image editing limit (${planConfig.dailyImages}/day) reached for your ${planConfig.name} plan.`,
          code: 'IMAGE_LIMIT_REACHED',
          planId,
          used: normalized.imageCreditsUsed,
          limit: planConfig.dailyImages,
        },
        { status: 429 }
      );
    }

    const nextCount = normalized.imageCreditsUsed + 1;
    const updatePayload = {
      image_credits_used: nextCount,
      last_credit_reset: normalized.today,
    };
    if (normalized.needsReset) {
      updatePayload.ai_credits_used = { x: 0, linkedin: 0, reddit: 0 };
    }

    const { error: updateErr } = await admin
      .from('users')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateErr) {
      console.error('Failed to increment image credit:', updateErr);
      return NextResponse.json(
        { error: 'Could not update image usage credits.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      planId,
      imageCreditsUsed: nextCount,
      imageLimit: planConfig.dailyImages,
      remaining: Math.max(0, planConfig.dailyImages - nextCount),
    });
  } catch (err) {
    console.error('Image credit endpoint error:', err);
    return NextResponse.json(
      { error: 'Internal server error verifying image credit.' },
      { status: 500 }
    );
  }
}
