import { PLANS } from '@/lib/billing';

const RESEND_API_URL = 'https://api.resend.com/emails';

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://makeapost.site').trim().replace(/\/$/, '');
}

function getFromAddress() {
  return (process.env.EMAIL_FROM || 'MakeAPost <onboarding@resend.dev>').trim();
}

export function getSupportInboxAddress() {
  return (
    process.env.SUPPORT_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    'adarshmishra70931@gmail.com'
  ).trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatReadableDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildBrutalEmailHtml({
  badge,
  title,
  greeting,
  intro,
  bullets = [],
  ctaLabel,
  ctaUrl,
  footerNote,
}) {
  const safeBullets = bullets
    .map(
      (item) =>
        `<li style="margin:0 0 8px 0;color:#09090B;font-size:14px;line-height:1.5;">${item}</li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:24px 12px;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#09090B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background-color:#FFFFFF;border:3px solid #09090B;border-radius:10px;padding:28px 24px;box-shadow:4px 4px 0 #09090B;">
        <div style="margin-bottom:16px;">
          <span style="display:inline-block;background-color:#FFD93D;color:#09090B;border:2px solid #09090B;border-radius:999px;padding:4px 12px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;">
            ${escapeHtml(badge)}
          </span>
        </div>

        <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.25;font-weight:900;color:#09090B;">
          ${escapeHtml(title)}
        </h1>

        <p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:#09090B;">
          ${escapeHtml(greeting)}
        </p>

        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">
          ${intro}
        </p>

        ${
          bullets.length > 0
            ? `<div style="background-color:#F8FAFC;border:2px solid #09090B;border-radius:8px;padding:14px 16px;margin:0 0 20px 0;">
                <ul style="margin:0;padding-left:18px;">
                  ${safeBullets}
                </ul>
              </div>`
            : ''
        }

        ${
          ctaLabel && ctaUrl
            ? `<div style="margin:0 0 20px 0;">
                <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background-color:#FFD93D;color:#09090B;border:2.5px solid #09090B;border-radius:8px;padding:11px 20px;font-size:14px;font-weight:800;text-decoration:none;">
                  ${escapeHtml(ctaLabel)} &rarr;
                </a>
              </div>`
            : ''
        }

        <hr style="border:none;border-top:2px dashed #CBD5E1;margin:20px 0 14px 0;" />

        <p style="margin:0;font-size:12px;line-height:1.5;color:#64748B;">
          ${escapeHtml(footerNote || 'Sent by MakeAPost (https://makeapost.site). Need help? Reply to this email or visit our Contact page.')}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a transactional email via Resend REST API.
 * Never throws so auth/webhook flows remain resilient.
 */
export async function sendResendEmail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not configured; skipping email:', subject);
    return { ok: false, skipped: true };
  }

  if (!to) {
    return { ok: false, skipped: true, reason: 'missing_recipient' };
  }

  try {
    const payload = {
      from: getFromAddress(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text ? { text } : {}),
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[email] Resend API error:', res.status, data);
      return { ok: false, status: res.status, error: data?.message || 'Resend send failed' };
    }

    return { ok: true, id: data?.id || null };
  } catch (err) {
    console.error('[email] Resend network error:', err);
    return { ok: false, error: err?.message || 'Network error' };
  }
}

export async function sendWelcomeEmail({ to, name }) {
  const appUrl = getAppUrl();
  const displayName = name || 'Creator';
  return sendResendEmail({
    to,
    subject: 'Welcome to MakeAPost — Your Studio is Ready',
    html: buildBrutalEmailHtml({
      badge: 'WELCOME TO MAKEAPOST',
      title: 'Turn Raw Screenshots into Viral Posts',
      greeting: `Hi ${displayName},`,
      intro:
        'Your MakeAPost account is active. You have been automatically enrolled in our monthly auto-renewing <strong>Free Plan</strong> — zero setup required.',
      bullets: [
        '<strong>3 Image Edits / day</strong> with 10+ annotation tools, blur redaction &amp; studio frames',
        '<strong>1 AI Post per platform / day</strong> across X, LinkedIn, and Reddit',
        '<strong>100% Zero-Storage Privacy:</strong> screenshots and drafts are never saved on our servers',
      ],
      ctaLabel: 'Open MakeAPost Studio',
      ctaUrl: `${appUrl}/editor`,
      footerNote:
        'You received this one-time welcome email because you signed in to MakeAPost (https://makeapost.site).',
    }),
    text: `Hi ${displayName},\n\nWelcome to MakeAPost! Your Free Plan is active (3 image edits/day + 1 AI post per platform/day, auto-renewed monthly).\n\nOpen Studio: ${appUrl}/editor`,
  });
}

export async function sendPlanUpgradedEmail({ to, name, planId, nextBillingDate }) {
  const appUrl = getAppUrl();
  const plan = PLANS[planId] || PLANS.pro;
  const displayName = name || 'Creator';
  const renewalStr = formatReadableDate(nextBillingDate);

  const perks = [
    `<strong>${plan.dailyImages} Image Edits / day</strong> (${plan.dailyImages * 30} / month)`,
    `<strong>${plan.dailyAiPerPlatform} AI Posts per platform / day</strong> (${plan.dailyAiPerPlatform * 90} / month across X, LinkedIn &amp; Reddit)`,
    plan.canCustomWatermark
      ? '<strong>Custom Brand Handle + Clean Export</strong> unlocked in Account Settings'
      : '<strong>Hide Watermark (Clean Export)</strong> unlocked in Account Settings',
  ];
  if (renewalStr) {
    perks.push(`<strong>Next Renewal Date:</strong> ${escapeHtml(renewalStr)}`);
  }

  return sendResendEmail({
    to,
    subject: `MakeAPost ${plan.name} Plan Activated ($${plan.priceMonthly}/mo)`,
    html: buildBrutalEmailHtml({
      badge: `${plan.name.toUpperCase()} PLAN ACTIVE`,
      title: `You're on MakeAPost ${plan.name}!`,
      greeting: `Hi ${displayName},`,
      intro: `Thank you for upgrading! Your <strong>${escapeHtml(plan.name)} Plan ($${plan.priceMonthly}/mo)</strong> is now active and all daily limits have been unlocked.`,
      bullets: perks,
      ctaLabel: 'View Plan & Branding Settings',
      ctaUrl: `${appUrl}/settings`,
      footerNote:
        'Billing confirmation from MakeAPost (https://makeapost.site). Payments are securely processed by Dodo Payments.',
    }),
    text: `Hi ${displayName},\n\nYour MakeAPost ${plan.name} Plan ($${plan.priceMonthly}/mo) is now active!\n- ${plan.dailyImages} Image Edits/day\n- ${plan.dailyAiPerPlatform} AI Posts per platform/day\n${renewalStr ? `Next Renewal: ${renewalStr}\n` : ''}\nManage settings: ${appUrl}/settings`,
  });
}

