import React from 'react';
import { fetchCategories } from '@/lib/supabase-db';
import { ArticleEditorForm } from '@/components/admin/ArticleEditorForm';
import { CategoryItem } from '@/types';

export const revalidate = 0;

export default async function NewArticlePage() {
  const categories = await fetchCategories();

  return (
    <div className="max-w-6xl mx-auto">
      <ArticleEditorForm categories={categories as CategoryItem[]} />
    </div>
  );
}
