import React from 'react';
import { notFound } from 'next/navigation';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { BlogEditorForm } from '@/components/admin/BlogEditorForm';
import { BlogItem, CategoryItem } from '@/types';

export const revalidate = 0;

interface EditBlogPageProps {
  params: { id: string };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  await ensureDatabaseSeeded();

  const [blog, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: params.id },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  if (!blog) {
    notFound();
  }

  return (
    <div>
      <BlogEditorForm
        initialBlog={blog as unknown as BlogItem}
        categories={categories as CategoryItem[]}
      />
    </div>
  );
}
