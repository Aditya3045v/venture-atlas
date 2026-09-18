import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { normalizeImageUrl } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user || !canEdit(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff credentials required.' },
      { status: 403 }
    );
  }

  try {
    const { data: assets, error } = await supabaseAdmin
      .from('media_assets')
      .select('id, filename, original_name, url, mime_type, size_bytes, width, height, uploaded_by, created_at, uploader:profiles(name, email)')
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
  const user = await getCurrentUser(req);
  if (!user || !canEdit(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff credentials required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url, filename, original_name, mime_type, size_bytes, width, height } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Image URL is required.' },
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

    // Derive a fallback filename from the URL if not provided
    let derivedFilename = filename;
    if (!derivedFilename) {
      try {
        const urlObj = new URL(normalizedUrl);
        const parts = urlObj.pathname.split('/');
        derivedFilename = parts[parts.length - 1] || 'image';
      } catch {
        derivedFilename = 'image';
      }
    }

    const { data: asset, error } = await supabaseAdmin
      .from('media_assets')
      .insert({
        filename: derivedFilename,
        original_name: original_name || derivedFilename,
        url: normalizedUrl,
        mime_type: mime_type || 'image/jpeg',
        size_bytes: Number(size_bytes) || 1024,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
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
      metadata: { filename: asset.filename, url: asset.url },
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create media asset' },
      { status: 500 }
    );
  }
}
