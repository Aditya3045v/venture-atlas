/**
 * Staff Authentication & Authorization Entrypoint
 * Strictly delegates to src/lib/auth/staff.ts.
 * NO fallback users, NO cookie hacks, NO default admin bypass.
 */

export {
  getCurrentUser,
  canEdit,
  canPublish,
  canManageUsers,
  canModerate,
  requireStaff,
  requireAdmin,
  type StaffUser,
  type StaffRole,
} from './auth/staff';
