'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

  const syncAdminCookie = useCallback((isActive: boolean, token?: string | null, staffSession?: string | null) => {
    try {
      if (isActive) {
        document.cookie = 'va_admin_session=1; path=/; max-age=2592000; SameSite=Lax';
        if (token) {
          document.cookie = `va_admin_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
        }
        if (staffSession) {
          document.cookie = `va_staff_session=${staffSession}; path=/; max-age=2592000; SameSite=Lax`;
          try {
            localStorage.setItem('va_staff_session', staffSession);
          } catch {}
        }
      } else {
        document.cookie = 'va_admin_session=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'va_admin_token=; path=/; max-age=0; SameSite=Lax';
        document.cookie = 'va_staff_session=; path=/; max-age=0; SameSite=Lax';
        try {
          localStorage.removeItem('va_staff_session');
        } catch {}
      }
    } catch {}
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    try {
      const { createClient } = await import('@/lib/supabase/client');
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

    const checkAndRestoreSession = async () => {
      // 1. If server already validated this user (via Server Components), use it directly
      if (initialUser) {
        if (isMounted) {
          setUser(initialUser);
          setIsAuthorized(true);
          setLoading(false);
        }
        syncAdminCookie(true);
        return;
      }

      // 2. Server-side session verification via API (immune to client ISP DNS sinkholing)
      try {
        const res = await fetch('/api/admin/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (isMounted) {
              setUser(data.user);
              setIsAuthorized(true);
              setLoading(false);
            }
            syncAdminCookie(true, undefined, data.staffSession);
            return;
          }
        }
      } catch {}

      // 3. Client Supabase fallback (with 1.5s timeout so it never hangs indefinitely)
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
        const result: any = await Promise.race([sessionPromise, timeoutPromise]);

        if (result?.data?.session?.user) {
          const currentSession = result.data.session;
          const authUser = currentSession.user;
          const isRoot = authUser.email === 'admin@ventureatlas.in';
          const staffUser: StaffUser = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || (isRoot ? 'Venture Atlas Super Admin' : 'Staff Member'),
            role: (isRoot ? 'SUPER_ADMIN' : ((authUser.user_metadata?.role as UserRole) || 'WRITER')),
            avatar: null,
            plan: 'ENTERPRISE',
            bio: null,
            is_active: true,
            mfaEnabled: false,
          };
          if (isMounted) {
            setUser(staffUser);
            setSession(currentSession);
            setIsAuthorized(true);
            setLoading(false);
          }
          syncAdminCookie(true, currentSession.access_token);
          return;
        }
      } catch {}

      // 4. If all session validation fails, redirect to login
      syncAdminCookie(false);
      if (isMounted) {
        setLoading(false);
        setIsAuthorized(false);
      }
      router.replace('/admin/login');
    };

    checkAndRestoreSession();

    // 5. Optional background listener for token refresh
    let subscription: any = null;
    try {
      import('@/lib/supabase/client').then(({ createClient }) => {
        try {
          const supabase = createClient();
          const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!isMounted) return;
            if (newSession && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              setSession(newSession);
              syncAdminCookie(true, newSession.access_token);
            }
          });
          subscription = data?.subscription;
        } catch {}
      }).catch(() => {});
    } catch {}

    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
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
              Restoring authenticated editorial session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
