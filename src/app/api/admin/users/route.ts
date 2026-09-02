import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canManageUsers } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: profiles || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, full name, and role are required.' },
        { status: 400 }
      );
    }

    const COMMON_PASSWORDS = new Set([
      'password12345', 'admin12345678', 'ventureatlas1', '123456789012',
      'qwertyuiop12', 'administrator1', 'letmein123456', 'welcome123456',
    ]);

    if (password.length < 12) {
      return NextResponse.json(
        { error: 'Password policy: Access key must be at least 12 characters long.' },
        { status: 400 }
      );
    }

    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      return NextResponse.json(
        { error: 'Password policy: Common or easily guessable passwords are not permitted.' },
        { status: 400 }
      );
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigitOrSpecial = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasUpper || !hasLower || !hasDigitOrSpecial) {
      return NextResponse.json(
        { error: 'Password policy: Password must contain uppercase, lowercase, and numbers or symbols.' },
        { status: 400 }
      );
    }

    if (!['WRITER', 'EDITOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Assignable staff roles are WRITER, EDITOR, or ADMIN.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Create auth user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role },
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user in authentication provider.' },
        { status: 400 }
      );
    }

    const userId = authUser.user.id;

    // 2. Upsert profile in public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: `User authenticated but profile failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 3. Log to audit_logs
    await logAuditEvent({
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: userId,
      actor: currentUser,
      metadata: { targetEmail: cleanEmail, assignedRole: role, targetName: name },
    });

    return NextResponse.json({ success: true, user: profile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, role, name, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
    }

    // Admin CANNOT change their own role (prevent accidental lockout)
    if (id === currentUser.id && role && role !== currentUser.role) {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: Administrators cannot alter their own role assignment.' },
        { status: 403 }
      );
    }

    if (role && !['WRITER', 'EDITOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Assignable staff roles are WRITER, EDITOR, or ADMIN.' },
        { status: 400 }
      );
    }

    if (password) {
      if (password.length < 12) {
        return NextResponse.json(
          { error: 'Password policy: Access key must be at least 12 characters long.' },
          { status: 400 }
        );
      }
      const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
      if (pwErr) {
        return NextResponse.json({ error: `Password update failed: ${pwErr.message}` }, { status: 400 });
      }
      await logAuditEvent({
        action: 'PASSWORD_RESET',
        entityType: 'USER',
        entityId: id,
        actor: currentUser,
        metadata: { resetBy: currentUser.email },
      });
    }

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (role) updatePayload.role = role;
    if (name) updatePayload.name = name;

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (role || name) {
      await logAuditEvent({
        action: 'UPDATE_USER_ROLE',
        entityType: 'USER',
        entityId: id,
        actor: currentUser,
        metadata: { newRole: role, newName: name },
      });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Cannot delete yourself
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: You cannot delete your own administrator account.' },
        { status: 403 }
      );
    }

    // Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    // Delete auth user
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => null);

    await logAuditEvent({
      action: 'DELETE_USER',
      entityType: 'USER',
      entityId: id,
      actor: currentUser,
      metadata: { deletedUserId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete user' }, { status: 500 });
  }
}
