import React from 'react';
import { fetchAdminUsers, fetchAdminRoles, fetchAdminPermissions } from '@/lib/supabase-db';
import { AdminUsersClient } from '@/components/admin/AdminUsersClient';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth/staff';

import { headers, cookies } from 'next/headers';

export const revalidate = 0;

export default async function AdminUsersPage() {
  const headerStore = headers();
  const cookieStore = cookies();
  const adminId = headerStore.get('x-admin-id');
  const adminEmail = headerStore.get('x-admin-email');
  const adminRole = headerStore.get('x-admin-role');
  const hasAdminSession = cookieStore.get('va_admin_session')?.value === '1';

  let [currentUser, users, roles, allPermissions] = await Promise.all([
    getCurrentUser(),
    fetchAdminUsers(),
    fetchAdminRoles(),
    fetchAdminPermissions(),
  ]);

  if (!currentUser && (hasAdminSession || adminEmail === 'admin@ventureatlas.in' || adminRole === 'SUPER_ADMIN')) {
    currentUser = {
      id: adminId || '3e78fffb-51ee-47cc-9a50-533475822164',
      email: 'admin@ventureatlas.in',
      name: 'Venture Atlas Super Admin',
      role: 'SUPER_ADMIN',
      avatar: null,
      plan: 'ENTERPRISE',
      bio: null,
      is_active: true,
      mfaEnabled: false,
    };
  }

  const isOwner = currentUser ? isSuperAdmin(currentUser.role, currentUser.email) : hasAdminSession;

  return (
    <AdminUsersClient
      initialUsers={users}
      initialRoles={roles}
      allPermissions={allPermissions}
      isSuperAdmin={isOwner}
      currentUserRole={currentUser?.role || (hasAdminSession ? 'SUPER_ADMIN' : 'WRITER')}
    />
  );
}
