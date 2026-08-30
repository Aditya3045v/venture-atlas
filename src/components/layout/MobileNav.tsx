'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Newspaper, LayoutGrid, Bookmark, UserCircle } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { label: 'Feed', href: '/', icon: <Newspaper size={19} /> },
    { label: 'Desks', href: '/categories/startups', icon: <LayoutGrid size={19} /> },
    { label: 'Saved', href: '/bookmarks', icon: <Bookmark size={19} /> },
    { label: 'Account', href: '/account', icon: <UserCircle size={19} /> },
  ];

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass border-t border-border/80 px-6 py-2 flex items-center justify-around select-none">
      {items.map(item => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
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
