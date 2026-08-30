import React from 'react';
import { fetchCategories } from '@/lib/supabase-db';
import { CaseStudyEditorForm } from '@/components/admin/CaseStudyEditorForm';
import { CategoryItem } from '@/types';

export const revalidate = 0;

export default async function NewCaseStudyPage() {
  const categories = await fetchCategories();

  return (
    <div>
      <CaseStudyEditorForm categories={categories as CategoryItem[]} />
    </div>
  );
}
