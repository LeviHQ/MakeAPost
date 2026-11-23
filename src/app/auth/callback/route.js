import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/editor';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
      console.error('Supabase exchangeCodeForSession error:', error);
    } catch (err) {
      console.error('Auth callback exchange exception:', err);
    }
  }

  return NextResponse.redirect(new URL('/editor?auth_error=true', requestUrl.origin));
}
