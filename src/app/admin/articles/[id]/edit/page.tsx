import React from 'react';
import { notFound } from 'next/navigation';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { ArticleEditorForm } from '@/components/admin/ArticleEditorForm';
import { ArticleItem, CategoryItem } from '@/types';

export const revalidate = 0;

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  await ensureDatabaseSeeded();

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ArticleEditorForm
        initialArticle={article as unknown as ArticleItem}
        categories={categories as CategoryItem[]}
      />
    </div>
  );
}
