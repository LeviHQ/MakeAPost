import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { encryptToken } from '@/lib/crypto';

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
  const baseUrl = getAppBaseUrl(request);

  try {
    const { platform } = await params;
    const normalizedPlatform = (platform || '').toLowerCase().trim();
    const searchParams = request.nextUrl.searchParams;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.warn(`OAuth callback returned error for ${normalizedPlatform}:`, error, errorDescription);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(errorDescription || error)}`, baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=No+authorization+code+received', baseUrl)
      );
    }

    // 1. Verify user session
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL('/settings?error=Please+log+in+before+connecting+accounts', baseUrl)
      );
    }

    const cookieStore = await cookies();
    const redirectUri = `${baseUrl}/api/connect/${normalizedPlatform}/callback`;
    const admin = createAdminClient();

    // 2. Handle LinkedIn Callback
    if (normalizedPlatform === 'linkedin') {
      const storedState = cookieStore.get('oauth_state_linkedin')?.value;
      cookieStore.delete('oauth_state_linkedin');

      if (!storedState || storedState !== state) {
        return NextResponse.redirect(
          new URL('/settings?error=Invalid+LinkedIn+OAuth+state+(CSRF+mismatch)', baseUrl)
        );
      }

      // Exchange code for Access Token
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: process.env.LINKEDIN_CLIENT_ID || '',
          client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('LinkedIn token exchange failed:', tokenData);
        return NextResponse.redirect(
          new URL(
            `/settings?error=${encodeURIComponent(
              tokenData.error_description || 'LinkedIn token exchange failed'
            )}`,
            baseUrl
          )
        );
      }

      // Fetch user identity via OIDC userinfo
      const userInfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userInfo = await userInfoRes.json();
      const platformUserId = userInfo.sub || user.id;
      const platformUsername = userInfo.name || userInfo.email || 'LinkedIn Creator';

      const expiresIn = tokenData.expires_in || 5184000; // ~60 days default
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // Upsert into public.social_connections using Supabase Admin
      const { error: upsertError } = await admin.from('social_connections').upsert(
        {
          user_id: user.id,
          platform: 'linkedin',
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          access_token_enc: encryptToken(tokenData.access_token),
          refresh_token_enc: tokenData.refresh_token
            ? encryptToken(tokenData.refresh_token)
            : null,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,platform' }
      );

      if (upsertError) {
        console.error('Failed to save LinkedIn connection to database:', upsertError);
        return NextResponse.redirect(
          new URL('/settings?error=Database+error+saving+LinkedIn+connection', baseUrl)
        );
      }

      return NextResponse.redirect(new URL('/settings?connected=linkedin', baseUrl));
    }

    // 3. Handle X (Twitter) Callback
    if (normalizedPlatform === 'x') {
      const storedState = cookieStore.get('oauth_state_x')?.value;
      const codeVerifier = cookieStore.get('oauth_verifier_x')?.value;

      cookieStore.delete('oauth_state_x');
      cookieStore.delete('oauth_verifier_x');

      if (!storedState || storedState !== state) {
        return NextResponse.redirect(
          new URL('/settings?error=Invalid+X+OAuth+state+(CSRF+mismatch)', baseUrl)
        );
      }

      if (!codeVerifier) {
        return NextResponse.redirect(
          new URL('/settings?error=Missing+X+PKCE+code+verifier', baseUrl)
        );
      }

      const basicAuth = Buffer.from(
        `${process.env.X_CLIENT_ID || ''}:${process.env.X_CLIENT_SECRET || ''}`
      ).toString('base64');

      // Exchange authorization code with PKCE
      const tokenRes = await fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('X token exchange failed:', tokenData);
        return NextResponse.redirect(
          new URL(
            `/settings?error=${encodeURIComponent(
              tokenData.error_description || tokenData.error || 'X token exchange failed'
            )}`,
            baseUrl
          )
        );
      }

      // Fetch user profile from /2/users/me
      const meRes = await fetch('https://api.x.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const meData = await meRes.json();
      const xUser = meData?.data;

      const platformUserId = xUser?.id || user.id;
      const platformUsername = xUser?.username ? `@${xUser.username}` : 'X User';

      const expiresIn = tokenData.expires_in || 7200; // 2 hours default
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      const { error: upsertError } = await admin.from('social_connections').upsert(
        {
          user_id: user.id,
          platform: 'x',
          platform_user_id: platformUserId,
          platform_username: platformUsername,
          access_token_enc: encryptToken(tokenData.access_token),
          refresh_token_enc: tokenData.refresh_token
            ? encryptToken(tokenData.refresh_token)
            : null,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,platform' }
      );

      if (upsertError) {
        console.error('Failed to save X connection to database:', upsertError);
        return NextResponse.redirect(
          new URL('/settings?error=Database+error+saving+X+connection', baseUrl)
        );
      }

      return NextResponse.redirect(new URL('/settings?connected=x', baseUrl));
    }

    return NextResponse.redirect(new URL('/settings?error=Unsupported+platform', baseUrl));
  } catch (err) {
    console.error('OAuth Callback processing error:', err);
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent(err.message || 'OAuth callback failed')}`,
        baseUrl
      )
    );
  }
}
