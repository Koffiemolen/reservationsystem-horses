import { NextResponse } from 'next/server'
import { type Session } from 'next-auth'
import { rateLimitStore, isRateLimitEnabled, type RateLimitResult } from '@/lib/rate-limit'
import { RATE_LIMITS, type RateLimitConfig } from '@/lib/constants'

/**
 * Get rate limit configuration for a given pathname
 *
 * @param pathname - The API pathname
 * @param session - The current session (if authenticated)
 * @returns Rate limit config or null if no limiting needed
 */
export function getRateLimitConfig(
  pathname: string,
  session: Session | null
): RateLimitConfig | null {
  // Authentication endpoints (public, IP-based)
  if (
    pathname === '/api/auth/register' ||
    pathname === '/api/auth/forgot-password' ||
    pathname === '/api/auth/reset-password'
  ) {
    return RATE_LIMITS.AUTH_PUBLIC
  }

  // Contact form (public, IP-based)
  if (pathname === '/api/contact') {
    return RATE_LIMITS.CONTACT
  }

  // Admin mutations (user-based, higher limits)
  if (session?.user?.role === 'ADMIN') {
    if (
      pathname.startsWith('/api/blocks') ||
      pathname.startsWith('/api/events') ||
      pathname.startsWith('/api/users/')
    ) {
      return RATE_LIMITS.ADMIN_MUTATION
    }
  }

  // User mutations (user-based)
  if (session?.user) {
    if (
      pathname.startsWith('/api/reservations') ||
      pathname.startsWith('/api/users/')
    ) {
      return RATE_LIMITS.USER_MUTATION
    }
  }

  // Public read endpoints (IP-based)
  if (
    pathname === '/api/events/public' ||
    pathname.startsWith('/api/calendar/') ||
    pathname.startsWith('/api/admin/dashboard')
  ) {
    return RATE_LIMITS.PUBLIC_READ
  }

  // No rate limiting for other endpoints
  return null
}

/**
 * Extract client IP address from request
 * Checks X-Forwarded-For, X-Real-IP, and falls back to 'unknown'
 *
 * @param request - The incoming request
 * @returns IP address string
 */
export function getClientIp(request: Request): string {
  // Check X-Forwarded-For (Vercel, Cloudflare, nginx)
  const forwardedFor = request.headers.get('X-Forwarded-For')
  if (forwardedFor) {
    // Take first IP if multiple
    return forwardedFor.split(',')[0].trim()
  }

  // Check X-Real-IP (nginx)
  const realIp = request.headers.get('X-Real-IP')
  if (realIp) {
    return realIp.trim()
  }

  // Fallback to unknown (shouldn't happen in production)
  return 'unknown'
}

/**
 * Generate rate limit key for request
 * Format: ${prefix}:${identifier}:${pathname}
 *
 * @param request - The incoming request
 * @param session - The current session
 * @param config - Rate limit configuration
 * @returns Unique rate limit key
 */
export function getRateLimitKey(
  request: Request,
  session: Session | null,
  config: RateLimitConfig
): string {
  const { pathname } = new URL(request.url)

  // User-based rate limiting
  if (config.keyPrefix === 'user' && session?.user?.id) {
    return `user:${session.user.id}:${pathname}`
  }

  // IP-based rate limiting (fallback and for public endpoints)
  const ip = getClientIp(request)
  return `ip:${ip}:${pathname}`
}

/**
 * Check rate limit for request
 * Returns error response if limit exceeded
 *
 * @param request - The incoming request
 * @param session - The current session
 * @returns Object with allowed status and optional error response
 */
export async function checkRateLimit(
  request: Request,
  session: Session | null
): Promise<{ allowed: boolean; response?: NextResponse }> {
  // Check if rate limiting is enabled
  if (!isRateLimitEnabled()) {
    return { allowed: true }
  }

  const { pathname } = new URL(request.url)

  // Get configuration for this endpoint
  const config = getRateLimitConfig(pathname, session)
  if (!config) {
    // No rate limiting configured for this endpoint
    return { allowed: true }
  }

  // Generate unique key
  const key = getRateLimitKey(request, session, config)

  // Check rate limit
  const result = await rateLimitStore.hit(key, config)

  if (!result.success) {
    // Rate limit exceeded - log and return error
    const ip = getClientIp(request)
    console.warn('[Rate Limit] Limit exceeded:', {
      pathname,
      key: config.keyPrefix,
      identifier: config.keyPrefix === 'user' ? session?.user?.id : ip,
      limit: result.limit,
      timestamp: new Date().toISOString()
    })

    // Calculate retry-after in seconds
    const retryAfterMs = result.reset - Date.now()
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)

    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.floor(result.reset / 1000))
          }
        }
      )
    }
  }

  // Rate limit check passed
  return { allowed: true }
}

/**
 * Apply rate limit headers to a successful response
 * Useful for adding rate limit info to all responses
 *
 * @param response - The response to modify
 * @param result - Rate limit result
 * @returns Modified response with rate limit headers
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)))

  return response
}
