import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canEdit, canPublish } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Edit privileges required' }, { status: 403 });
  }

  try {
    const json = await req.json();

    const { data: updated, error } = await supabaseAdmin
      .from('case_studies')
      .update({
        title: json.title,
        company: json.company,
        company_logo: json.companyLogo || null,
        valuation: json.valuation || null,
        stage: json.stage || null,
        key_metric: json.keyMetric || null,
        summary: json.summary,
        challenge: json.challenge || null,
        strategy: json.strategy || null,
        outcome: json.outcome || null,
        body: json.body,
        cover_image: json.coverImage || null,
        category_id: json.categoryId,
        read_time_minutes: Number(json.readTimeMinutes) || 8,
        status: (json.status || 'PUBLISHED') as any,
        published_at: json.status === 'PUBLISHED' ? new Date().toISOString() : null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase case study update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'UPDATE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: params.id,
      actor: user,
      metadata: { company: json.company, title: json.title },
    });

    // Invalidate caches
    try {
      const { revalidateTag, revalidatePath } = require('next/cache');
      const { submitIndexNow } = require('@/lib/indexnow');
      revalidateTag('case-studies');
      if (updated?.slug) {
        revalidateTag(`case-study:${updated.slug}`);
        revalidatePath(`/case-studies/${updated.slug}`);
        await submitIndexNow(`/case-studies/${updated.slug}`);
      }
      revalidatePath('/case-studies');
      revalidatePath('/');
    } catch {
      // ignore
    }

    return NextResponse.json({ caseStudy: updated });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update case study' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required' }, { status: 403 });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('case_studies')
      .select('slug')
      .eq('id', params.id)
      .single();

    const { error } = await supabaseAdmin
      .from('case_studies')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase case study delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'DELETE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    // Invalidate caches & notify IndexNow
    try {
      const { revalidateTag, revalidatePath } = require('next/cache');
      const { submitIndexNow } = require('@/lib/indexnow');
      revalidateTag('case-studies');
      if (existing?.slug) {
        revalidateTag(`case-study:${existing.slug}`);
        revalidatePath(`/case-studies/${existing.slug}`);
        await submitIndexNow(`/case-studies/${existing.slug}`);
      }
      revalidatePath('/case-studies');
      revalidatePath('/');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
