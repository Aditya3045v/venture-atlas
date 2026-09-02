import { NextRequest, NextResponse } from 'next/server';
import { fetchCaseStudies } from '@/lib/supabase-db';
import { getCurrentUser, canEdit, canPublish } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/sanitize';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const caseStudies = await fetchCaseStudies(50);
    return NextResponse.json({ caseStudies });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Staff credentials required.' }, { status: 403 });
  }

  try {
    const json = await req.json();

    if (user.role === 'WRITER' && json.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: Writers cannot publish case studies directly.' },
        { status: 403 }
      );
    }

    const slug = slugify(json.title);

    const csPayload = {
      title: json.title,
      slug,
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
      author_id: user.id,
      read_time_minutes: Number(json.readTimeMinutes) || 8,
      status: (json.status || 'DRAFT') as any,
      published_at: json.status === 'PUBLISHED' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .insert(csPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'CREATE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: data.id,
      actor: user,
      metadata: { company: json.company, title: json.title, slug },
    });

    return NextResponse.json({ caseStudy: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create case study' }, { status: 400 });
  }
}
