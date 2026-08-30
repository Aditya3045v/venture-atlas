import React from 'react';
import { notFound } from 'next/navigation';
import { fetchArticleById, fetchCategories } from '@/lib/supabase-db';
import { ArticleEditorForm } from '@/components/admin/ArticleEditorForm';
import { ArticleItem, CategoryItem } from '@/types';

export const revalidate = 0;

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, categories] = await Promise.all([
    fetchArticleById(params.id),
    fetchCategories(),
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
