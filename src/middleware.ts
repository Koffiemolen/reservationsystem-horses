import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { generateCsrfToken, createCsrfCookies } from '@/lib/csrf'
import { rateLimitStore, isRateLimitEnabled } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'

// Paths that require authentication
const protectedPaths = ['/agenda', '/profiel', '/reserveringen']
const adminPaths = ['/admin']
const authPaths = ['/login', '/register', '/wachtwoord-vergeten', '/wachtwoord-reset']

// Auth callback paths that need rate limiting at middleware level
const rateLimitedAuthPaths = ['/api/auth/callback/credentials', '/api/auth/signin']

export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session from auth
  const session = (request as any).auth

  // Rate limit login attempts at middleware level (before NextAuth processes them)
  if (request.method === 'POST' && rateLimitedAuthPaths.some(p => pathname.startsWith(p))) {
    if (isRateLimitEnabled()) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
        || request.headers.get('x-real-ip')
        || 'unknown'
      const key = `ip:${ip}:login`
      const result = await rateLimitStore.hit(key, RATE_LIMITS.AUTH_PUBLIC)

      if (!result.success) {
        const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000)
        return NextResponse.json(
          { error: 'Te veel inlogpogingen. Probeer het later opnieuw.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSeconds),
              'X-RateLimit-Limit': String(result.limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.floor(result.reset / 1000)),
            },
          }
        )
      }
    }
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  )

  // Inject CSRF token cookie on page loads (GET requests, non-API routes)
  if (request.method === 'GET' && !pathname.startsWith('/api')) {
    const csrfToken = generateCsrfToken()
    const cookies = await createCsrfCookies(csrfToken)
    cookies.forEach(cookie => response.headers.append('Set-Cookie', cookie))
  }

  // Handle authentication redirects
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // Redirect authenticated users away from auth pages
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/agenda', request.url))
  }

  // Redirect unauthenticated users to login for protected paths
  if (!session && (isProtectedPath || isAdminPath)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin access
  if (isAdminPath && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/agenda', request.url))
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
