import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEffectivePlanId } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function maskApiKey(key) {
  if (!key || typeof key !== 'string') return null;
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  return `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`;
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: userRow, error: fetchErr } = await admin
      .from('users')
      .select('plan, plan_status, current_period_end, custom_gemini_api_key, use_custom_gemini_key')
      .eq('id', user.id)
      .single();

    if (fetchErr || !userRow) {
      return NextResponse.json({ error: 'Account profile not found.' }, { status: 404 });
    }

    const planId = getEffectivePlanId(userRow);
    const canUseCustomKey = planId === 'advanced';
    const hasCustomKey = Boolean(userRow.custom_gemini_api_key?.trim());

    return NextResponse.json({
      canUseCustomKey,
      useCustomGeminiKey: canUseCustomKey && Boolean(userRow.use_custom_gemini_key) && hasCustomKey,
      hasCustomKey,
      maskedKey: maskApiKey(userRow.custom_gemini_api_key),
    });
  } catch (err) {
    console.error('BYOK GET error:', err);
    return NextResponse.json({ error: 'Failed to load API key settings.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const mode = body?.mode === 'custom' ? 'custom' : body?.mode === 'default' ? 'default' : null;
    const rawKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    const clearKey = Boolean(body?.clearKey);

    if (!mode) {
      return NextResponse.json({ error: 'Invalid mode. Choose default or custom.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: userRow, error: fetchErr } = await admin
      .from('users')
      .select('plan, plan_status, current_period_end, custom_gemini_api_key, use_custom_gemini_key')
      .eq('id', user.id)
      .single();

    if (fetchErr || !userRow) {
      return NextResponse.json({ error: 'Account profile not found.' }, { status: 404 });
    }

    const planId = getEffectivePlanId(userRow);

    if (mode === 'default') {
      const updates = {
        use_custom_gemini_key: false,
        ...(clearKey ? { custom_gemini_api_key: null } : {}),
      };
      const { error: updateErr } = await admin.from('users').update(updates).eq('id', user.id);
      if (updateErr) {
        return NextResponse.json({ error: 'Failed to switch to default key.' }, { status: 500 });
      }

      const nextSavedKey = clearKey ? null : userRow.custom_gemini_api_key;
      return NextResponse.json({
        success: true,
        canUseCustomKey: planId === 'advanced',
        useCustomGeminiKey: false,
        hasCustomKey: Boolean(nextSavedKey?.trim()),
        maskedKey: maskApiKey(nextSavedKey),
      });
    }

    // mode === 'custom' (Strict Advanced Plan Gate)
    if (planId !== 'advanced') {
      return NextResponse.json(
        {
          error: 'Custom Gemini API Key (BYOK) is exclusively available on the Advanced Plan ($15/mo).',
          code: 'ADVANCED_REQUIRED',
        },
        { status: 403 }
      );
    }

    let keyToUse = userRow.custom_gemini_api_key?.trim() || '';
    if (rawKey) {
      if (rawKey.length < 20 || /\s/.test(rawKey)) {
        return NextResponse.json(
          { error: 'Please enter a valid Google Gemini API key (at least 20 characters, no spaces).' },
          { status: 400 }
        );
      }
      keyToUse = rawKey;
    }

    if (!keyToUse) {
      return NextResponse.json(
        { error: 'Please enter your Google Gemini API key before enabling Custom Key mode.' },
        { status: 400 }
      );
    }

    const { error: updateErr } = await admin
      .from('users')
      .update({
        custom_gemini_api_key: keyToUse,
        use_custom_gemini_key: true,
      })
      .eq('id', user.id);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to save custom Gemini API key.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      canUseCustomKey: true,
      useCustomGeminiKey: true,
      hasCustomKey: true,
      maskedKey: maskApiKey(keyToUse),
    });
  } catch (err) {
    console.error('BYOK POST error:', err);
    return NextResponse.json({ error: 'Failed to update API key settings.' }, { status: 500 });
  }
}
