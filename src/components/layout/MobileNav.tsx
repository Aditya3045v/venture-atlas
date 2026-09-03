'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, BarChart3, Bookmark, UserCircle } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { toast } = useToast();

  const items = [
    { label: 'Feed', href: '/', icon: <Newspaper size={19} /> },
    { label: 'Polls', href: '/polls', icon: <BarChart3 size={19} /> },
    { label: 'Saved', href: '/bookmarks', icon: <Bookmark size={19} /> },
    { label: 'Account', href: '/account', icon: <UserCircle size={19} /> },
  ];

  if (pathname.startsWith('/admin')) return null;

  const handleNavClick = (e: React.MouseEvent, targetHref: string) => {
    if (pathname === '/landing' && !targetHref.startsWith('/admin')) {
      e.preventDefault();
      toast('Please enter your email on the landing page first to unlock the news feed!', 'info');
      const input = document.getElementById('work-email-input');
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass border-t border-border/80 px-6 py-2 flex items-center justify-around select-none">
      {items.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={e => handleNavClick(e, item.href)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 active:scale-95 ${
              isActive ? 'text-text-primary font-bold' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
