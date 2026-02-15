import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { generateCsrfToken, createCsrfCookies } from '@/lib/csrf'

// Paths that require authentication
const protectedPaths = ['/agenda', '/profiel', '/reserveringen']
const adminPaths = ['/admin']
const authPaths = ['/login', '/registreren', '/wachtwoord-vergeten', '/wachtwoord-reset']

export default auth(async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session from auth
  const session = (request as any).auth

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
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
