import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { categorySchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = categorySchema.parse(json);

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        color: validated.color,
        order: validated.order,
      },
    });

    await logAuditEvent({
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: category.id,
      actor: user,
      metadata: { name: category.name, slug: category.slug },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
  }
}
