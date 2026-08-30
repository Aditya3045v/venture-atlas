import { NextRequest, NextResponse } from 'next/server';
import { fetchBlogs } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/db';
import { blogSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const blogs = await fetchBlogs(50);
    return NextResponse.json({ blogs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = blogSchema.parse(json);

    let slug = slugify(validated.title);

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert({
          title: validated.title,
          slug,
          excerpt: validated.excerpt,
          body: validated.body,
          category_id: validated.categoryId,
          author_id: user?.id,
          cover_image: validated.coverImage,
          read_time_minutes: validated.readTimeMinutes,
          status: validated.status,
          published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ blog: data }, { status: 201 });
      }
    } catch {
      // fallback
    }

    // 2. Try Prisma
    const blog = await prisma.blogPost.create({
      data: {
        title: validated.title,
        slug,
        excerpt: validated.excerpt,
        body: validated.body,
        categoryId: validated.categoryId,
        authorId: user?.id,
        coverImage: validated.coverImage,
        readTimeMinutes: validated.readTimeMinutes,
        status: validated.status,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
      },
    }).catch(() => null);

    await logAuditEvent({
      action: validated.status === 'PUBLISHED' ? 'PUBLISH_BLOG' : 'CREATE_BLOG',
      entityType: 'BLOG',
      entityId: blog?.id,
      actor: user,
      metadata: { title: validated.title, slug },
    });

    return NextResponse.json({ blog: blog || { ...validated, slug } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 400 });
  }
}
