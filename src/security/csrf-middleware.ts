import { NextResponse } from 'next/server'
import { validateCsrfTokens, isCsrfEnabled } from '@/lib/csrf'

/**
 * Check if a request requires CSRF validation
 * @param request - The incoming request
 * @returns True if CSRF validation is required
 */
export function requiresCsrfValidation(request: Request): boolean {
  const { method, url } = request
  const pathname = new URL(url).pathname

  // CSRF only required for state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return false
  }

  // Exclude Next Auth callback (handled by Auth.js)
  if (pathname.startsWith('/api/auth/callback') || pathname.startsWith('/api/auth/signin')) {
    return false
  }

  return true
}

/**
 * Validate CSRF tokens from request
 * Compares X-CSRF-Token header with signature cookie:
 * - Production: __Host-csrf-token (requires Secure flag)
 * - Development: csrf-token-signature (HTTP compatible)
 *
 * @param request - The incoming request
 * @returns Promise<ValidationResult> - Validation result with error message if invalid
 */
export async function validateCsrfRequest(request: Request): Promise<{
  valid: boolean
  error?: string
}> {
  // Check if CSRF is enabled
  if (!isCsrfEnabled()) {
    return { valid: true }
  }

  // Extract header token
  const headerToken = request.headers.get('X-CSRF-Token')
  if (!headerToken) {
    return {
      valid: false,
      error: 'CSRF_MISSING'
    }
  }

  // Extract cookie signature
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) {
    return {
      valid: false,
      error: 'CSRF_COOKIE_MISSING'
    }
  }

  // Parse CSRF signature cookie (contains HMAC signature)
  // In production: __Host-csrf-token
  // In development: csrf-token-signature (cannot use __Host- without Secure flag)
  const isDevelopment = process.env.NODE_ENV === 'development'
  const cookieName = isDevelopment ? 'csrf-token-signature' : '__Host-csrf-token'
  const cookiePattern = new RegExp(`${cookieName}=([^;]+)`)
  const cookieMatch = cookieHeader.match(cookiePattern)

  if (!cookieMatch) {
    return {
      valid: false,
      error: 'CSRF_COOKIE_MISSING'
    }
  }

  const signature = cookieMatch[1]

  // Validate signature matches token
  const isValid = await validateCsrfTokens(signature, headerToken)
  if (!isValid) {
    return {
      valid: false,
      error: 'CSRF_INVALID'
    }
  }

  return { valid: true }
}

/**
 * Error messages in Dutch
 */
const ERROR_MESSAGES: Record<string, string> = {
  CSRF_MISSING: 'Beveiligingstoken ontbreekt',
  CSRF_COOKIE_MISSING: 'Beveiligingstoken cookie ontbreekt',
  CSRF_INVALID: 'Ongeldig beveiligingstoken',
  CSRF_EXPIRED: 'Beveiligingstoken verlopen. Herlaad de pagina.'
}

/**
 * Generate error response for CSRF validation failures
 * @param error - Error code
 * @returns NextResponse with 403 status
 */
export function csrfErrorResponse(error: string): NextResponse {
  const message = ERROR_MESSAGES[error] || 'Beveiligingsfout'

  // Log for monitoring
  console.warn('CSRF validation failed:', {
    error,
    timestamp: new Date().toISOString()
  })

  return NextResponse.json(
    { error: message },
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}
