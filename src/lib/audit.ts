import { supabaseAdmin } from './supabase/admin';
import { UserProfile } from '../types';

interface LogAuditParams {
  action: string;
  entityType: string;
  entityId?: string | null;
  actor?: UserProfile | null;
  metadata?: Record<string, unknown> | null;
  ipHash?: string;
  userAgent?: string;
}

export async function logAuditEvent({
  action,
  entityType,
  entityId,
  actor,
  metadata,
  ipHash,
  userAgent,
}: LogAuditParams) {
  try {
    const { data, error } = await supabaseAdmin.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      actor_id: actor?.id && actor.id.includes('-') && actor.id.length === 36 ? actor.id : null,
      actor_email: actor?.email || null,
      actor_role: actor?.role || null,
      metadata: metadata || null,
      ip_hash: ipHash || '127.0.0.1',
      user_agent: userAgent || 'Server Internal',
    });

    if (error) {
      console.warn('Supabase logAuditEvent notice:', error);
    }
    return data;
  } catch (error) {
    console.error('Failed to write audit log to Supabase:', error);
    return null;
  }
}
