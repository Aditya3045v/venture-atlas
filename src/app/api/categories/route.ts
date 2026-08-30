import { NextRequest, NextResponse } from 'next/server';
import { fetchCategories } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/db';
import { categorySchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = categorySchema.parse(json);

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .insert({
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          color: validated.color,
          order: validated.order,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ category: data }, { status: 201 });
      }
    } catch {
      // fallback to prisma
    }

    // 2. Try Prisma
    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        color: validated.color,
        order: validated.order,
      },
    }).catch(() => null);

    await logAuditEvent({
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: category?.id,
      actor: user,
      metadata: { name: validated.name, slug: validated.slug },
    });

    return NextResponse.json({ category: category || validated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
  }
}
