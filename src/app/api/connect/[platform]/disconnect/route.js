import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function handleDisconnect(request, { params }) {
  try {
    const { platform } = await params;
    const normalizedPlatform = (platform || '').toLowerCase().trim();

    if (!['x', 'linkedin'].includes(normalizedPlatform)) {
      return NextResponse.json(
        { error: `Platform '${platform}' is not supported.` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { error: deleteError } = await admin
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', normalizedPlatform);

    if (deleteError) {
      console.error(`Failed to delete connection for ${normalizedPlatform}:`, deleteError);
      return NextResponse.json(
        { error: 'Failed to disconnect account.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      platform: normalizedPlatform,
      message: `Disconnected ${normalizedPlatform} account successfully.`,
    });
  } catch (err) {
    console.error('Disconnect API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error disconnecting account.' },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  return handleDisconnect(request, context);
}

export async function DELETE(request, context) {
  return handleDisconnect(request, context);
}
