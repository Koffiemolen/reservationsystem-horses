const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests allowed in window
  keyPrefix: string     // Key prefix: 'ip' or 'user'
}

/**
 * Rate limit configurations for different endpoint types
 *
 * In development, limits are 100x higher for easier testing
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Registration, password reset, forgot password (per IP)
  // Strict limits to prevent brute force and account enumeration
  AUTH_PUBLIC: {
    windowMs: 15 * 60 * 1000,           // 15 minutes
    maxRequests: isDevelopment ? 500 : 5, // 5 attempts (500 in dev)
    keyPrefix: 'ip'
  },

  // Contact form submissions (per IP)
  // Moderate limits to prevent spam
  CONTACT: {
    windowMs: 60 * 60 * 1000,             // 1 hour
    maxRequests: isDevelopment ? 300 : 3,  // 3 submissions (300 in dev)
    keyPrefix: 'ip'
  },

  // User mutations: reservations, profile updates (per user)
  // Generous limits for normal usage
  USER_MUTATION: {
    windowMs: 60 * 1000,                    // 1 minute
    maxRequests: isDevelopment ? 3000 : 30, // 30 requests (3000 in dev)
    keyPrefix: 'user'
  },

  // Admin mutations: blocks, events, user management (per user)
  // Higher limits for admin workflows
  ADMIN_MUTATION: {
    windowMs: 60 * 1000,                    // 1 minute
    maxRequests: isDevelopment ? 6000 : 60, // 60 requests (6000 in dev)
    keyPrefix: 'user'
  },

  // Public read endpoints: events, calendar (per IP)
  // Very generous to support browsing
  PUBLIC_READ: {
    windowMs: 60 * 1000,                      // 1 minute
    maxRequests: isDevelopment ? 10000 : 100, // 100 requests (10000 in dev)
    keyPrefix: 'ip'
  }
}

/**
 * Feature flags - allow disabling via environment variables
 */
export const CSRF_ENABLED = process.env.DISABLE_CSRF !== 'true'
export const RATE_LIMIT_ENABLED = process.env.DISABLE_RATE_LIMIT !== 'true'

/**
 * Error messages in Dutch
 */
export const SECURITY_ERRORS = {
  CSRF_MISSING: 'Beveiligingstoken ontbreekt',
  CSRF_INVALID: 'Ongeldig beveiligingstoken',
  CSRF_EXPIRED: 'Beveiligingstoken verlopen. Herlaad de pagina.',
  RATE_LIMIT: 'Te veel verzoeken. Probeer het later opnieuw.',
  RATE_LIMIT_WITH_TIME: (seconds: number) =>
    `Te veel verzoeken. Probeer over ${seconds} seconden opnieuw.`
}