export async function sendSubscriptionRenewedEmail({ to, name, planId, nextBillingDate }) {
  const appUrl = getAppUrl();
  const plan = PLANS[planId] || PLANS.pro;
  const displayName = name || 'Creator';
  const renewalStr = formatReadableDate(nextBillingDate);

  const bullets = [
    `<strong>Plan:</strong> ${escapeHtml(plan.name)} ($${plan.priceMonthly}/mo)`,
    `<strong>Daily Quotas:</strong> ${plan.dailyImages} Image Edits &amp; ${plan.dailyAiPerPlatform} AI Posts / platform`,
  ];
  if (renewalStr) {
    bullets.push(`<strong>Next Billing Date:</strong> ${escapeHtml(renewalStr)}`);
  }

  return sendResendEmail({
    to,
    subject: `MakeAPost ${plan.name} Plan Renewed`,
    html: buildBrutalEmailHtml({
      badge: 'SUBSCRIPTION RENEWED',
      title: 'Monthly Cycle Renewed Successfully',
      greeting: `Hi ${displayName},`,
      intro: `Your <strong>MakeAPost ${escapeHtml(plan.name)}</strong> subscription has renewed for another month. Keep shipping great visuals!`,
      bullets,
      ctaLabel: 'Open Account Settings',
      ctaUrl: `${appUrl}/settings`,
    }),
    text: `Hi ${displayName},\n\nYour MakeAPost ${plan.name} subscription has renewed.${renewalStr ? ` Next billing date: ${renewalStr}.` : ''}\n\nSettings: ${appUrl}/settings`,
  });
}

