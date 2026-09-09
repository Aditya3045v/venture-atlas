import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { normalizeImageUrl } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff credentials required.' },
      { status: 403 }
    );
  }

  try {
    const { data: assets, error } = await supabaseAdmin
      .from('media_assets')
      .select('id, title, url, category, uploaded_by, created_at, uploader:profiles(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assets: assets || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch media assets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff credentials required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { title, url, category } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and image URL are required.' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeImageUrl(url);
    if (!normalizedUrl) {
      return NextResponse.json(
        { error: 'A valid image URL is required.' },
        { status: 400 }
      );
    }

    const { data: asset, error } = await supabaseAdmin
      .from('media_assets')
      .insert({
        title: title.trim(),
        url: normalizedUrl,
        category: category ? String(category).trim() : 'General',
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'CREATE_MEDIA_ASSET',
      entityType: 'MEDIA' as any,
      entityId: asset.id,
      actor: user,
      metadata: { title: asset.title, url: asset.url },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create media asset' },
      { status: 500 }
    );
  }
}
