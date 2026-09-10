import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized: Staff authentication required.' }, { status: 401 });
  }

  try {
    // 1. Fetch all roles
    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('is_system', { ascending: false })
      .order('name', { ascending: true });

    if (rolesErr) {
      return NextResponse.json({ error: rolesErr.message }, { status: 500 });
    }

    // 2. Fetch all permissions
    const { data: permissions, error: permsErr } = await supabaseAdmin
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('code', { ascending: true });

    if (permsErr) {
      return NextResponse.json({ error: permsErr.message }, { status: 500 });
    }

    // 3. Fetch role_permissions mappings
    const { data: rolePerms, error: rpErr } = await supabaseAdmin
      .from('role_permissions')
      .select('role_id, permission_id');

    if (rpErr) {
      return NextResponse.json({ error: rpErr.message }, { status: 500 });
    }

    // 4. Fetch user counts per role
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role_id');

    const countsByRoleId: Record<string, number> = {};
    (userRoles || []).forEach(ur => {
      countsByRoleId[ur.role_id] = (countsByRoleId[ur.role_id] || 0) + 1;
    });

    // Map permissions map by permission_id
    const permsById = new Map((permissions || []).map(p => [p.id, p]));

    // Map role_permissions by role_id
    const permsByRoleId = new Map<string, any[]>();
    (rolePerms || []).forEach(rp => {
      const p = permsById.get(rp.permission_id);
      if (p) {
        const list = permsByRoleId.get(rp.role_id) || [];
        list.push(p);
        permsByRoleId.set(rp.role_id, list);
      }
    });

    const enrichedRoles = (roles || []).map(r => ({
      ...r,
      permissions: permsByRoleId.get(r.id) || [],
      user_count: countsByRoleId[r.id] || 0,
    }));

    return NextResponse.json({
      roles: enrichedRoles,
      allPermissions: permissions || [],
      isSuperAdmin: isSuperAdmin(currentUser.role, currentUser.email),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch RBAC data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !isSuperAdmin(currentUser.role, currentUser.email)) {
    return NextResponse.json(
      { error: 'Forbidden: Exclusively Super Admin / Owner can create roles.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, display_name, description, permission_ids } = body;

    if (!name || !display_name) {
      return NextResponse.json(
        { error: 'Role identifier (name) and display title are required.' },
        { status: 400 }
      );
    }

    const cleanName = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_');

    // Insert role
    const { data: newRole, error: roleErr } = await supabaseAdmin
      .from('roles')
      .insert({
        name: cleanName,
        display_name: display_name.trim(),
        description: description?.trim() || null,
        is_system: false,
      })
      .select('*')
      .single();

    if (roleErr || !newRole) {
      return NextResponse.json(
        { error: roleErr?.message || 'Failed to create role' },
        { status: 400 }
      );
    }

    // Insert permissions if provided
    if (Array.isArray(permission_ids) && permission_ids.length > 0) {
      const permsToInsert = permission_ids.map(pid => ({
        role_id: newRole.id,
        permission_id: pid,
      }));

      await supabaseAdmin.from('role_permissions').insert(permsToInsert);
    }

    await logAuditEvent({
      actor: currentUser,
      action: 'ROLE_CREATED',
      entityType: 'ROLE',
      entityId: newRole.id,
      metadata: { role_name: cleanName, display_name },
    });

    return NextResponse.json({ role: newRole }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error creating role' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !isSuperAdmin(currentUser.role, currentUser.email)) {
    return NextResponse.json(
      { error: 'Forbidden: Exclusively Super Admin / Owner can modify roles.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, display_name, description, permission_ids } = body;

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required.' }, { status: 400 });
    }

    // Fetch existing role
    const { data: existingRole, error: fetchErr } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingRole) {
      return NextResponse.json({ error: 'Role not found.' }, { status: 404 });
    }

    // Update role display metadata
    const updateData: any = {};
    if (display_name) updateData.display_name = display_name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedRole, error: updateErr } = await supabaseAdmin
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Synchronize permissions if provided (and not SUPER_ADMIN)
    if (Array.isArray(permission_ids)) {
      if (existingRole.name !== 'SUPER_ADMIN') {
        // Delete existing permissions for this role
        await supabaseAdmin.from('role_permissions').delete().eq('role_id', id);

        // Insert selected permissions
        if (permission_ids.length > 0) {
          const permsToInsert = permission_ids.map(pid => ({
            role_id: id,
            permission_id: pid,
          }));
          await supabaseAdmin.from('role_permissions').insert(permsToInsert);
        }
      }
    }

    await logAuditEvent({
      actor: currentUser,
      action: 'ROLE_UPDATED',
      entityType: 'ROLE',
      entityId: id,
      metadata: { role_name: existingRole.name, display_name },
    });

    return NextResponse.json({ role: updatedRole });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error updating role' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || !isSuperAdmin(currentUser.role, currentUser.email)) {
    return NextResponse.json(
      { error: 'Forbidden: Exclusively Super Admin / Owner can delete roles.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Role ID is required.' }, { status: 400 });
    }

    // Check if role is system role
    const { data: role, error: fetchErr } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !role) {
      return NextResponse.json({ error: 'Role not found.' }, { status: 404 });
    }

    if (role.is_system) {
      return NextResponse.json(
        { error: `Cannot delete system role "${role.display_name}". System roles are protected.` },
        { status: 400 }
      );
    }

    // Reassign any users on this role to 'WRITER' before deleting
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'WRITER', custom_role_id: null })
      .eq('custom_role_id', id);

    // Delete role (cascades to role_permissions and user_roles)
    const { error: delErr } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    await logAuditEvent({
      actor: currentUser,
      action: 'ROLE_DELETED',
      entityType: 'ROLE',
      entityId: id,
      metadata: { role_name: role.name },
    });

    return NextResponse.json({ success: true, message: `Role "${role.display_name}" deleted.` });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error deleting role' }, { status: 500 });
  }
}
