import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        authenticated: false,
        connections: {
          linkedin: { connected: false, username: null },
          x: { connected: false, username: null },
          reddit: { connected: false, comingSoon: true },
        },
      });
    }

    const admin = createAdminClient();
    // Query platform and username only — tokens are NEVER exposed to client APIs
    const { data: rows, error: queryError } = await admin
      .from('social_connections')
      .select('platform, platform_username, updated_at')
      .eq('user_id', user.id);

    if (queryError) {
      console.error('Error fetching social connections status:', queryError);
      return NextResponse.json(
        { error: 'Failed to retrieve connection status' },
        { status: 500 }
      );
    }

    const connections = {
      linkedin: { connected: false, username: null },
      x: { connected: false, username: null },
      reddit: { connected: false, comingSoon: true },
    };

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.platform === 'linkedin') {
          connections.linkedin = {
            connected: true,
            username: row.platform_username || 'LinkedIn Creator',
            updatedAt: row.updated_at,
          };
        } else if (row.platform === 'x') {
          connections.x = {
            connected: true,
            username: row.platform_username || 'X User',
            updatedAt: row.updated_at,
          };
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      connections,
    });
  } catch (err) {
    console.error('Error in /api/connect/status:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
