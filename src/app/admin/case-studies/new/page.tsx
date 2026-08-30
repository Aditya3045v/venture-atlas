import React from 'react';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { CaseStudyEditorForm } from '@/components/admin/CaseStudyEditorForm';
import { CategoryItem } from '@/types';

export const revalidate = 0;

export default async function NewCaseStudyPage() {
  await ensureDatabaseSeeded();

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div>
      <CaseStudyEditorForm categories={categories as CategoryItem[]} />
    </div>
  );
}
