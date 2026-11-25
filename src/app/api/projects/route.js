import { NextResponse } from 'next/server';
/* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Auto-Learned Project Memory API
import { createClient as createServerClient } from '@/lib/supabase/server';
import {
  clampProjectSummary,
  MAX_NAME_CHARS,
  normalizeProjectSlug,
  sanitizeProjectsList,
} from '@/lib/projectMemory';
*/

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'Auto-Learned Project Memory is temporarily disabled.' },
    { status: 503 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Auto-Learned Project Memory is temporarily disabled.' },
    { status: 503 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Auto-Learned Project Memory is temporarily disabled.' },
    { status: 503 }
  );
}

/* [FUTURE FEATURE - COMMENTED OUT FOR BUDGET]: Full /api/projects Implementation
async function getAuthenticatedUserAndProjects() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, user: null, projects: [] };
  }

  const { data: userRow, error: dbError } = await supabase
    .from('users')
    .select('projects')
    .eq('id', user.id)
    .single();

  if (dbError) {
    throw dbError;
  }

  return {
    supabase,
    user,
    projects: sanitizeProjectsList(userRow?.projects),
  };
}

export async function GET() {
  try {
    const { user, projects } = await getAuthenticatedUserAndProjects();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, projects });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load saved projects.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { slug, name, summary } = body || {};
    const targetSlug = normalizeProjectSlug(slug);

    if (!targetSlug) {
      return NextResponse.json({ error: 'Valid project slug is required.' }, { status: 400 });
    }

    const cleanSummary = clampProjectSummary(summary);
    if (!cleanSummary) {
      return NextResponse.json({ error: 'Project summary cannot be empty.' }, { status: 400 });
    }

    const { supabase, user, projects } = await getAuthenticatedUserAndProjects();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const existing = projects.find((p) => p.slug === targetSlug);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const updatedItem = {
      slug: targetSlug,
      name: (name ? String(name).trim().slice(0, MAX_NAME_CHARS) : existing.name) || existing.name,
      summary: cleanSummary,
      updatedAt: new Date().toISOString(),
    };

    const updatedProjects = sanitizeProjectsList([
      updatedItem,
      ...projects.filter((p) => p.slug !== targetSlug),
    ]);

    const { error: updateError } = await supabase
      .from('users')
      .update({ projects: updatedProjects })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, projects: updatedProjects });
  } catch (err) {
    console.error('PATCH /api/projects error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update project.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    let rawSlug = '';
    try {
      const { searchParams } = new URL(req.url);
      rawSlug = searchParams.get('slug') || '';
    } catch {}

    if (!rawSlug) {
      try {
        const body = await req.json();
        rawSlug = body?.slug || '';
      } catch {}
    }

    const targetSlug = normalizeProjectSlug(rawSlug);
    if (!targetSlug) {
      return NextResponse.json({ error: 'Valid project slug is required.' }, { status: 400 });
    }

    const { supabase, user, projects } = await getAuthenticatedUserAndProjects();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const updatedProjects = sanitizeProjectsList(projects.filter((p) => p.slug !== targetSlug));

    const { error: updateError } = await supabase
      .from('users')
      .update({ projects: updatedProjects })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, projects: updatedProjects });
  } catch (err) {
    console.error('DELETE /api/projects error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete project.' },
      { status: 500 }
    );
  }
}
*/
