import React from 'react';
import { notFound } from 'next/navigation';
import { fetchBlogById, fetchCategories } from '@/lib/supabase-db';
import { BlogEditorForm } from '@/components/admin/BlogEditorForm';
import { BlogItem, CategoryItem } from '@/types';

export const revalidate = 0;

interface EditBlogPageProps {
  params: { id: string };
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const [blog, categories] = await Promise.all([
    fetchBlogById(params.id),
    fetchCategories(),
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
