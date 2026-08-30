import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/sanitize';

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true, author: true },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ caseStudies });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();

    let baseSlug = slugify(json.title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.caseStudy.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

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
    });

    await logAuditEvent({
      action: 'CREATE_CASE_STUDY',
      entityType: 'CASE_STUDY',
      entityId: cs.id,
      actor: user,
      metadata: { company: cs.company, title: cs.title },
    });

    return NextResponse.json({ caseStudy: cs }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create case study' }, { status: 400 });
  }
}
