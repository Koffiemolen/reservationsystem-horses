import { type RateLimitConfig, RATE_LIMIT_ENABLED } from './constants'

/**
 * Rate limit entry stored in memory
 */
interface RateLimitEntry {
  count: number         // Number of requests in current window
  windowStart: number   // Timestamp when window started
  expiresAt: number     // When this entry should be cleaned up
}

/**
 * Result returned from rate limit check
 */
export interface RateLimitResult {
  success: boolean      // Whether request is allowed
  limit: number         // Max requests allowed
  remaining: number     // Requests remaining in window
  reset: number         // Unix timestamp when limit resets
}

/**
 * In-memory rate limit store with sliding windows and LRU eviction
 *
 * This implementation uses a Map for O(1) lookups and a sliding window
 * algorithm for accurate rate limiting. Old entries are cleaned up
 * periodically to prevent memory leaks.
 */
class RateLimitStore {
  private store: Map<string, RateLimitEntry>
  private maxEntries: number
  private cleanupInterval: NodeJS.Timeout | null

  constructor(maxEntries = 10000) {
    this.store = new Map()
    this.maxEntries = maxEntries
    this.cleanupInterval = null

    // Start cleanup interval (runs every 60 seconds)
    this.startCleanup()
  }

  /**
   * Check rate limit and increment counter
   * Uses sliding window algorithm
   *
   * @param key - Unique key for this rate limit (e.g., "ip:192.168.1.1:/api/register")
   * @param config - Rate limit configuration
   * @returns Result with success status and limit info
   */
  async hit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now()
    const entry = this.store.get(key)

    // If no entry exists, create new window
    if (!entry) {
      this.store.set(key, {
        count: 1,
        windowStart: now,
        expiresAt: now + config.windowMs * 2 // Expire after 2x window
      })

      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: now + config.windowMs
      }
    }

    // Check if window has expired (sliding window)
    if (now - entry.windowStart >= config.windowMs) {
      // Reset window
      entry.count = 1
      entry.windowStart = now
      entry.expiresAt = now + config.windowMs * 2

      this.store.set(key, entry)

      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        reset: now + config.windowMs
      }
    }

    // Increment counter
    entry.count++
    this.store.set(key, entry)

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: entry.windowStart + config.windowMs
      }
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      reset: entry.windowStart + config.windowMs
    }
  }

  /**
   * Reset rate limit for a specific key
   * Useful for testing or manual resets
   *
   * @param key - The rate limit key to reset
   */
  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  /**
   * Get current store size (for monitoring)
   */
  getSize(): number {
    return this.store.size
  }

  /**
   * Start periodic cleanup of expired entries
   * Runs every 60 seconds
   */
  private startCleanup(): void {
    // Don't start cleanup in test environments
    if (process.env.NODE_ENV === 'test') {
      return
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000) // Every 60 seconds

    // Don't prevent Node from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Clean up expired entries and enforce LRU eviction
   * Removes entries where expiresAt < now
   * If store exceeds maxEntries, removes oldest entries
   */
  private cleanup(): void {
    const now = Date.now()
    let removed = 0

    // Remove expired entries
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key)
        removed++
      }
    }

    // LRU eviction if still too large
    if (this.store.size > this.maxEntries) {
      // Sort by expiresAt (oldest first) and remove oldest entries
      const entries = Array.from(this.store.entries()).sort(
        (a, b) => a[1].expiresAt - b[1].expiresAt
      )

      const toRemove = this.store.size - this.maxEntries
      for (let i = 0; i < toRemove; i++) {
        this.store.delete(entries[i][0])
        removed++
      }
    }

    // Log cleanup stats in development
    if (process.env.NODE_ENV === 'development' && removed > 0) {
      console.log(`[Rate Limit] Cleaned up ${removed} expired entries. Store size: ${this.store.size}`)
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * Singleton instance of the rate limit store
 * Shared across all requests
 */
export const rateLimitStore = new RateLimitStore()

/**
 * Check if rate limiting is enabled
 * Can be disabled via DISABLE_RATE_LIMIT=true env var
 */
export function isRateLimitEnabled(): boolean {
  return RATE_LIMIT_ENABLED
}
