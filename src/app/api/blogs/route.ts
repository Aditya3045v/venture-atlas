import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { blogSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { slugify } from '@/lib/sanitize';

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true, author: true },
      orderBy: { publishedAt: 'desc' },
    });
    return NextResponse.json({ blogs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = blogSchema.parse(json);

    let baseSlug = slugify(validated.title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

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
    });

    await logAuditEvent({
      action: validated.status === 'PUBLISHED' ? 'PUBLISH_BLOG' : 'CREATE_BLOG',
      entityType: 'BLOG',
      entityId: blog.id,
      actor: user,
      metadata: { title: blog.title, slug: blog.slug },
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 400 });
  }
}
