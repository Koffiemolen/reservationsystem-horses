import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateCsrfRequest, requiresCsrfValidation, csrfErrorResponse } from './csrf-middleware'
import { checkRateLimit } from './rate-limit-middleware'

/**
 * Options for security middleware validation
 */
interface ValidationOptions {
  skipCsrf?: boolean       // Skip CSRF validation
  skipRateLimit?: boolean  // Skip rate limit check
}

/**
 * Composite security middleware
 * Validates both CSRF tokens and rate limits
 *
 * This is the main entry point for API route protection.
 * Add this to the top of your API route handlers:
 *
 * @example
 * ```typescript
 * import { validateSecurityMiddleware } from '@/security'
 *
 * export async function POST(request: Request) {
 *   const securityError = await validateSecurityMiddleware(request)
 *   if (securityError) return securityError
 *
 *   // Your business logic here...
 * }
 * ```
 *
 * @param request - The incoming request
 * @param options - Optional validation options
 * @returns NextResponse with error or null if all checks passed
 */
export async function validateSecurityMiddleware(
  request: Request,
  options?: ValidationOptions
): Promise<NextResponse | null> {
  // Get current session
  const session = await auth()

  // STEP 1: Check CSRF for mutation requests
  if (!options?.skipCsrf && requiresCsrfValidation(request)) {
    const csrfResult = await validateCsrfRequest(request)

    if (!csrfResult.valid) {
      return csrfErrorResponse(csrfResult.error!)
    }
  }

  // STEP 2: Check rate limits
  if (!options?.skipRateLimit) {
    const rateLimitResult = await checkRateLimit(request, session)

    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!
    }
  }

  // All security checks passed
  return null
}

/**
 * Validate security for GET requests (rate limit only)
 * Convenience function for read-only endpoints
 *
 * @param request - The incoming request
 * @returns NextResponse with error or null if check passed
 */
export async function validateGetSecurity(request: Request): Promise<NextResponse | null> {
  return validateSecurityMiddleware(request, { skipCsrf: true })
}

/**
 * Validate security for mutations (CSRF + rate limit)
 * Convenience function for POST/PATCH/DELETE endpoints
 *
 * @param request - The incoming request
 * @returns NextResponse with error or null if checks passed
 */
export async function validateMutationSecurity(request: Request): Promise<NextResponse | null> {
  return validateSecurityMiddleware(request)
}

// Re-export for convenience
export { requiresCsrfValidation, validateCsrfRequest, csrfErrorResponse } from './csrf-middleware'
export { checkRateLimit, getRateLimitConfig, getClientIp } from './rate-limit-middleware'
