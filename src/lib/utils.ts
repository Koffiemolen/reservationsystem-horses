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
