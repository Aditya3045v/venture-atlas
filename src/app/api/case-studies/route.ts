import { NextRequest, NextResponse } from 'next/server';
import { fetchCaseStudies } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const caseStudies = await fetchCaseStudies(50);
    return NextResponse.json({ caseStudies });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    let slug = slugify(json.title);

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('case_studies')
        .insert({
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
          author_id: user?.id,
          read_time_minutes: Number(json.readTimeMinutes) || 8,
          status: json.status || 'PUBLISHED',
          published_at: json.status === 'PUBLISHED' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ caseStudy: data }, { status: 201 });
      }
    } catch {
      // fallback
    }

    // 2. Try Prisma
    const cs = await prisma.caseStudy.create({
      data: {
        title: json.title,
        slug,
        company: json.company,
        companyLogo: json.companyLogo || null,
        valuation: json.valuation || null,
        stage: json.stage || null,
        keyMetric: json.keyMetric || null,
        summary: json.summary,
        challenge: json.challenge || null,
        strategy: json.strategy || null,
        outcome: json.outcome || null,
        body: json.body,
        coverImage: json.coverImage || null,
        categoryId: json.categoryId,
        authorId: user?.id,
        readTimeMinutes: Number(json.readTimeMinutes) || 8,
        status: json.status || 'PUBLISHED',
        publishedAt: json.status === 'PUBLISHED' ? new Date() : null,
      },
    }).catch(() => null);

    await logAuditEvent({
      action: 'CREATE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: cs?.id,
      actor: user,
      metadata: { company: json.company, title: json.title, slug },
    });

    return NextResponse.json({ caseStudy: cs || { ...json, slug } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create case study' }, { status: 400 });
  }
}
