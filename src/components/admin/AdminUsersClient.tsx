'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import {
  UserPlus,
  Shield,
  Edit,
  Trash2,
  CheckCircle2,
  Search,
  X,
  Mail,
  User,
  Image as ImageIcon,
  Key,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminUsersClientProps {
  initialUsers: any[];
}

export const AdminUsersClient: React.FC<AdminUsersClientProps> = ({ initialUsers }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('WRITER');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');

  const filteredUsers = users.filter(
    u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('Name, email, and access password are required', 'error');
      return;
    }

    if (password.length < 12) {
      toast('Password policy: Must be at least 12 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          avatar: avatar || null,
          bio: bio || null,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        toast(`Successfully created ${role}: ${name}`, 'success');
        setUsers([data.user, ...users]);
        setModalOpen(false);
        // Reset form
        setName('');
        setEmail('');
        setRole('WRITER');
        setAvatar('');
        setBio('');
        setPassword('');
      } else {
        toast(data.error || 'Failed to create user', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        toast(`User ${userName} removed`, 'info');
      } else {
        toast('Failed to remove user', 'error');
      }
    } catch {
      toast('Error deleting user', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            ACCESS CONTROL & TEAM MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Writers & Editorial Roles
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Manage your publication team (`WRITER`, `EDITOR`, `AUTHOR`, `ADMIN`, `USER`).
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all active:scale-95 shadow-md shrink-0"
        >
          <UserPlus size={16} />
          <span>Add New Writer / Role</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by name, email, or role..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-xs font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-[11px] font-mono font-bold uppercase text-text-tertiary">
                <th className="p-4">USER & IDENTITY</th>
                <th className="p-4">ROLE</th>
                <th className="p-4">BIO / TITLE</th>
                <th className="p-4 text-right">ARTICLES</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center font-display font-black text-sm">
                          {u.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-text-primary font-display">
                          {u.name}
                        </div>
                        <div className="text-xs font-mono text-text-tertiary">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : u.role === 'EDITOR'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : u.role === 'WRITER' || u.role === 'AUTHOR'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="p-4 text-xs font-body text-text-secondary max-w-xs truncate">
                    {u.bio || 'Staff Reporter'}
                  </td>

                  <td className="p-4 text-right font-mono text-xs font-bold text-text-primary">
                    {u._count?.articles || 0}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-amber-400" />
                <h3 className="text-lg font-black font-display uppercase tracking-tight text-text-primary">
                  Create Writer / Team Member
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-text-tertiary">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aditya Poddar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-text-tertiary">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. aditya@ventureatlas.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-text-tertiary">
                    Staff Clearance Role *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-amber-400"
                  >
                    <option value="WRITER">WRITER (Create & edit own drafts)</option>
                    <option value="EDITOR">EDITOR (Edit all, publish & moderate)</option>
                    <option value="ADMIN">ADMIN (Full management & users)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono font-bold uppercase text-text-tertiary">
                    Initial Access Key (Min 12 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={12}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 12 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-text-tertiary">
                  Editorial Title / Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. Senior Silicon & Hardware Analyst"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold uppercase text-text-tertiary">
                  Avatar / Photo URL
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono text-text-primary focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all shadow-md active:scale-95"
                >
                  {loading ? 'Creating...' : 'Create Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
