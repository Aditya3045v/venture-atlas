import { createServerSupabaseClient } from '../supabase/server';
import { UserProfile, UserRole } from '@/types';

export type StaffRole = 'WRITER' | 'EDITOR' | 'ADMIN';

export interface StaffUser extends UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  plan: string;
  bio?: string | null;
}

/**
 * Resolves the authenticated staff user exclusively from Supabase Auth & public.profiles table.
 * Returns null if no verified Supabase session exists or profile role is invalid.
 * Strictly NO fallback, NO default user, NO local bypass.
 */
export async function getCurrentUser(): Promise<StaffUser | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, role, avatar, plan, bio')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Ensure role is a legitimate staff or user role
    const role = profile.role as UserRole;
    if (!role || !['READER', 'WRITER', 'EDITOR', 'ADMIN'].includes(role)) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email || user.email || '',
      name: profile.name || user.user_metadata?.name || 'Staff Member',
      role,
      avatar: profile.avatar || null,
      plan: profile.plan || 'ENTERPRISE',
      bio: profile.bio || null,
      mfaEnabled: Boolean(user.factors && user.factors.length > 0),
    };
  } catch {
    return null;
  }
}

/**
 * Checks if a staff user has editing privileges (WRITER, EDITOR, ADMIN)
 */
export function canEdit(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'WRITER' || role === 'EDITOR' || role === 'ADMIN';
}

/**
 * Checks if a staff user has publishing/unpublishing privileges (EDITOR, ADMIN)
 */
export function canPublish(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'EDITOR' || role === 'ADMIN';
}

/**
 * Checks if a staff user has administrative privileges (ADMIN)
 */
export function canManageUsers(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'ADMIN';
}

/**
 * Checks if a staff user has comment moderation privileges (EDITOR, ADMIN)
 */
export function canModerate(role?: UserRole | null): boolean {
  if (!role) return false;
  return role === 'EDITOR' || role === 'ADMIN';
}

/**
 * Enforces staff privileges or throws an explicit Authorization Error
 */
export async function requireStaff(): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    throw new Error('UNAUTHORIZED_STAFF: Verified Staff account (WRITER, EDITOR, ADMIN) required.');
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
