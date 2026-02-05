import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatInTimeZone } from 'date-fns-tz'
import { nl } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TIMEZONE = 'Europe/Amsterdam'

export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(d, TIMEZONE, formatStr, { locale: nl })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(d, TIMEZONE, 'HH:mm', { locale: nl })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(d, TIMEZONE, 'PPP HH:mm', { locale: nl })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(d, TIMEZONE, 'd MMM yyyy', { locale: nl })
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)} - ${formatTime(end)}`
}

export function toAmsterdamTime(date: Date): Date {
  return new Date(formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss"))
}

export const PURPOSE_LABELS: Record<string, string> = {
  TRAINING: 'Training',
  LESSON: 'Les',
  OTHER: 'Anders',
}

export const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Bevestigd',
  CANCELLED: 'Geannuleerd',
  IMPACTED: 'Getroffen',
}

export const ROLE_LABELS: Record<string, string> = {
  USER: 'Gebruiker',
  ORGANIZER: 'Organisator',
  ADMIN: 'Beheerder',
}

export const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: 'Openbaar',
  MEMBERS: 'Alleen leden',
  ADMIN: 'Alleen beheerders',
}

/**
 * Get CSRF token from cookie
 * Reads the csrf-token cookie set by the server
 * @returns CSRF token string or empty string if not found
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''

  const match = document.cookie.match(/csrf-token=([^;]+)/)
  return match ? match[1] : ''
}

/**
 * Fetch wrapper that automatically includes CSRF token for mutations
 * Use this instead of fetch() for POST/PUT/PATCH/DELETE requests
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise<Response>
 *
 * @example
 * ```typescript
 * const response = await fetchWithCsrf('/api/reservations', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify(data)
 * })
 * ```
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)

  // Add CSRF token for mutation requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || '')) {
    const token = getCsrfToken()
    if (token) {
      headers.set('X-CSRF-Token', token)
    }
  }

  return fetch(url, { ...options, headers })
}
