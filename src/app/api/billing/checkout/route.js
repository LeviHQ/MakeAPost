import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getDodoBaseUrl() {
  return process.env.DODO_PAYMENTS_ENV === 'live_mode'
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com';
}

function getAppUrl(req) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, '');
  }
  const origin = req.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  return 'https://makeapost.site';
}

export async function POST(req) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in with Google before upgrading.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const targetPlan = body?.plan === 'advanced' ? 'advanced' : body?.plan === 'pro' ? 'pro' : null;

    if (!targetPlan) {
      return NextResponse.json(
        { error: 'Invalid plan selected. Choose pro or advanced.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const productId =
      targetPlan === 'advanced'
        ? process.env.DODO_PRODUCT_ADVANCED_ID
        : process.env.DODO_PRODUCT_PRO_ID;

    if (!apiKey || !productId) {
      return NextResponse.json(
        {
          error:
            'Dodo Payments is not configured yet. Please set DODO_PAYMENTS_API_KEY and product IDs in environment variables.',
          code: 'BILLING_NOT_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const appUrl = getAppUrl(req);
    const response = await fetch(`${getDodoBaseUrl()}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'MakeAPost Creator',
        },
        metadata: {
          user_id: user.id,
          target_plan: targetPlan,
        },
        return_url: `${appUrl}/settings?billing=success&plan=${targetPlan}`,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.checkout_url) {
      console.error('Dodo checkout creation error:', data);
      return NextResponse.json(
        { error: data?.message || 'Failed to initialize Dodo Payments checkout.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      checkoutUrl: data.checkout_url,
      sessionId: data.session_id || null,
    });
  } catch (err) {
    console.error('Billing checkout route error:', err);
    return NextResponse.json(
      { error: 'Internal error creating checkout session.' },
      { status: 500 }
    );
  }
}
