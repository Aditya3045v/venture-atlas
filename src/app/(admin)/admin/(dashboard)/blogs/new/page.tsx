import React from 'react';
import { fetchCategories } from '@/lib/supabase-db';
import { BlogEditorForm } from '@/components/admin/BlogEditorForm';
import { CategoryItem } from '@/types';

export const revalidate = 0;

export default async function NewBlogPage() {
  const categories = await fetchCategories();

  return (
    <div>
      <BlogEditorForm categories={categories as CategoryItem[]} />
    </div>
  );
}
