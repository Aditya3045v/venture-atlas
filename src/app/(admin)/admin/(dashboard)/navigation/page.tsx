import React from 'react';
import { fetchAdminNavigationItems } from '@/lib/data/navigation';
import { AdminNavigationClient } from '@/components/admin/AdminNavigationClient';

export const revalidate = 0;

export default async function AdminNavigationPage() {
  const items = await fetchAdminNavigationItems();

  return <AdminNavigationClient initialItems={items} />;
}
