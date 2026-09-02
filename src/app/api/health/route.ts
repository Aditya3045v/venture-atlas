import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'connected';
  let dbLatencyMs = 0;
  let dbError = null;

  try {
    const dbStart = Date.now();
    const { count, error } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true });

    dbLatencyMs = Date.now() - dbStart;

    if (error) {
      dbStatus = 'degraded';
      dbError = error.message;
    }
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err?.message || 'Database ping exception';
  }

  const uptimeSeconds = process.uptime ? Math.floor(process.uptime()) : 0;
  const memoryUsage = process.memoryUsage ? process.memoryUsage() : null;

  const isHealthy = dbStatus === 'connected' || dbStatus === 'degraded';

  return NextResponse.json(
    {
      status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
      service: 'venture-atlas-api',
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
      system: {
        uptimeSeconds,
        memory: memoryUsage
          ? {
              heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
              rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
            }
          : null,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
