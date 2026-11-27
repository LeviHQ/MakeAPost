import { NextResponse } from 'next/server';
import { sendContactSupportEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    // Simple honeypot against automated bots
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const topic = typeof body.topic === 'string' ? body.topic.trim() : 'General Support';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Please enter your name (2 to 100 characters).' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email) || email.length > 160) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Please write a message between 10 and 2000 characters.' },
        { status: 400 }
      );
    }

    const result = await sendContactSupportEmail({
      name,
      email,
      topic: topic.slice(0, 80) || 'General Support',
      message,
    });

    if (result?.skipped) {
      return NextResponse.json(
        {
          error:
            'Email delivery is not configured yet. Please email adarshmishra70931@gmail.com directly.',
        },
        { status: 503 }
      );
    }

    if (!result?.ok) {
      return NextResponse.json(
        { error: result?.error || 'Could not send message right now. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Unexpected error sending message.' }, { status: 500 });
  }
}
