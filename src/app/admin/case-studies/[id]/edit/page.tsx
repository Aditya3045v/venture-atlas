import React from 'react';
import { notFound } from 'next/navigation';
import { fetchCaseStudyById, fetchCategories } from '@/lib/supabase-db';
import { CaseStudyEditorForm } from '@/components/admin/CaseStudyEditorForm';
import { CaseStudyItem, CategoryItem } from '@/types';

export const revalidate = 0;

interface EditCaseStudyPageProps {
  params: { id: string };
}

export default async function EditCaseStudyPage({ params }: EditCaseStudyPageProps) {
  const [cs, categories] = await Promise.all([
    fetchCaseStudyById(params.id),
    fetchCategories(),
  ]);

  if (!cs) {
    notFound();
  }

  return (
    <div>
      <CaseStudyEditorForm
        initialCaseStudy={cs as unknown as CaseStudyItem}
        categories={categories as CategoryItem[]}
      />
    </div>
  );
}
