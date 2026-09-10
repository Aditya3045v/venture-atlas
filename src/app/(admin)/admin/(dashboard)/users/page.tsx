import React from 'react';
import { fetchAdminUsers, fetchAdminRoles, fetchAdminPermissions } from '@/lib/supabase-db';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth/staff';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const [currentUser, users, roles, allPermissions] = await Promise.all([
    getCurrentUser(),
    fetchAdminUsers(),
    fetchAdminRoles(),
    fetchAdminPermissions(),
  ]);

  const isOwner = currentUser ? isSuperAdmin(currentUser.role, currentUser.email) : false;

  return (
    <AdminUsersClient
      initialUsers={users}
      initialRoles={roles}
      allPermissions={allPermissions}
      isSuperAdmin={isOwner}
      currentUserRole={currentUser?.role || 'WRITER'}
    />
  );
}
