'use client';

import React from 'react';
import { useAdminAuth } from './AdminAuthGuard';

export function AdminSidebarRoleBadge({ fallbackRole = 'ADMIN' }: { fallbackRole?: string }) {
  const { user } = useAdminAuth();
  const role = user?.role || fallbackRole;

  return (
    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-surface-muted text-text-primary border border-border">
      {role}
    </span>
  );
}

export function AdminSidebarUserName({ fallbackName = 'Staff Member' }: { fallbackName?: string }) {
  const { user } = useAdminAuth();
  const name = user?.name || fallbackName;

  return (
    <span className="font-bold text-text-primary">{name}</span>
  );
}
