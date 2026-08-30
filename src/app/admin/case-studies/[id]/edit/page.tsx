import React from 'react';
import { notFound } from 'next/navigation';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { CaseStudyEditorForm } from '@/components/admin/CaseStudyEditorForm';
import { CaseStudyItem, CategoryItem } from '@/types';

export const revalidate = 0;

interface EditCaseStudyPageProps {
  params: { id: string };
}

export default async function EditCaseStudyPage({ params }: EditCaseStudyPageProps) {
  await ensureDatabaseSeeded();

  const [cs, categories] = await Promise.all([
    prisma.caseStudy.findUnique({
      where: { id: params.id },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
    }),
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
