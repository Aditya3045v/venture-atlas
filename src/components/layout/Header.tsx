'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bookmark, Moon, Sun, Shield, Menu, X, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useAccessibility } from '../providers/AccessibilityProvider';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { setModalOpen } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Feed', href: '/' },
    { label: 'Startups', href: '/categories/startups' },
    { label: 'Crypto', href: '/categories/crypto' },
    { label: 'Funding', href: '/categories/funding' },
    { label: 'Venture Capital', href: '/categories/venture-capital' },
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'Blogs', href: '/blogs' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 ios-glass transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Official Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group py-1">
            {/* Dark Mode Logo */}
            <img
              src="/logo-dark.png"
              alt="Venture Atlas"
              className="hidden dark:block h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            {/* Light Mode Logo */}
            <img
              src="/logo-light.png"
              alt="Venture Atlas"
              className="block dark:hidden h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 pl-5 border-l border-border/60">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Search Trigger */}
          <Link
            href="/search"
            aria-label="Search"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            <Search size={17} />
          </Link>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            aria-label="Bookmarks"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90 relative"
          >
            <Bookmark size={17} />
          </Link>

          {/* Accessibility Settings Trigger */}
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Accessibility settings"
            title="Accessibility & Font Settings"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            <SlidersHorizontal size={17} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* Admin CMS Access */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-surface-muted hover:bg-border/60 text-text-primary border border-border/70 transition-all shadow-xs ml-1 active:scale-95"
          >
            <Shield size={13} className="text-text-primary" />
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted ml-1"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 py-3 space-y-1 animate-fadeIn">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface-muted"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-text-primary p-2"
            >
              <SlidersHorizontal size={15} />
              <span>Accessibility</span>
            </button>

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-text-primary p-2"
            >
              <Shield size={15} />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
