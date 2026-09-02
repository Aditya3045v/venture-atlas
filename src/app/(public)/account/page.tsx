import React from 'react';
import { getCurrentUser } from '@/lib/auth/staff';
import { getReader } from '@/lib/auth/reader';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AccountViewClient } from '@/components/account/AccountViewClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const staffUser = await getCurrentUser();
  const reader = await getReader();

  let type: 'STAFF' | 'READER' | 'ANONYMOUS' = 'ANONYMOUS';
  let bookmarkCount = 0;
  let articleCount = 0;
  let readerRecord: { email: string; readerId: string; status: string; createdAt?: string } | null = null;

  const supabase = createServerSupabaseClient();

  if (staffUser) {
    type = 'STAFF';
    // Query real bookmarks count for this staff member
    const { count: bmCount } = await supabase
      .from('bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', staffUser.id);
    bookmarkCount = bmCount || 0;

    // Query real articles count created by this staff member
    const { count: artCount } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', staffUser.id);
    articleCount = artCount || 0;
  } else if (reader) {
    type = 'READER';
    // Query real bookmarks count for this reader
    const { count: bmCount } = await supabase
      .from('bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('reader_id', reader.readerId);
    bookmarkCount = bmCount || 0;

    // Query newsletter subscriber row for subscription status
    const { data: subData } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('status, created_at')
      .eq('email', reader.email)
      .single();

    readerRecord = {
      email: reader.email,
      readerId: reader.readerId,
      status: subData?.status || 'ACTIVE',
      createdAt: subData?.created_at,
    };
  }

  return (
    <AccountViewClient
      initialData={{
        type,
        staffUser: staffUser
          ? {
              id: staffUser.id,
              email: staffUser.email,
              name: staffUser.name,
              role: staffUser.role,
              createdAt: (staffUser as any).createdAt ? new Date((staffUser as any).createdAt).toISOString() : new Date().toISOString(),
            }
          : null,
        reader: readerRecord,
        bookmarkCount,
        articleCount,
      }}
    />
  );
}
