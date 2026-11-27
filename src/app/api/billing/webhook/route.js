import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_WATERMARK_TEXT } from '@/lib/billing';
import {
  sendPlanUpgradedEmail,
  sendSubscriptionRenewedEmail,
  sendPaymentIssueEmail,
} from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyStandardWebhookSignature(rawBody, headers, secret) {
  if (!secret) return false;

  const msgId = headers.get('webhook-id');
  const msgTimestamp = headers.get('webhook-timestamp');
  const msgSignature = headers.get('webhook-signature');

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  // Reject stale timestamps (> 5 minutes skew)
  const tsNum = Number(msgTimestamp);
  const nowSec = Math.floor(Date.now() / 1000);
  if (Number.isNaN(tsNum) || Math.abs(nowSec - tsNum) > 300) {
    return false;
  }

  const secretKey = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice(6), 'base64')
    : Buffer.from(secret, 'utf8');

  const signedContent = `${msgId}.${msgTimestamp}.${rawBody}`;
  const expectedSig = crypto
    .createHmac('sha256', secretKey)
    .update(signedContent)
    .digest('base64');

  const signatures = msgSignature.split(' ');
  for (const sigEntry of signatures) {
    const [, sigValue] = sigEntry.split(',');
    if (!sigValue) continue;
    try {
      const a = Buffer.from(expectedSig, 'base64');
      const b = Buffer.from(sigValue, 'base64');
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        return true;
      }
    } catch {}
  }

  return false;
}

function resolvePlanFromPayload(data) {
  const metaPlan = data?.metadata?.target_plan;
  if (metaPlan === 'pro' || metaPlan === 'advanced') return metaPlan;

  const productId = data?.product_id || data?.subscription?.product_id;
  if (productId && productId === process.env.DODO_PRODUCT_ADVANCED_ID) return 'advanced';
  if (productId && productId === process.env.DODO_PRODUCT_PRO_ID) return 'pro';

  return null;
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    if (!verifyStandardWebhookSignature(rawBody, req.headers, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.type || '';
    const data = event?.data || {};

    const userId = data?.metadata?.user_id || null;
    const customerId = data?.customer?.customer_id || data?.customer_id || null;
    const subscriptionId = data?.subscription_id || data?.id || null;
    const nextBillingDate = data?.next_billing_date || data?.current_period_end || null;

    if (!userId && !customerId) {
      return NextResponse.json({ received: true, ignored: 'No user identifier' });
    }

    const admin = createAdminClient();
    const matchColumn = userId ? 'id' : 'billing_customer_id';
    const matchValue = userId || customerId;

    const { data: existingUser } = await admin
      .from('users')
      .select('email, full_name, plan')
      .eq(matchColumn, matchValue)
      .maybeSingle();

    const recipientEmail = data?.customer?.email || existingUser?.email || null;
    const recipientName = data?.customer?.name || existingUser?.full_name || null;

    if (eventType === 'subscription.active' || eventType === 'subscription.renewed') {
      const resolvedPlan = resolvePlanFromPayload(data);
      if (!resolvedPlan) {
        return NextResponse.json({ received: true, warning: 'Unrecognized product plan' });
      }

      await admin
        .from('users')
        .update({
          plan: resolvedPlan,
          plan_status: 'active',
          billing_customer_id: customerId,
          billing_subscription_id: subscriptionId,
          current_period_end: nextBillingDate,
        })
        .eq(matchColumn, matchValue);

      try {
        if (recipientEmail) {
          if (eventType === 'subscription.active') {
            await sendPlanUpgradedEmail({
              to: recipientEmail,
              name: recipientName,
              planId: resolvedPlan,
              nextBillingDate,
            });
          } else {
            await sendSubscriptionRenewedEmail({
              to: recipientEmail,
              name: recipientName,
              planId: resolvedPlan,
              nextBillingDate,
            });
          }
        }
      } catch (emailErr) {
        console.warn('Non-blocking billing email error:', emailErr);
      }
    } else if (eventType === 'subscription.cancelled') {
      await admin
        .from('users')
        .update({
          plan_status: 'cancelled',
          current_period_end: nextBillingDate,
        })
        .eq(matchColumn, matchValue);
    } else if (eventType === 'subscription.expired' || eventType === 'subscription.failed') {
      await admin
        .from('users')
        .update({
          plan: 'free',
          plan_status: 'active',
          default_watermark: DEFAULT_WATERMARK_TEXT,
          current_period_end: null,
        })
        .eq(matchColumn, matchValue);

      try {
        if (recipientEmail) {
          await sendPaymentIssueEmail({
            to: recipientEmail,
            name: recipientName,
            eventType,
            planId: existingUser?.plan || resolvePlanFromPayload(data),
          });
        }
      } catch (emailErr) {
        console.warn('Non-blocking payment issue email error:', emailErr);
      }
    } else if (eventType === 'subscription.on_hold') {
      await admin
        .from('users')
        .update({
          plan_status: 'on_hold',
        })
        .eq(matchColumn, matchValue);

      try {
        if (recipientEmail) {
          await sendPaymentIssueEmail({
            to: recipientEmail,
            name: recipientName,
            eventType,
            planId: existingUser?.plan || resolvePlanFromPayload(data),
          });
        }
      } catch (emailErr) {
        console.warn('Non-blocking payment on-hold email error:', emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Dodo webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
