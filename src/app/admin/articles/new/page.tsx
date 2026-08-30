import React from 'react';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { ArticleEditorForm } from '@/components/admin/ArticleEditorForm';
import { CategoryItem } from '@/types';

export const revalidate = 0;

export default async function NewArticlePage() {
  await ensureDatabaseSeeded();

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <ArticleEditorForm categories={categories as CategoryItem[]} />
    </div>
  );
}
