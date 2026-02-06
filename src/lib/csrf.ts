const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Get the secret key for CSRF token encryption
 * Uses AUTH_SECRET from environment variables
 */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required for CSRF protection')
  }
  return secret
}

/**
 * Generate a cryptographically secure CSRF token using Web Crypto API
 * Compatible with Edge Runtime (Next.js middleware)
 * @returns 64-character hex string (32 bytes of randomness)
 */
export function generateCsrfToken(): string {
  // Use Web Crypto API (available in Edge Runtime)
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)

  // Convert to hex string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Simplified CSRF token encryption using HMAC-SHA256
 * Edge Runtime compatible (no Node crypto module)
 *
 * @param token - The plaintext CSRF token
 * @param secret - The encryption secret (from AUTH_SECRET)
 * @returns HMAC signature of the token
 */
export async function encryptCsrfToken(token: string, secret: string): Promise<string> {
  try {
    // Convert secret to key material
    const encoder = new TextEncoder()
    const keyMaterial = encoder.encode(secret)

    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Sign the token
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(token)
    )

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(signature))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    console.error('CSRF token encryption failed:', error)
    throw new Error('Failed to encrypt CSRF token')
  }
}

/**
 * Validate CSRF token using HMAC verification
 *
 * @param signature - The HMAC signature to verify
 * @param token - The plaintext token
 * @param secret - The encryption secret (from AUTH_SECRET)
 * @returns True if signature is valid
 */
export async function verifyCsrfToken(
  signature: string,
  token: string,
  secret: string
): Promise<boolean> {
  try {
    // Generate expected signature
    const expected = await encryptCsrfToken(token, secret)

    // Constant-time comparison
    return timingSafeEqual(expected, signature)
  } catch (error) {
    return false
  }
}

/**
 * Validate that header token matches cookie signature
 * @param signature - HMAC signature from __Host-csrf-token cookie
 * @param headerToken - Plaintext token from X-CSRF-Token header
 * @returns Promise<boolean> - True if tokens match
 */
export async function validateCsrfTokens(
  signature: string,
  headerToken: string
): Promise<boolean> {
  try {
    const secret = getSecret()
    return await verifyCsrfToken(signature, headerToken, secret)
  } catch (error) {
    return false
  }
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks by always comparing full strings
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Create Set-Cookie headers for CSRF tokens
 * Creates two cookies:
 * 1. __Host-csrf-token (prod) or csrf-token-signature (dev): HTTP-only, HMAC signature (server-side validation)
 * 2. csrf-token: Readable by JS (client-side access)
 *
 * Note: __Host- prefix requires Secure flag, so we use a different name in development
 *
 * @param token - The plaintext CSRF token
 * @returns Promise<string[]> - Array of Set-Cookie header strings
 */
export async function createCsrfCookies(token: string): Promise<string[]> {
  const secret = getSecret()
  const signature = await encryptCsrfToken(token, secret)

  // Cookie attributes
  const maxAge = 86400 // 24 hours
  const sameSite = 'Lax'
  const secure = isDevelopment ? '' : 'Secure; '
  const path = 'Path=/'

  // Use __Host- prefix only in production (requires Secure flag)
  const signatureCookieName = isDevelopment ? 'csrf-token-signature' : '__Host-csrf-token'

  return [
    // HTTP-only signed cookie (for server validation)
    `${signatureCookieName}=${signature}; HttpOnly; ${secure}SameSite=${sameSite}; ${path}; Max-Age=${maxAge}`,

    // Readable cookie (for client access)
    `csrf-token=${token}; ${secure}SameSite=${sameSite}; ${path}; Max-Age=${maxAge}`
  ]
}

/**
 * Check if CSRF protection is enabled
 * Can be disabled via DISABLE_CSRF=true env var (for testing)
 */
export function isCsrfEnabled(): boolean {
  return process.env.DISABLE_CSRF !== 'true'
}