export async function sendPaymentIssueEmail({ to, name, eventType, planId }) {
  const appUrl = getAppUrl();
  const displayName = name || 'Creator';
  const isExpired = eventType === 'subscription.expired' || eventType === 'subscription.failed';
  const planLabel = PLANS[planId]?.name || 'paid';

  return sendResendEmail({
    to,
    subject: isExpired
      ? 'MakeAPost Subscription Ended — Reverted to Free Plan'
      : 'Action Needed: MakeAPost Subscription Payment On Hold',
    html: buildBrutalEmailHtml({
      badge: isExpired ? 'PLAN REVERTED TO FREE' : 'PAYMENT ON HOLD',
      title: isExpired ? 'Your Paid Subscription Ended' : 'Payment Needs Attention',
      greeting: `Hi ${displayName},`,
      intro: isExpired
        ? `Your ${escapeHtml(planLabel)} subscription could not be renewed, so your account has been moved back to the <strong>Free Plan</strong> (3 image edits/day + 1 AI post/platform/day).`
        : `We couldn't complete your latest ${escapeHtml(planLabel)} subscription payment, so your plan is currently <strong>on hold</strong>.`,
      bullets: [
        'All your account settings remain safe.',
        'You can re-subscribe anytime from Account Settings to restore Pro or Advanced limits.',
      ],
      ctaLabel: 'Manage Subscription',
      ctaUrl: `${appUrl}/settings`,
    }),
    text: `Hi ${displayName},\n\n${
      isExpired
        ? 'Your paid MakeAPost subscription ended and your account has been moved to the Free Plan.'
        : 'Your MakeAPost subscription payment is currently on hold.'
    }\n\nVisit ${appUrl}/settings to manage or upgrade your plan.`,
  });
}

export async function sendContactSupportEmail({ name, email, topic, message }) {
  const appUrl = getAppUrl();
  const supportInbox = getSupportInboxAddress();
  const safeTopic = topic || 'General Support';

  const adminResult = await sendResendEmail({
    to: supportInbox,
    replyTo: email,
    subject: `[MakeAPost Contact] ${safeTopic} — ${name}`,
    html: buildBrutalEmailHtml({
      badge: 'NEW CONTACT INQUIRY',
      title: `${safeTopic}`,
      greeting: `From: ${name} (${email})`,
      intro: escapeHtml(message).replace(/\n/g, '<br />'),
      bullets: [
        `<strong>Sender Name:</strong> ${escapeHtml(name)}`,
        `<strong>Sender Email:</strong> ${escapeHtml(email)}`,
        `<strong>Topic:</strong> ${escapeHtml(safeTopic)}`,
      ],
      ctaLabel: 'Open MakeAPost',
      ctaUrl: appUrl,
      footerNote: 'Reply directly to this email to respond to the user.',
    }),
    text: `New Contact Inquiry (${safeTopic})\nFrom: ${name} <${email}>\n\n${message}`,
  });

  // Best-effort confirmation to the user (non-blocking)
  if (adminResult.ok) {
    await sendResendEmail({
      to: email,
      subject: `We received your MakeAPost inquiry (${safeTopic})`,
      html: buildBrutalEmailHtml({
        badge: 'REQUEST RECEIVED',
        title: 'Thanks for Reaching Out!',
        greeting: `Hi ${name},`,
        intro:
          'We have received your message and our founder/support team will get back to you within <strong>24–48 business hours</strong>.',
        bullets: [
          `<strong>Topic:</strong> ${escapeHtml(safeTopic)}`,
          `<strong>Your Message:</strong> ${escapeHtml(message.slice(0, 280))}${message.length > 280 ? '...' : ''}`,
        ],
        ctaLabel: 'Back to MakeAPost',
        ctaUrl: appUrl,
      }),
      text: `Hi ${name},\n\nWe received your MakeAPost inquiry (${safeTopic}) and will respond within 24-48 business hours.\n\nMakeAPost: ${appUrl}`,
    });
  }

  return adminResult;
}
