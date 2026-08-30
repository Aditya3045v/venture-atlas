import React from 'react';
import Link from 'next/link';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { CaseStudyItem } from '@/types';
import { Plus, Edit3, Trash2, Briefcase, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

export default async function AdminCaseStudiesPage() {
  await ensureDatabaseSeeded();

  const caseStudies = await prisma.caseStudy.findMany({
    include: {
      category: true,
      author: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            DEEP INTELLIGENCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Startup Case Studies
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Architectural teardowns, financial ledgers, and operator playbooks of breakout companies.
          </p>
        </div>

        <Link
          href="/admin/case-studies/new"
          className="px-4 py-2 rounded-full bg-text-primary text-background text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-xs self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ New Teardown</span>
        </Link>
      </div>

      {/* Case Studies Table */}
      <div className="rounded-3xl ios-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted/60 text-[11px] font-mono font-bold uppercase text-text-tertiary">
                <th className="p-4 w-5/12">COMPANY & TEARDOWN TITLE</th>
                <th className="p-4 text-center">STAGE</th>
                <th className="p-4 text-center">VALUATION</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {caseStudies.map(cs => (
                <tr key={cs.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-surface-muted text-text-primary border border-border">
                        {cs.company}
                      </span>
                    </div>
                    <Link
                      href={`/admin/case-studies/${cs.id}/edit`}
                      className="font-display font-bold text-sm text-text-primary hover:underline line-clamp-1 mt-1 block"
                    >
                      {cs.title}
                    </Link>
                  </td>

                  <td className="p-4 text-center text-xs font-mono text-text-secondary">
                    {cs.stage || 'Scale'}
                  </td>

                  <td className="p-4 text-center font-mono text-xs font-bold text-emerald-400">
                    {cs.valuation || 'Private'}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-block ${
                        cs.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-surface-muted text-text-tertiary'
                      }`}
                    >
                      {cs.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/case-studies/${cs.id}/edit`}
                        className="p-1.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
                        title="Edit case study"
                      >
                        <Edit3 size={14} />
                      </Link>
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
