import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();

    // 1. Try Supabase
    try {
      await supabaseAdmin
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
          status: json.status,
          published_at: json.status === 'PUBLISHED' ? new Date().toISOString() : null,
        })
        .eq('id', params.id);
    } catch {
      // fallback
    }

    // 2. Try Prisma
    let updated = null;
    try {
      const existing = await prisma.caseStudy.findUnique({ where: { id: params.id } });
      if (existing) {
        updated = await prisma.caseStudy.update({
          where: { id: params.id },
          data: {
            title: json.title,
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
            readTimeMinutes: Number(json.readTimeMinutes) || 8,
            status: json.status,
            publishedAt: json.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
          },
        });
      }
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: 'UPDATE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: params.id,
      actor: user,
      metadata: { company: json.company, title: json.title },
    });

    return NextResponse.json({ caseStudy: updated || { id: params.id, ...json } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update case study' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    try {
      await supabaseAdmin.from('case_studies').delete().eq('id', params.id);
    } catch {
      // fallback
    }

    try {
      await prisma.caseStudy.delete({ where: { id: params.id } });
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: 'DELETE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
