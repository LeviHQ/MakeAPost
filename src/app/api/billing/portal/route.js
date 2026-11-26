import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getDodoBaseUrl() {
  return process.env.DODO_PAYMENTS_ENV === 'live_mode'
    ? 'https://live.dodopayments.com'
    : 'https://test.dodopayments.com';
}

export async function POST() {
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
    const { data: userRow } = await admin
      .from('users')
      .select('billing_customer_id')
      .eq('id', user.id)
      .single();

    if (!userRow?.billing_customer_id) {
      return NextResponse.json(
        { error: 'No active billing customer record found.' },
        { status: 404 }
      );
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Dodo Payments API key is not configured.' },
        { status: 503 }
      );
    }

    const res = await fetch(
      `${getDodoBaseUrl()}/customers/${encodeURIComponent(userRow.billing_customer_id)}/customer-portal/session`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ send_email: false }),
      }
    );

    const data = await res.json();
    if (!res.ok || !data?.link) {
      console.error('Dodo customer portal error:', data);
      return NextResponse.json(
        { error: 'Unable to open Dodo customer portal.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ portalUrl: data.link });
  } catch (err) {
    console.error('Billing portal error:', err);
    return NextResponse.json(
      { error: 'Failed to create billing portal session.' },
      { status: 500 }
    );
  }
}
