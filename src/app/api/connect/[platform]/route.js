import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

function getAppBaseUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL.trim();
    return url.startsWith('http') ? url : `https://${url}`;
  }
  if (request) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`;
  }
  return 'http://localhost:3000';
}

export async function GET(request, { params }) {
  try {
    const { platform } = await params;
    const normalizedPlatform = (platform || '').toLowerCase().trim();

    if (!['x', 'linkedin'].includes(normalizedPlatform)) {
      return NextResponse.json(
        { error: `Platform '${platform}' is not supported for OAuth connect.` },
        { status: 400 }
      );
    }

    // 1. Verify authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const baseUrl = getAppBaseUrl(request);

    if (authError || !user) {
      return NextResponse.redirect(new URL('/?auth_required=true', baseUrl));
    }

    const cookieStore = await cookies();
    const state = crypto.randomBytes(24).toString('hex');
    const redirectUri = `${baseUrl}/api/connect/${normalizedPlatform}/callback`;

    // 2. Platform-specific authorization flow
    if (normalizedPlatform === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      if (!clientId) {
        return NextResponse.redirect(
          new URL('/settings?error=LinkedIn+OAuth+is+not+configured+yet', baseUrl)
        );
      }

      // Store state in HTTP-only cookie for CSRF protection (10 minutes)
      cookieStore.set('oauth_state_linkedin', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      });

      const scope = 'openid profile w_member_social';
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(
        state
      )}&scope=${encodeURIComponent(scope)}`;

      return NextResponse.redirect(authUrl);
    }

    if (normalizedPlatform === 'x') {
      const clientId = process.env.X_CLIENT_ID;
      if (!clientId) {
        return NextResponse.redirect(
          new URL('/settings?error=X+OAuth+is+not+configured+yet', baseUrl)
        );
      }

      // Generate PKCE code verifier & challenge
      const codeVerifier = crypto.randomBytes(32).toString('base64url');
      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

      cookieStore.set('oauth_state_x', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      });

      cookieStore.set('oauth_verifier_x', codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      });

      const scope = 'tweet.read tweet.write users.read media.write offline.access';
      const authUrl = `https://x.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(
        scope
      )}&state=${encodeURIComponent(state)}&code_challenge=${encodeURIComponent(
        codeChallenge
      )}&code_challenge_method=S256`;

      return NextResponse.redirect(authUrl);
    }

    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  } catch (err) {
    console.error('OAuth Connect initialization error:', err);
    return NextResponse.redirect(
      new URL('/settings?error=Failed+to+initiate+social+connection', getAppBaseUrl(request))
    );
  }
}
