import React from 'react';
import { fetchAdminAuditLogs } from '@/lib/supabase-db';
import { formatDistanceToNow, format } from 'date-fns';

export const revalidate = 0;

export default async function AdminAuditPage() {
  const logs = await fetchAdminAuditLogs();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-border pb-4">
        <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
          COMPLIANCE & TRACEABILITY
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
          Security & Editorial Audit Trail
        </h1>
        <p className="text-xs font-mono text-text-tertiary mt-0.5">
          Immutable ledger of all publication transitions, administrative actions, and identity access events.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-[11px] font-mono font-bold uppercase text-text-tertiary">
                <th className="p-4">ACTION</th>
                <th className="p-4">ACTOR / IDENTITY</th>
                <th className="p-4">ENTITY</th>
                <th className="p-4">DETAILS / PAYLOAD</th>
                <th className="p-4 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-text-primary bg-surface-muted px-2 py-1 rounded border border-border">
                      {log.action}
                    </span>
                  </td>

                  <td className="p-4 text-text-secondary">
                    <div className="font-semibold text-text-primary">{log.actorEmail || 'System'}</div>
                    {log.actorRole && (
                      <div className="text-[10px] text-brand font-bold uppercase">{log.actorRole}</div>
                    )}
                  </td>

                  <td className="p-4 text-text-secondary">
                    <span className="font-bold uppercase text-text-primary">{log.entityType}</span>
                    {log.entityId && (
                      <div className="text-[10px] text-text-tertiary truncate max-w-[120px]">
                        {log.entityId}
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-text-tertiary max-w-xs truncate">
                    {typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : log.metadata || '—'}
                  </td>

                  <td className="p-4 text-right text-text-tertiary whitespace-nowrap">
                    <div>{format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}</div>
                    <div className="text-[10px]">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
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
