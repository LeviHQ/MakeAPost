import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/editor';

  // Determine actual forwarded origin on Vercel
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin;

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (data?.user?.id) {
          try {
            const admin = createAdminClient();
            const { data: userRow } = await admin
              .from('users')
              .select('id, email, full_name, welcome_email_sent')
              .eq('id', data.user.id)
              .maybeSingle();

            if (userRow && userRow.welcome_email_sent === false) {
              const targetEmail = userRow.email || data.user.email;
              const targetName =
                userRow.full_name ||
                data.user.user_metadata?.full_name ||
                data.user.user_metadata?.name;
              const emailRes = await sendWelcomeEmail({
                to: targetEmail,
                name: targetName,
              });
              if (emailRes?.ok) {
                await admin
                  .from('users')
                  .update({ welcome_email_sent: true })
                  .eq('id', data.user.id);
              }
            }
          } catch (welcomeErr) {
            console.warn('Non-blocking welcome email check error:', welcomeErr);
          }
        }
        return NextResponse.redirect(new URL(next, origin));
      }
      console.error('Supabase exchangeCodeForSession error:', error);
    } catch (err) {
      console.error('Auth callback exchange exception:', err);
    }
  }

  return NextResponse.redirect(new URL('/editor?auth_error=true', origin));
}
