import React from 'react';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { BlogEditorForm } from '@/components/admin/BlogEditorForm';
import { CategoryItem } from '@/types';

export const revalidate = 0;

export default async function NewBlogPage() {
  await ensureDatabaseSeeded();

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div>
      <BlogEditorForm categories={categories as CategoryItem[]} />
    </div>
  );
}
