import { prisma } from './db';
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
    return await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId: entityId || null,
        actorId: actor?.id || null,
        actorEmail: actor?.email || null,
        actorRole: actor?.role || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipHash: ipHash || '127.0.0.1',
        userAgent: userAgent || 'Server Internal',
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}
