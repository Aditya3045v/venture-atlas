import { NextRequest, NextResponse } from 'next/server';
import { fetchBlogs } from '@/lib/supabase-db';
import { blogSchema } from '@/lib/validation';
import { getCurrentUser, canEdit, canPublish } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/sanitize';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const blogs = await fetchBlogs(50);
    return NextResponse.json({ blogs });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Staff credentials required.' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = blogSchema.parse(json);

    if (user.role === 'WRITER' && validated.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: Writers cannot publish essays directly.' },
        { status: 403 }
      );
    }

    const slug = slugify(validated.title);

    const blogPayload = {
      title: validated.title,
      slug,
      excerpt: validated.excerpt,
      body: validated.body,
      category_id: validated.categoryId,
      author_id: user.id,
      cover_image: validated.coverImage || null,
      read_time_minutes: validated.readTimeMinutes || 4,
      status: validated.status as any,
      published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(blogPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: validated.status === 'PUBLISHED' ? 'PUBLISH_BLOG' : 'CREATE_BLOG',
      entityType: 'BLOG',
      entityId: data.id,
      actor: user,
      metadata: { title: validated.title, slug },
    });

    if (validated.status === 'PUBLISHED') {
      try {
        const { revalidateTag, revalidatePath } = require('next/cache');
        const { submitIndexNow } = require('@/lib/indexnow');
        revalidateTag('blogs');
        revalidateTag(`blog:${slug}`);
        revalidatePath(`/blogs/${slug}`);
        revalidatePath('/blogs');
        revalidatePath('/');
        await submitIndexNow(`/blogs/${slug}`);
      } catch (e) {
        console.warn('Blog post-publish revalidation error:', e);
      }
    }

    return NextResponse.json({ blog: data }, { status: 201 });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 400 });
  }
}
