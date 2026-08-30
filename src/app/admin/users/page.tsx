import React from 'react';
import { prisma, ensureDatabaseSeeded } from '../../../lib/db';
import { UserRole } from '../../../types';
import { Users, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

export default async function AdminUsersPage() {
  await ensureDatabaseSeeded();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { articles: true, bookmarks: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-border pb-4">
        <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
          ACCESS CONTROL & IDENTITY
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
          User Directory & RBAC Roles
        </h1>
        <p className="text-xs font-mono text-text-tertiary mt-0.5">
          Role-based permissions hierarchy (`USER` &lt; `AUTHOR` &lt; `EDITOR` &lt; `ADMIN`) and MFA security status.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-[11px] font-mono font-bold uppercase text-text-tertiary">
                <th className="p-4">USER & IDENTITY</th>
                <th className="p-4">ROLE</th>
                <th className="p-4 text-center">MFA STATUS</th>
                <th className="p-4 text-right">ARTICLES</th>
                <th className="p-4 text-right">JOINED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-display font-bold text-sm">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm text-text-primary font-display">
                          {user.name}
                        </div>
                        <div className="text-xs font-mono text-text-tertiary">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : user.role === 'EDITOR'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : user.role === 'AUTHOR'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {user.mfaEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        <CheckCircle2 size={12} />
                        <span>MFA ACTIVE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-text-tertiary">OPTIONAL</span>
                    )}
                  </td>

                  <td className="p-4 text-right font-mono text-xs font-bold text-text-primary">
                    {user._count.articles}
                  </td>

                  <td className="p-4 text-right font-mono text-xs text-text-tertiary">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
