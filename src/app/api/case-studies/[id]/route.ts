import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();

    const existing = await prisma.caseStudy.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    const updated = await prisma.caseStudy.update({
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

    await logAuditEvent({
      action: 'UPDATE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: updated.id,
      actor: user,
      metadata: { company: updated.company, title: updated.title },
    });

    return NextResponse.json({ caseStudy: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update case study' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const existing = await prisma.caseStudy.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    await prisma.caseStudy.delete({ where: { id: params.id } });

    await logAuditEvent({
      action: 'DELETE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: params.id,
      actor: user,
      metadata: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
  }
}
