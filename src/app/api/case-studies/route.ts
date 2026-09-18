import { NextRequest, NextResponse } from 'next/server';
import { fetchCaseStudies } from '@/lib/supabase-db';
import { caseStudySchema } from '@/lib/validation';
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
  const user = await getCurrentUser(req);
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Staff credentials required.' }, { status: 403 });
  }

  try {
    const json = await req.json();

    if (!json.seoTitle || !String(json.seoTitle).trim()) {
      json.seoTitle = (json.title || '').slice(0, 68);
    }
    if (!json.seoDescription || !String(json.seoDescription).trim()) {
      json.seoDescription = (json.summary || '').slice(0, 155);
    }

    const validated = caseStudySchema.parse(json);

    if (user.role === 'WRITER' && validated.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: Writers cannot publish case studies directly.' },
        { status: 403 }
      );
    }

    let slug = slugify(validated.title);
    const { data: existingSlug } = await supabaseAdmin
      .from('case_studies')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Verify author profile exists to guarantee foreign key integrity
    const { data: authorProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!authorProfile) {
      await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: user.email || 'admin@ventureatlas.in',
        name: user.name || 'Venture Atlas Staff',
        role: user.role || 'SUPER_ADMIN',
        plan: 'ENTERPRISE',
        is_active: true,
      });
    }

    const csPayload = {
      title: validated.title,
      slug,
      company: validated.company,
      company_logo: json.companyLogo || null,
      valuation: validated.valuation || null,
      stage: validated.stage || null,
      key_metric: validated.keyMetric || null,
      summary: validated.summary,
      challenge: validated.challenge || null,
      strategy: validated.strategy || null,
      outcome: validated.outcome || null,
      body: validated.body,
      cover_image: validated.coverImage || null,
      category_id: validated.categoryId,
      author_id: user.id,
      read_time_minutes: validated.readTimeMinutes || 8,
      status: validated.status as any,
      published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
      canvas_data: validated.canvasData || null,
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

    if (csPayload.status === 'PUBLISHED') {
      try {
        const { revalidateTag, revalidatePath } = require('next/cache');
        const { submitIndexNow } = require('@/lib/indexnow');
        revalidateTag('case-studies');
        revalidateTag(`case-study:${slug}`);
        revalidatePath(`/case-studies/${slug}`);
        revalidatePath('/case-studies');
        revalidatePath('/');
        await submitIndexNow(`/case-studies/${slug}`);
      } catch (e) {
        console.warn('Case study post-publish revalidation error:', e);
      }
    }

    return NextResponse.json({ caseStudy: data }, { status: 201 });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create case study' }, { status: 400 });
  }
}
