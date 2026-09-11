import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized: Staff clearance required.' }, { status: 401 });
  }

  try {
    // 1. Fetch all user profiles with their custom role info
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*, roles:custom_role_id(id, name, display_name)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Fetch all available roles for assignment
    const { data: roles } = await supabaseAdmin
      .from('roles')
      .select('id, name, display_name, is_system')
      .order('name', { ascending: true });

    return NextResponse.json({
      users: profiles || [],
      roles: roles || [],
      isSuperAdmin: isSuperAdmin(currentUser.role, currentUser.email),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !isSuperAdmin(currentUser.role, currentUser.email)) {
    return NextResponse.json(
      { error: 'Forbidden: Exclusively the Super Admin / Owner can create new user accounts.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { email, password, name, role, role_id } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password policy: Access key must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Resolve role from database safely
    let assignedRoleId = typeof role_id === 'string' && role_id.trim() ? role_id.trim() : null;
    let assignedRoleName = (role || 'WRITER').toUpperCase();

    if (assignedRoleId) {
      const { data: roleRow } = await supabaseAdmin
        .from('roles')
        .select('id, name')
        .eq('id', assignedRoleId)
        .maybeSingle();
      if (roleRow) {
        assignedRoleName = roleRow.name;
      } else {
        assignedRoleId = null;
      }
    }

    if (!assignedRoleId) {
      const { data: roleRow } = await supabaseAdmin
        .from('roles')
        .select('id, name')
        .eq('name', assignedRoleName)
        .maybeSingle();
      if (roleRow) {
        assignedRoleId = roleRow.id;
      }
    }

    // 1. Create user in Supabase Auth (with graceful update if already registered)
    let userId: string;
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim(), role: assignedRoleName },
      app_metadata: { role: assignedRoleName },
    });

    if (authError || !authUser?.user) {
      if (
        authError?.message?.toLowerCase().includes('already') ||
        authError?.message?.toLowerCase().includes('registered')
      ) {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
        if (existingUser) {
          userId = existingUser.id;
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password,
            user_metadata: { name: name.trim(), role: assignedRoleName },
            app_metadata: { role: assignedRoleName },
          });
        } else {
          return NextResponse.json(
            { error: authError?.message || 'Failed to create user in authentication provider.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: authError?.message || 'Failed to create user in authentication provider.' },
          { status: 400 }
        );
      }
    } else {
      userId = authUser.user.id;
    }

    // 2. Upsert profile in public.profiles
    let finalProfile: any = null;
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: assignedRoleName,
        custom_role_id: assignedRoleId || null,
        is_active: true,
        plan: 'ENTERPRISE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*, roles:custom_role_id(id, name, display_name)')
      .maybeSingle();

    if (profileError || !profile) {
      const { data: basicProfile, error: basicErr } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: cleanEmail,
          name: name.trim(),
          role: assignedRoleName,
          custom_role_id: assignedRoleId || null,
          is_active: true,
          plan: 'ENTERPRISE',
        })
        .select('*')
        .single();

      if (basicErr) {
        return NextResponse.json(
          { error: `User created but profile sync failed: ${basicErr.message}` },
          { status: 500 }
        );
      }
      finalProfile = basicProfile;
    } else {
      finalProfile = profile;
    }

    // 3. Assign role in public.user_roles
    if (assignedRoleId) {
      try {
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: assignedRoleId,
            assigned_by: currentUser.id,
          });
      } catch {}
    }

    await logAuditEvent({
      actor: currentUser,
      action: 'USER_CREATED',
      entityType: 'USER',
      entityId: userId,
      metadata: { targetEmail: cleanEmail, assignedRole: assignedRoleName, targetName: name },
    });

    return NextResponse.json({ success: true, user: profile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !isSuperAdmin(currentUser.role, currentUser.email)) {
    return NextResponse.json(
      { error: 'Forbidden: Exclusively the Super Admin / Owner can modify users and roles.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, role, role_id, name, bio, password, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
    }

    // Check target user
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, role')
      .eq('id', id)
      .single();

    const isTargetRootAdmin = targetProfile?.email === 'admin@ventureatlas.in';

    // Prevent modifying the root admin's core role or deactivating root admin
    if (isTargetRootAdmin && is_active === false) {
      return NextResponse.json(
        { error: 'SECURITY_RESTRICTION: The Super Admin / Owner account cannot be deactivated.' },
        { status: 403 }
      );
    }

    if (isTargetRootAdmin && role && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'SECURITY_RESTRICTION: The Super Admin / Owner account must remain SUPER_ADMIN.' },
        { status: 403 }
      );
    }

    // Resolve new role if specified
    let assignedRoleId = role_id;
    let assignedRoleName = role?.toUpperCase();

    if (assignedRoleId) {
      const { data: rRow } = await supabaseAdmin
        .from('roles')
        .select('id, name')
        .eq('id', assignedRoleId)
        .single();
      if (rRow) {
        assignedRoleName = rRow.name;
      }
    } else if (assignedRoleName) {
      const { data: rRow } = await supabaseAdmin
        .from('roles')
        .select('id, name')
        .eq('name', assignedRoleName)
        .single();
      if (rRow) {
        assignedRoleId = rRow.id;
      }
    }

    const authUpdates: any = {};

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password policy: Access key must be at least 8 characters long.' },
          { status: 400 }
        );
      }
      authUpdates.password = password;
    }

    const metadataUpdates: any = {};
    if (assignedRoleName) metadataUpdates.role = assignedRoleName;
    if (name) metadataUpdates.name = name.trim();
    if (Object.keys(metadataUpdates).length > 0) {
      authUpdates.user_metadata = metadataUpdates;
      if (assignedRoleName) authUpdates.app_metadata = { role: assignedRoleName };
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      if (authErr) {
        return NextResponse.json({ error: `Auth sync failed: ${authErr.message}` }, { status: 400 });
      }
    }

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (assignedRoleName) updatePayload.role = assignedRoleName;
    if (assignedRoleId !== undefined) updatePayload.custom_role_id = assignedRoleId;
    if (name) updatePayload.name = name.trim();
    if (bio !== undefined) updatePayload.bio = bio;
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select('*, roles:custom_role_id(id, name, display_name)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Sync user_roles junction table
    if (assignedRoleId) {
      await supabaseAdmin.from('user_roles').delete().eq('user_id', id);
      await supabaseAdmin.from('user_roles').insert({
        user_id: id,
        role_id: assignedRoleId,
        assigned_by: currentUser.id,
      });
    }

    await logAuditEvent({
      actor: currentUser,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: id,
      metadata: { newRole: assignedRoleName, newName: name, is_active },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !isSuperAdmin(currentUser.role, currentUser.email)) {
    return NextResponse.json(
      { error: 'Forbidden: Exclusively the Super Admin / Owner can delete user accounts.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting root admin account
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (targetProfile?.email === 'admin@ventureatlas.in') {
      return NextResponse.json(
        { error: 'SECURITY_RESTRICTION: The Super Admin / Owner account cannot be deleted.' },
        { status: 403 }
      );
    }

    if (id === currentUser.id) {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: You cannot delete your own active account.' },
        { status: 403 }
      );
    }

    // Clean up junction table
    await supabaseAdmin.from('user_roles').delete().eq('user_id', id);

    // Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', id);

    // Delete auth user
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch {}

    await logAuditEvent({
      actor: currentUser,
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: id,
      metadata: { deletedUserId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete user' }, { status: 500 });
  }
}
