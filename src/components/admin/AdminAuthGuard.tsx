'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { StaffUser } from '@/lib/auth/staff';
import type { UserRole } from '@/types';
import type { Session } from '@supabase/supabase-js';
import { Shield, Loader2 } from 'lucide-react';

interface AdminAuthContextType {
  user: StaffUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

interface AdminAuthGuardProps {
  children: React.ReactNode;
  initialUser?: StaffUser | null;
}

export function AdminAuthGuard({ children, initialUser }: AdminAuthGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(initialUser || null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(!!initialUser);

  const syncAdminCookie = useCallback((isActive: boolean) => {
    try {
      if (isActive) {
        document.cookie = 'va_admin_session=1; path=/; max-age=2592000; SameSite=Lax';
      } else {
        document.cookie = 'va_admin_session=; path=/; max-age=0; SameSite=Lax';
      }
    } catch {}
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    syncAdminCookie(false);
    setUser(null);
    setSession(null);
    setIsAuthorized(false);
    window.location.href = '/admin/login';
  }, [syncAdminCookie]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const checkAndRestoreSession = async () => {
      try {
        // 1. Restore the existing Supabase session using getSession()
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error || !currentSession || !currentSession.user) {
          if (!initialUser) {
            syncAdminCookie(false);
            if (isMounted) {
              setLoading(false);
              setIsAuthorized(false);
            }
            router.replace('/admin/login');
            return;
          }
          if (isMounted) {
            setLoading(false);
            setIsAuthorized(true);
          }
          return;
        }

        const authUser = currentSession.user;
        const isRootAdmin = authUser.email === 'admin@ventureatlas.in';
        const metaRole = (authUser.user_metadata?.role || authUser.app_metadata?.role) as UserRole | undefined;

        let resolvedRole: UserRole | null = (isRootAdmin ? 'ADMIN' : (metaRole || null)) as UserRole | null;
        let resolvedName = authUser.user_metadata?.name || (isRootAdmin ? 'Venture Atlas Root Admin' : 'Staff Member');

        // Fallback profile check if role not yet in metadata
        if (!resolvedRole || !['ADMIN', 'EDITOR', 'WRITER'].includes(resolvedRole)) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name')
            .eq('id', authUser.id)
            .single();

          if (profile?.role && ['ADMIN', 'EDITOR', 'WRITER'].includes(profile.role)) {
            resolvedRole = profile.role as UserRole;
            if (profile.name) resolvedName = profile.name;
          }
        }

        if (isRootAdmin || (resolvedRole && ['ADMIN', 'EDITOR', 'WRITER'].includes(resolvedRole))) {
          const finalRole: UserRole = resolvedRole || 'ADMIN';
          const staffUser: StaffUser = {
            id: authUser.id,
            email: authUser.email || '',
            name: resolvedName,
            role: finalRole,
            avatar: null,
            plan: 'ENTERPRISE',
            bio: null,
            mfaEnabled: false,
          };

          if (isMounted) {
            setUser(staffUser);
            setSession(currentSession);
            setIsAuthorized(true);
            setLoading(false);
          }
          syncAdminCookie(true);
        } else {
          syncAdminCookie(false);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setIsAuthorized(false);
            setLoading(false);
          }
          router.replace('/admin/login');
        }
      } catch (err) {
        console.warn('[AdminAuthGuard] Error restoring session:', err);
        if (initialUser && isMounted) {
          setIsAuthorized(true);
          setLoading(false);
        } else if (isMounted) {
          setLoading(false);
          router.replace('/admin/login');
        }
      }
    };

    checkAndRestoreSession();

    // 2. Centralized listener for auth state changes (token refresh, signout, cross-tab sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || (!newSession && event !== 'INITIAL_SESSION')) {
        syncAdminCookie(false);
        setUser(null);
        setSession(null);
        setIsAuthorized(false);
        setLoading(false);
        router.replace('/admin/login');
      } else if (newSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setSession(newSession);
        syncAdminCookie(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialUser, router, syncAdminCookie]);

  if (isAuthorized && user) {
    return (
      <AdminAuthContext.Provider value={{ user, session, loading, signOut }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-14 h-14 rounded-3xl bg-surface border border-border flex items-center justify-center shadow-card text-amber-500">
            <Shield size={28} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin text-amber-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                Verifying Clearance
              </span>
            </div>
            <p className="text-[11px] font-mono text-text-tertiary">
              Restoring authenticated Supabase session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
