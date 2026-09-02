import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Briefcase,
  FolderTree,
  Image as ImageIcon,
  Users,
  BarChart3,
  History,
  ArrowLeft,
  PlusCircle,
  MessageSquare,
  Compass,
  Globe,
  Newspaper,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !canEdit(user.role)) {
    redirect('/admin/login');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Navigation Panel', href: '/admin/navigation', icon: <Compass size={18} /> },
    { label: 'News Briefs', href: '/admin/articles', icon: <FileText size={18} /> },
    { label: 'Case Studies', href: '/admin/case-studies', icon: <Briefcase size={18} /> },
    { label: 'Long-Form Essays', href: '/admin/blogs', icon: <BookOpen size={18} /> },
    { label: 'Categories & Desks', href: '/admin/categories', icon: <FolderTree size={18} /> },
    { label: 'Media Library', href: '/admin/media', icon: <ImageIcon size={18} /> },
    { label: 'User Roles & RBAC', href: '/admin/users', icon: <Users size={18} /> },
    { label: 'Comments Moderation', href: '/admin/comments', icon: <MessageSquare size={18} /> },
    { label: 'Readership Analytics', href: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Audit Logs', href: '/admin/audit', icon: <History size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface p-4 flex flex-col justify-between shrink-0 select-none">
        <div className="space-y-5">
          {/* Admin Brand Header */}
          <div className="space-y-2 pb-3 border-b border-border">
            <Link href="/admin" className="block">
              <img
                src="/logo-dark.png"
                alt="Venture Atlas"
                className="hidden dark:block h-7 w-auto object-contain"
              />
              <img
                src="/logo-light.png"
                alt="Venture Atlas"
                className="block dark:hidden h-7 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-tertiary">
                ADMIN CONTROL
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-surface-muted text-text-primary border border-border">
                {user.role}
              </span>
            </div>
          </div>

          {/* Quick Actions: Landing Page & Live News Feed Links */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface-muted/60 border border-border">
              <Link
                href="/landing"
                className="py-1.5 px-2 rounded-xl bg-surface hover:bg-border/60 text-[11px] font-mono font-bold uppercase text-text-primary flex items-center justify-center gap-1.5 transition-all shadow-xs border border-border/80 active:scale-95"
                title="Go to Landing Page"
              >
                <Globe size={13} className="text-blue-500" />
                <span>Landing</span>
              </Link>
              <Link
                href="/"
                className="py-1.5 px-2 rounded-xl bg-surface hover:bg-border/60 text-[11px] font-mono font-bold uppercase text-text-primary flex items-center justify-center gap-1.5 transition-all shadow-xs border border-border/80 active:scale-95"
                title="Go to Live News Feed"
              >
                <Newspaper size={13} className="text-amber-500" />
                <span>Feed</span>
              </Link>
            </div>

            {/* Quick Create Action */}
            <Link
              href="/admin/articles/new"
              className="w-full py-2.5 px-3 rounded-full bg-text-primary text-background text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
            >
              <PlusCircle size={15} />
              <span>+ New Short Brief</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 max-h-[42vh] overflow-y-auto no-scrollbar">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase font-mono text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
              >
                <span className="text-text-tertiary">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Info, Direct Public Navigation & Sign Out */}
        <div className="pt-4 border-t border-border space-y-2 mt-4">
          <div className="text-xs font-mono text-text-tertiary truncate">
            Logged as: <span className="font-bold text-text-primary">{user.name}</span>
          </div>

          <div className="space-y-1.5">
            <Link
              href="/landing"
              className="w-full py-1.5 px-3 rounded-full border border-border bg-surface-muted text-xs font-mono font-bold uppercase text-text-primary hover:bg-border/60 flex items-center justify-center gap-2 transition-colors"
            >
              <Globe size={13} className="text-blue-500" />
              <span>Visit Landing Page</span>
            </Link>
            <Link
              href="/"
              className="w-full py-1.5 px-3 rounded-full border border-border bg-surface-muted text-xs font-mono font-bold uppercase text-text-primary hover:bg-border/60 flex items-center justify-center gap-2 transition-colors"
            >
              <Newspaper size={13} className="text-amber-500" />
              <span>Visit News Feed</span>
            </Link>
          </div>

          <Link
            href="/admin/signout"
            className="w-full py-1.5 px-3 rounded-full border border-red-500/30 bg-red-500/5 text-xs font-mono font-bold uppercase text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
