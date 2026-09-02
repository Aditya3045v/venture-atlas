import React from 'react';
import { fetchAdminUsers } from '@/lib/supabase-db';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';
import { getCurrentUser, canManageUsers } from '@/lib/auth/staff';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    redirect('/admin');
  }

  const users = await fetchAdminUsers();

  return <AdminUsersClient initialUsers={users} />;
}
