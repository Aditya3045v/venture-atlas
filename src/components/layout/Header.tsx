'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bookmark, Shield, Menu, X, SlidersHorizontal, UserCircle, Home } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { useToast } from '../providers/ToastProvider';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { NavigationItem } from '@/types';

const DEFAULT_LINKS: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '/', orderNum: 0, isActive: true },
  { id: 'unicorn', label: 'Unicorn', href: '/categories/unicorn', orderNum: 1, isActive: true },
  { id: 'failure', label: 'Failure', href: '/categories/failure', orderNum: 2, isActive: true },
  { id: 'finance', label: 'Finance', href: '/categories/finance', orderNum: 3, isActive: true },
  { id: 'crypto', label: 'Crypto Web3', href: '/categories/crypto-web3', orderNum: 4, isActive: true },
  { id: 'bio', label: 'Founder Biography', href: '/categories/founder-biography', orderNum: 5, isActive: true },
  { id: 'cases', label: 'Case Studies', href: '/case-studies', orderNum: 6, isActive: true },
  { id: 'blogs', label: 'Blogs', href: '/blogs', orderNum: 7, isActive: true },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { toast } = useToast();
  const { isDark, setTheme } = useTheme();
  const { setModalOpen } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavigationItem[]>(DEFAULT_LINKS);

  useEffect(() => {
    let isMounted = true;
    async function loadNav() {
      try {
        const res = await fetch('/api/navigation');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.items) && data.items.length > 0) {
            setNavLinks(data.items);
          }
        }
      } catch {
        // Fallback to DEFAULT_LINKS
      }
    }
    loadNav();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <header className="sticky top-0 z-40 w-full border-b border-border/80 ios-glass transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Left: Official Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <Link href={pathname === '/landing' ? '/landing' : '/'} className="flex items-center group py-1.5" title="Venture Atlas">
            {/* Dark Mode Logo */}
            <img
              src="/logo-dark.png"
              alt="Venture Atlas"
              className="hidden dark:block h-10 sm:h-12 md:h-13 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            {/* Light Mode Logo */}
            <img
              src="/logo-light.png"
              alt="Venture Atlas"
              className="block dark:hidden h-10 sm:h-12 md:h-13 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links (with Home button first) */}
          <nav className="hidden lg:flex items-center gap-1 pl-6 border-l border-border/60">
            {navLinks.map(link => {
              const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
              const isHome = link.href === '/';

              return (
                <Link
                  key={link.id || link.href}
                  href={link.href}
                  onClick={e => handleNavClick(e, link.href)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted/60'
                  }`}
                >
                  {isHome && <Home size={13} className={isActive ? 'text-black' : 'text-text-tertiary'} />}
                  <span>{link.label}</span>
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
            onClick={e => handleNavClick(e, '/search')}
            className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            <Search size={18} />
          </Link>

          {/* Bookmarks */}
          <Link
            href="/bookmarks"
            aria-label="Bookmarks"
            onClick={e => handleNavClick(e, '/bookmarks')}
            className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90 relative"
          >
            <Bookmark size={18} />
          </Link>

          {/* Accessibility Settings Trigger */}
          <button
            onClick={() => setModalOpen(true)}
            aria-label="Accessibility settings"
            title="Accessibility & Font Settings"
            className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Animated Theme Toggle with View Transitions API */}
          <AnimatedThemeToggler
            theme={isDark ? 'dark' : 'light'}
            onThemeChange={t => setTheme(t === 'dark')}
            duration={450}
            variant="circle"
          />

          {/* Account Profile Access */}
          <Link
            href="/account"
            aria-label="Account"
            title="Account Settings"
            onClick={e => handleNavClick(e, '/account')}
            className="p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            <UserCircle size={18} />
          </Link>

          {/* Admin CMS Access */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-surface-muted hover:bg-border/60 text-text-primary border border-border/70 transition-all shadow-xs ml-1 active:scale-95"
          >
            <Shield size={13} className="text-text-primary" />
            <span>Admin</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted ml-1"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Header: Directly Visible Cells Below Header (with Home button first) */}
      <div className="lg:hidden w-full border-t border-border/50 bg-surface/95 dark:bg-[#0c0d0e]/95 backdrop-blur-md px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5 scroll-smooth">
        {navLinks.map(link => {
          const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
          const isHome = link.href === '/';

          return (
            <Link
              key={link.id || link.href}
              href={link.href}
              onClick={e => handleNavClick(e, link.href)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-black font-black shadow-xs'
                  : 'bg-surface-muted/90 text-text-secondary hover:text-text-primary border border-border/60'
              }`}
            >
              {isHome && <Home size={13} className={isActive ? 'text-black' : 'text-text-tertiary'} />}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface px-4 py-3 space-y-1 animate-fadeIn">
          {navLinks.map(link => {
            const isHome = link.href === '/';
            return (
              <Link
                key={link.id || link.href}
                href={link.href}
                onClick={e => {
                  setMobileMenuOpen(false);
                  handleNavClick(e, link.href);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface-muted"
              >
                {isHome && <Home size={15} className="text-amber-400" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
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
