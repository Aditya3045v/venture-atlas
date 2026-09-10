import { createServerSupabaseClient } from '../supabase/server';
import { supabaseAdmin } from '../supabase/admin';
import { UserProfile, UserRole } from '@/types';

export type StaffRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'WRITER' | 'REVIEWER' | 'MEDIA_MANAGER' | string;

export interface StaffUser extends UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  plan: string;
  bio?: string | null;
  is_active?: boolean;
  permissions?: string[];
}

async function resolveStaffUserFromAuth(user: any): Promise<StaffUser | null> {
  const isRootAdmin = user.email === 'admin@ventureatlas.in';

  let profile: any = null;
  try {
    const { data: pData } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name, role, avatar, plan, bio, is_active')
      .eq('id', user.id)
      .single();

    if (pData) {
      profile = pData;
    }
  } catch {}

  if (profile?.is_active === false && !isRootAdmin) {
    return null; // Deactivated account
  }

  const metaRole = (user.user_metadata?.role || user.app_metadata?.role) as UserRole | undefined;
  const role = (isRootAdmin ? 'SUPER_ADMIN' : (profile?.role || metaRole || 'WRITER')) as UserRole;

  if (!role || role === 'READER') {
    return null;
  }

  return {
    id: profile?.id || user.id,
    email: profile?.email || user.email || '',
    name: profile?.name || user.user_metadata?.name || (isRootAdmin ? 'Venture Atlas Super Admin' : 'Staff Member'),
    role,
    avatar: profile?.avatar || null,
    plan: profile?.plan || 'ENTERPRISE',
    bio: profile?.bio || null,
    is_active: profile?.is_active ?? true,
    mfaEnabled: false,
  };
}

/**
 * Resolves the authenticated staff user from:
 * 1. Authorization: Bearer <jwt> header (highest priority, direct token verification)
 * 2. Forwarded x-admin-* request headers (fast-path from middleware)
 * 3. Supabase SSR cookies (createServerSupabaseClient)
 * Returns null if no verified Supabase session exists or profile role is invalid.
 */
export async function getCurrentUser(req?: Request | any): Promise<StaffUser | null> {
  try {
    // 1. Direct check: Authorization Bearer header
    let authHeader: string | null = null;
    if (req?.headers?.get) {
      authHeader = req.headers.get('authorization');
    }
    if (!authHeader) {
      try {
        const { headers } = await import('next/headers');
        authHeader = headers().get('authorization');
      } catch {}
    }

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const { data: { user: tokenUser }, error: tokenErr } = await supabaseAdmin.auth.getUser(token);
        if (tokenUser && !tokenErr) {
          const staffUser = await resolveStaffUserFromAuth(tokenUser);
          if (staffUser) return staffUser;
        }
      }
    }

    // 2. Fast path: check forwarded request headers from middleware
    try {
      const { headers } = await import('next/headers');
      const headerStore = headers();
      const adminId = headerStore.get('x-admin-id');
      const adminEmail = headerStore.get('x-admin-email');
      const adminRole = headerStore.get('x-admin-role') as UserRole | null;
      const adminName = headerStore.get('x-admin-name');

      if (adminId && adminRole && canEdit(adminRole)) {
        const isOwner = adminEmail === 'admin@ventureatlas.in' || adminRole === 'SUPER_ADMIN';
        return {
          id: adminId,
          email: adminEmail || '',
          name: adminName || (isOwner ? 'Venture Atlas Super Admin' : 'Staff Member'),
          role: isOwner ? 'SUPER_ADMIN' : adminRole,
          avatar: null,
          plan: 'ENTERPRISE',
          bio: null,
          is_active: true,
          mfaEnabled: false,
        };
      }
    } catch {
      // In case next/headers is not available in current execution context
    }

    // 3. Supabase SSR cookies lookup
    try {
      const supabase = createServerSupabaseClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (user && !authError) {
        return await resolveStaffUserFromAuth(user);
      }
    } catch {}

    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if user is Super Admin / Owner (unrestricted full access)
 */
export function isSuperAdmin(role?: UserRole | null, email?: string | null): boolean {
  if (email === 'admin@ventureatlas.in') return true;
  if (!role) return false;
  return role === 'SUPER_ADMIN';
}

/**
 * Checks if a staff user has editing privileges
 */
export function canEdit(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR' || role === 'WRITER' || role === 'REVIEWER';
}

/**
 * Checks if a staff user has publishing/unpublishing privileges
 */
export function canPublish(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR';
}

/**
 * Checks if a staff user can manage user accounts
 */
export function canManageUsers(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

/**
 * Checks if a staff user can manage custom roles, permissions & RBAC matrix (Super Admin exclusive)
 */
export function canManageRoles(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN';
}

/**
 * Checks if a staff user has comment moderation privileges
 */
export function canModerate(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR' || role === 'REVIEWER';
}

/**
 * Enforces staff privileges or throws an explicit Authorization Error
 */
export async function requireStaff(): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    throw new Error('UNAUTHORIZED_STAFF: Verified Staff account required.');
  }
  return user;
}

/**
 * Enforces administrator privileges or throws an explicit Authorization Error
 */
export async function requireAdmin(): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user || !canManageUsers(user.role)) {
    throw new Error('UNAUTHORIZED_ADMIN: Administrator privileges required.');
  }
  return user;
}

/**
 * Enforces Super Admin / Owner privileges
 */
export async function requireSuperAdmin(): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user.role, user.email)) {
    throw new Error('UNAUTHORIZED_SUPER_ADMIN: Super Admin / Owner clearance required.');
  }
  return user;
}
