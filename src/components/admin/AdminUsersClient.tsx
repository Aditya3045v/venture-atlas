'use client';

import React, { useState } from 'react';
import { UserRole, PermissionItem, RoleItem } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import { adminFetch } from '@/lib/api/adminClient';
import {
  UserPlus,
  Shield,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  X,
  Mail,
  User,
  Key,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Plus,
  Sliders,
  Check,
  AlertTriangle,
  Users,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminUsersClientProps {
  initialUsers: any[];
  initialRoles: RoleItem[];
  allPermissions: PermissionItem[];
  isSuperAdmin: boolean;
  currentUserRole: string;
}

export const AdminUsersClient: React.FC<AdminUsersClientProps> = ({
  initialUsers,
  initialRoles,
  allPermissions,
  isSuperAdmin,
  currentUserRole,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Users State
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Roles State
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);

  // Add User Modal
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRoleId, setAddRoleId] = useState(roles[3]?.id || roles[0]?.id || '');
  const [addPassword, setAddPassword] = useState('');
  const [addBio, setAddBio] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit User Modal
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  // Create Role Modal
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDisplayName, setNewRoleDisplayName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermIds, setNewRolePermIds] = useState<string[]>([]);
  const [createRoleLoading, setCreateRoleLoading] = useState(false);

  // Configure Role Permissions Modal
  const [configRoleModalOpen, setConfigRoleModalOpen] = useState(false);
  const [configuringRole, setConfiguringRole] = useState<RoleItem | null>(null);
  const [configDisplayName, setConfigDisplayName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [configRoleLoading, setConfigRoleLoading] = useState(false);

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc: Record<string, PermissionItem[]>, p) => {
    acc[p.module] = acc[p.module] || [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const MODULE_LABELS: Record<string, { label: string; icon: string }> = {
    users: { label: 'Users & Staff', icon: '👥' },
    roles: { label: 'Roles & RBAC', icon: '🔐' },
    articles: { label: 'News Briefs (60-Word)', icon: '⚡' },
    case_studies: { label: 'Case Studies', icon: '💼' },
    blogs: { label: 'Long-Form Essays', icon: '📖' },
    categories: { label: 'Categories & Desks', icon: '🗂️' },
    media: { label: 'Media Library', icon: '🖼️' },
    comments: { label: 'Reader Comments', icon: '💬' },
    navigation: { label: 'Navigation Bars', icon: '🧭' },
    analytics: { label: 'Analytics & Readership', icon: '📊' },
    audit: { label: 'Audit Logs', icon: '📜' },
  };

  // --- Handlers: User Management ---

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast('Permission Denied: Only Super Admin can create users.', 'error');
      return;
    }
    if (!addName || !addEmail || !addPassword) {
      toast('Name, email, and access password are required', 'error');
      return;
    }

    if (addPassword.length < 8) {
      toast('Password must be at least 8 characters long', 'error');
      return;
    }

    setAddLoading(true);
    try {
      const selectedRole = roles.find(r => r.id === addRoleId) || roles.find(r => r.name === 'WRITER') || roles[0];
      const effectiveRoleId = selectedRole?.id || (addRoleId && addRoleId.trim() ? addRoleId.trim() : undefined);
      const effectiveRoleName = selectedRole?.name || 'WRITER';

      const res = await adminFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim().toLowerCase(),
          role_id: effectiveRoleId,
          role: effectiveRoleName,
          bio: addBio || null,
          password: addPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        toast(`Successfully created ${data.user.name}`, 'success');
        setUsers([data.user, ...users]);
        setAddUserModalOpen(false);
        setAddName('');
        setAddEmail('');
        setAddPassword('');
        setAddBio('');
      } else {
        toast(data.error || 'Failed to create user', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const openEditUserModal = (u: any) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditRoleId(u.custom_role_id || roles.find(r => r.name === u.role)?.id || '');
    setEditBio(u.bio || '');
    setEditIsActive(u.is_active !== false);
    setEditPassword('');
    setEditUserModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast('Permission Denied: Only Super Admin can update users.', 'error');
      return;
    }
    if (!editingUser) return;
    if (!editName.trim()) {
      toast('Full name is required', 'error');
      return;
    }
    if (editPassword && editPassword.length < 8) {
      toast('New password must be at least 8 characters long', 'error');
      return;
    }

    setEditLoading(true);
    try {
      const selectedRole = roles.find(r => r.id === editRoleId);
      const payload: any = {
        id: editingUser.id,
        name: editName.trim(),
        role_id: editRoleId,
        role: selectedRole?.name,
        bio: editBio.trim() || null,
        is_active: editIsActive,
      };
      if (editPassword) {
        payload.password = editPassword;
      }

      const res = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        toast(`Updated profile & role for ${editName}`, 'success');
        setUsers(prev => prev.map(u => (u.id === editingUser.id ? { ...u, ...data.user } : u)));
        setEditUserModalOpen(false);
      } else {
        toast(data.error || 'Failed to update user', 'error');
      }
    } catch {
      toast('Network error updating user', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    if (!isSuperAdmin) {
      toast('Only Super Admin can toggle account status.', 'error');
      return;
    }
    if (user.email === 'admin@ventureatlas.in') {
      toast('Cannot deactivate the Super Admin / Owner account.', 'error');
      return;
    }

    const nextStatus = !user.is_active;
    try {
      const res = await adminFetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          is_active: nextStatus,
        }),
      });

      if (res.ok) {
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, is_active: nextStatus } : u)));
        toast(nextStatus ? `Account activated` : `Account deactivated`, 'success');
      } else {
        const d = await res.json();
        toast(d.error || 'Failed to update status', 'error');
      }
    } catch {
      toast('Error toggling account status', 'error');
    }
  };

  const handleDeleteUser = async (id: string, userName: string, userEmail: string) => {
    if (!isSuperAdmin) {
      toast('Only Super Admin can delete user accounts.', 'error');
      return;
    }
    if (userEmail === 'admin@ventureatlas.in') {
      toast('Cannot delete the root Super Admin / Owner account.', 'error');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete ${userName} (${userEmail})?`)) return;

    try {
      const res = await adminFetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        toast(`User ${userName} deleted`, 'info');
      } else {
        const d = await res.json();
        toast(d.error || 'Failed to delete user', 'error');
      }
    } catch {
      toast('Error deleting user', 'error');
    }
  };

  // --- Handlers: RBAC Roles & Permissions ---

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast('Permission Denied: Only Super Admin can create custom roles.', 'error');
      return;
    }
    if (!newRoleName || !newRoleDisplayName) {
      toast('Role identifier and display name are required.', 'error');
      return;
    }

    setCreateRoleLoading(true);
    try {
      const res = await adminFetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          display_name: newRoleDisplayName,
          description: newRoleDescription,
          permission_ids: newRolePermIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.role) {
        toast(`Custom role "${newRoleDisplayName}" created successfully!`, 'success');
        const enriched = {
          ...data.role,
          permissions: allPermissions.filter(p => newRolePermIds.includes(p.id)),
          user_count: 0,
        };
        setRoles([...roles, enriched]);
        setCreateRoleModalOpen(false);
        setNewRoleName('');
        setNewRoleDisplayName('');
        setNewRoleDescription('');
        setNewRolePermIds([]);
      } else {
        toast(data.error || 'Failed to create role', 'error');
      }
    } catch {
      toast('Network error creating role', 'error');
    } finally {
      setCreateRoleLoading(false);
    }
  };

  const openConfigRoleModal = (role: RoleItem) => {
    setConfiguringRole(role);
    setConfigDisplayName(role.display_name);
    setConfigDescription(role.description || '');
    setSelectedPermIds((role.permissions || []).map(p => p.id));
    setConfigRoleModalOpen(true);
  };

  const handleSaveRolePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast('Permission Denied: Only Super Admin can modify role permissions.', 'error');
      return;
    }
    if (!configuringRole) return;

    setConfigRoleLoading(true);
    try {
      const res = await adminFetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: configuringRole.id,
          display_name: configDisplayName,
          description: configDescription,
          permission_ids: selectedPermIds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast(`Permissions updated for role "${configDisplayName}"`, 'success');
        setRoles(prev =>
          prev.map(r =>
            r.id === configuringRole.id
              ? {
                  ...r,
                  display_name: configDisplayName,
                  description: configDescription,
                  permissions: allPermissions.filter(p => selectedPermIds.includes(p.id)),
                }
              : r
          )
        );
        setConfigRoleModalOpen(false);
      } else {
        toast(data.error || 'Failed to update role permissions', 'error');
      }
    } catch {
      toast('Network error updating role', 'error');
    } finally {
      setConfigRoleLoading(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (!isSuperAdmin) {
      toast('Only Super Admin can delete custom roles.', 'error');
      return;
    }
    if (role.is_system) {
      toast(`Cannot delete system role "${role.display_name}". System roles are protected.`, 'error');
      return;
    }
    if (!confirm(`Are you sure you want to delete role "${role.display_name}"? Assigned users will default to Staff Writer.`)) {
      return;
    }

    try {
      const res = await adminFetch(`/api/admin/roles?id=${role.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRoles(prev => prev.filter(r => r.id !== role.id));
        toast(`Role "${role.display_name}" deleted`, 'info');
      } else {
        const d = await res.json();
        toast(d.error || 'Failed to delete role', 'error');
      }
    } catch {
      toast('Error deleting role', 'error');
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleNewRolePermission = (permId: string) => {
    setNewRolePermIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const toggleAllModulePerms = (modulePerms: PermissionItem[], isConfiguring = true) => {
    const permIds = modulePerms.map(p => p.id);
    if (isConfiguring) {
      const allSelected = permIds.every(id => selectedPermIds.includes(id));
      if (allSelected) {
        setSelectedPermIds(prev => prev.filter(id => !permIds.includes(id)));
      } else {
        setSelectedPermIds(prev => Array.from(new Set([...prev, ...permIds])));
      }
    } else {
      const allSelected = permIds.every(id => newRolePermIds.includes(id));
      if (allSelected) {
        setNewRolePermIds(prev => prev.filter(id => !permIds.includes(id)));
      } else {
        setNewRolePermIds(prev => Array.from(new Set([...prev, ...permIds])));
      }
    }
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'bg-amber-400/20 text-amber-500 border border-amber-400/40 font-black';
      case 'ADMIN':
        return 'bg-purple-500/15 text-purple-500 border border-purple-500/30';
      case 'EDITOR':
        return 'bg-blue-500/15 text-blue-500 border border-blue-500/30';
      case 'WRITER':
        return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30';
      case 'REVIEWER':
        return 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/30';
      case 'MEDIA_MANAGER':
        return 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30';
      default:
        return 'bg-surface-muted text-text-secondary border border-border';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Super Admin Access Control Banner */}
      <div className="p-4 rounded-3xl bg-surface border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-display font-bold uppercase text-text-primary tracking-wide">
                Role-Based Access Control (RBAC)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-amber-400 text-black">
                SUPABASE SYNCED
              </span>
            </div>
            <p className="text-[11px] font-mono text-text-tertiary mt-0.5">
              Source of truth: Supabase PostgreSQL tables (<code className="text-text-secondary">roles</code>, <code className="text-text-secondary">permissions</code>, <code className="text-text-secondary">user_roles</code>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>SUPER ADMIN CLEARANCE ACTIVE</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-surface-muted border border-border text-text-tertiary text-xs font-mono">
              Role: <span className="font-bold text-text-primary">{currentUserRole}</span> (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-text-primary text-background shadow-xs'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Users size={14} />
            <span>Staff & User Directory ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-text-primary text-background shadow-xs'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Layers size={14} />
            <span>Roles & Permissions Matrix ({roles.length})</span>
          </button>
        </div>

        {isSuperAdmin && (
          <div>
            {activeTab === 'users' ? (
              <button
                onClick={() => setAddUserModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all active:scale-95 shadow-xs"
              >
                <UserPlus size={15} />
                <span>+ Add Staff Member</span>
              </button>
            ) : (
              <button
                onClick={() => setCreateRoleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all active:scale-95 shadow-xs"
              >
                <Plus size={15} />
                <span>+ Create Custom Role</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS DIRECTORY                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, or role..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-tertiary">Role Filter:</span>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Roles ({users.length})</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>
                    {r.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl border border-border bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/60 text-[10px] font-mono font-bold uppercase text-text-tertiary">
                    <th className="p-4">USER & IDENTITY</th>
                    <th className="p-4 text-center">ROLE</th>
                    <th className="p-4 text-center">STATUS</th>
                    <th className="p-4">TITLE / BIO</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs font-mono text-text-tertiary">
                        No staff members found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isRootAdmin = u.email === 'admin@ventureatlas.in';
                      return (
                        <tr key={u.id} className="hover:bg-surface-muted/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-surface-muted border border-border flex items-center justify-center font-display font-black text-xs text-text-primary shrink-0">
                                {u.name ? u.name.slice(0, 2).toUpperCase() : 'VA'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-text-primary font-display">
                                    {u.name}
                                  </span>
                                  {isRootAdmin && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase bg-amber-400 text-black">
                                      OWNER
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-mono text-text-tertiary">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${getRoleBadgeStyle(
                                u.role
                              )}`}
                            >
                              {u.roles?.display_name || u.role}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            {u.is_active !== false ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Deactivated
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-xs font-sans text-text-secondary max-w-xs truncate">
                            {u.bio || 'Staff Member'}
                          </td>

                          <td className="p-4 text-right">
                            {isSuperAdmin ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditUserModal(u)}
                                  className="p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors border border-border"
                                  title="Edit Profile & Assign Role"
                                >
                                  <Edit size={14} />
                                </button>
                                {!isRootAdmin && (
                                  <>
                                    <button
                                      onClick={() => handleToggleUserStatus(u)}
                                      className={`p-1.5 rounded-xl transition-colors border ${
                                        u.is_active !== false
                                          ? 'text-amber-500 hover:bg-amber-500/10 border-amber-500/30'
                                          : 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/30'
                                      }`}
                                      title={u.is_active !== false ? 'Deactivate Account' : 'Activate Account'}
                                    >
                                      {u.is_active !== false ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.name, u.email)}
                                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors border border-rose-500/30"
                                      title="Delete Account"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-text-tertiary">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLES & PERMISSIONS MATRIX                                         */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(r => {
              const isSuper = r.name === 'SUPER_ADMIN';
              const permCount = isSuper ? allPermissions.length : r.permissions?.length || 0;

              return (
                <div
                  key={r.id}
                  className={`p-5 rounded-3xl border bg-surface shadow-card flex flex-col justify-between space-y-4 ${
                    isSuper ? 'border-amber-400/40 ring-1 ring-amber-400/20' : 'border-border'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${getRoleBadgeStyle(r.name)}`}>
                        {r.name}
                      </span>
                      {r.is_system ? (
                        <span className="text-[10px] font-mono text-text-tertiary uppercase flex items-center gap-1">
                          <Lock size={11} /> System Role
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-blue-500 uppercase flex items-center gap-1">
                          <Sliders size={11} /> Custom Role
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-text-primary">
                        {r.display_name}
                      </h3>
                      <p className="text-xs font-sans text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                        {r.description || 'Custom administrative clearance profile.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-text-tertiary">
                      <span>Users: <strong className="text-text-primary">{r.user_count || 0}</strong></span>
                      <span>Permissions: <strong className="text-text-primary">{permCount} / {allPermissions.length}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => openConfigRoleModal(r)}
                          disabled={isSuper}
                          className="flex-1 py-2 px-3 rounded-xl bg-surface-muted hover:bg-border/60 text-xs font-mono font-bold uppercase text-text-primary border border-border flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          <Sliders size={13} />
                          <span>{isSuper ? 'All Perms Granted' : 'Edit Perms'}</span>
                        </button>
                        {!r.is_system && (
                          <button
                            onClick={() => handleDeleteRole(r)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                            title="Delete Custom Role"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-[11px] font-mono text-text-tertiary">Managed by Super Admin</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Permissions Reference Matrix */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-card space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-display font-bold text-lg text-text-primary uppercase tracking-tight">
                Complete System Permissions Matrix
              </h3>
              <p className="text-xs font-mono text-text-tertiary mt-0.5">
                Each permission enforces real Row Level Security (RLS) policies and API gateway checks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(permissionsByModule).map(([moduleKey, perms]) => {
                const meta = MODULE_LABELS[moduleKey] || { label: moduleKey, icon: '⚙️' };
                return (
                  <div key={moduleKey} className="p-4 rounded-2xl bg-surface-muted/40 border border-border space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-text-primary border-b border-border/60 pb-2">
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </div>
                    <div className="space-y-1.5">
                      {perms.map(p => (
                        <div key={p.id} className="text-xs flex items-start justify-between gap-2">
                          <span className="font-mono text-[11px] text-text-secondary">{p.code}</span>
                          <span className="text-[10px] font-sans text-text-tertiary text-right">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW STAFF USER                                                 */}
      {/* ========================================================================= */}
      {addUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold uppercase text-text-primary">
                    Create New Staff Account
                  </h3>
                  <p className="text-xs font-mono text-text-tertiary">
                    Direct Supabase Auth & Profile Provisioning
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-muted text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Staff Email (Login ID)
                </label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="name@ventureatlas.in"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Initial Access Key / Password
                </label>
                <input
                  type="password"
                  required
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  placeholder="•••••••••••• (min. 8 characters)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={addRoleId}
                  onChange={e => setAddRoleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm font-mono text-text-primary focus:outline-none focus:border-amber-400"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.display_name} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Editorial Bio / Desk (Optional)
                </label>
                <input
                  type="text"
                  value={addBio}
                  onChange={e => setAddBio(e.target.value)}
                  placeholder="e.g. Lead Crypto & Venture Analyst"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all disabled:opacity-50"
                >
                  {addLoading ? 'Creating Account...' : 'Provision Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER & ASSIGN ROLE                                            */}
      {/* ========================================================================= */}
      {editUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-display font-bold uppercase text-text-primary">
                  Edit Staff Clearance: {editingUser.name}
                </h3>
                <p className="text-xs font-mono text-text-tertiary">{editingUser.email}</p>
              </div>
              <button
                onClick={() => setEditUserModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-muted text-text-tertiary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Assigned RBAC Role
                </label>
                <select
                  value={editRoleId}
                  onChange={e => setEditRoleId(e.target.value)}
                  disabled={editingUser.email === 'admin@ventureatlas.in'}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm font-mono text-text-primary focus:outline-none focus:border-amber-400 disabled:opacity-50"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.display_name} ({r.name})
                    </option>
                  ))}
                </select>
                {editingUser.email === 'admin@ventureatlas.in' && (
                  <p className="text-[10px] font-mono text-amber-500 mt-1">
                    Super Admin / Owner role is locked and protected.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Reset Password / Access Key (Leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  placeholder="New password (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Bio / Desk
                </label>
                <input
                  type="text"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              {editingUser.email !== 'admin@ventureatlas.in' && (
                <div className="p-3.5 rounded-2xl bg-surface-muted border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase text-text-primary block">
                      Account Access Status
                    </span>
                    <span className="text-[11px] font-mono text-text-tertiary">
                      {editIsActive ? 'Account is enabled and can log in.' : 'Account is locked/deactivated.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={e => setEditIsActive(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-amber-400 focus:ring-0"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all disabled:opacity-50"
                >
                  {editLoading ? 'Saving Changes...' : 'Save Clearance Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE CUSTOM ROLE                                                 */}
      {/* ========================================================================= */}
      {createRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold uppercase text-text-primary">
                    Create Custom RBAC Role
                  </h3>
                  <p className="text-xs font-mono text-text-tertiary">
                    Define permissions and assign to any team members
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateRoleModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-muted text-text-tertiary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                    Role Identifier (Code)
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
                    placeholder="e.g. REVIEWER, ANALYST"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm font-mono text-text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                    Display Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleDisplayName}
                    onChange={e => setNewRoleDisplayName(e.target.value)}
                    placeholder="e.g. Content Reviewer"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newRoleDescription}
                  onChange={e => setNewRoleDescription(e.target.value)}
                  placeholder="Summary of what this role is authorized to perform"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <label className="text-xs font-mono font-bold uppercase text-text-primary">
                    Assign Permissions ({newRolePermIds.length} selected)
                  </label>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {Object.entries(permissionsByModule).map(([modKey, perms]) => {
                    const meta = MODULE_LABELS[modKey] || { label: modKey, icon: '⚙️' };
                    const allInModSelected = perms.every(p => newRolePermIds.includes(p.id));

                    return (
                      <div key={modKey} className="p-3 rounded-2xl bg-surface-muted/60 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase text-text-primary flex items-center gap-1.5">
                            <span>{meta.icon}</span> {meta.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllModulePerms(perms, false)}
                            className="text-[10px] font-mono text-amber-500 hover:underline"
                          >
                            {allInModSelected ? 'Deselect Module' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map(p => (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border/60 hover:border-border text-xs cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={newRolePermIds.includes(p.id)}
                                onChange={() => toggleNewRolePermission(p.id)}
                                className="rounded border-border text-amber-400 focus:ring-0"
                              />
                              <span className="font-sans text-text-primary">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleLoading}
                  className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all disabled:opacity-50"
                >
                  {createRoleLoading ? 'Creating...' : 'Save New Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURE ROLE PERMISSIONS                                         */}
      {/* ========================================================================= */}
      {configRoleModalOpen && configuringRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-display font-bold uppercase text-text-primary">
                  Configure Permissions: {configuringRole.display_name}
                </h3>
                <p className="text-xs font-mono text-text-tertiary">Role code: {configuringRole.name}</p>
              </div>
              <button
                onClick={() => setConfigRoleModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-muted text-text-tertiary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRolePermissions} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Display Title
                </label>
                <input
                  type="text"
                  required
                  value={configDisplayName}
                  onChange={e => setConfigDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={configDescription}
                  onChange={e => setConfigDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <label className="text-xs font-mono font-bold uppercase text-text-primary">
                    Active Permissions ({selectedPermIds.length} / {allPermissions.length})
                  </label>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {Object.entries(permissionsByModule).map(([modKey, perms]) => {
                    const meta = MODULE_LABELS[modKey] || { label: modKey, icon: '⚙️' };
                    const allInModSelected = perms.every(p => selectedPermIds.includes(p.id));

                    return (
                      <div key={modKey} className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase text-text-primary flex items-center gap-1.5">
                            <span>{meta.icon}</span> {meta.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllModulePerms(perms, true)}
                            className="text-[10px] font-mono text-amber-500 hover:underline"
                          >
                            {allInModSelected ? 'Deselect Module' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map(p => (
                            <label
                              key={p.id}
                              className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border/60 hover:border-border text-xs cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermIds.includes(p.id)}
                                onChange={() => togglePermission(p.id)}
                                className="rounded border-border text-amber-400 focus:ring-0"
                              />
                              <span className="font-sans text-text-primary">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfigRoleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={configRoleLoading}
                  className="px-6 py-2.5 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all disabled:opacity-50"
                >
                  {configRoleLoading ? 'Saving...' : 'Apply RBAC Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
