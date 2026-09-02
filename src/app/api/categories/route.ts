import { NextRequest, NextResponse } from 'next/server';
import { fetchCategories } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { categorySchema } from '@/lib/validation';
import { getCurrentUser, canPublish } from '@/lib/auth';
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
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = categorySchema.parse(json);

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        color: validated.color,
        display_order: validated.order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase category creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'CREATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: category.id,
      actor: user,
      metadata: { name: validated.name, slug: validated.slug },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
  }
}
