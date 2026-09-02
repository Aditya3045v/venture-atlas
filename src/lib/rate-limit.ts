import { supabaseAdmin } from '@/lib/supabase/admin';

export interface RateLimitOptions {
  windowMs: number; // in milliseconds
  maxRequests: number; // max hits allowed in window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // in seconds
}

/**
 * PostgreSQL-backed atomic rate limiter.
 * Operates across all serverless instances using public.rate_limits table
 * and public.check_rate_limit stored SQL function.
 */
export async function checkRateLimitAsync(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, maxRequests: 30 }
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));

  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: identifier,
      p_limit: options.maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error || !data || !data[0]) {
      console.warn('Postgres rate limit check fallback:', error?.message);
      return {
        success: true,
        limit: options.maxRequests,
        remaining: options.maxRequests,
        reset: windowSeconds,
      };
    }

    const row = data[0];
    return {
      success: Boolean(row.allowed),
      limit: options.maxRequests,
      remaining: Number(row.remaining),
      reset: Number(row.reset_seconds),
    };
  } catch (err: any) {
    console.error('Database rate limit exception:', err.message);
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests,
      reset: windowSeconds,
    };
  }
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, maxRequests: 30 }
): RateLimitResult {
  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests,
    reset: Math.ceil(options.windowMs / 1000),
  };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
