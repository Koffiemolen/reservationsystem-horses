'use client'

import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { PURPOSE_LABELS } from '@/lib/utils'
import type { CalendarReservation } from '@/types'

interface ReservationCardProps {
  reservation: CalendarReservation
  compact?: boolean
  showDetails?: boolean
  onClick?: () => void
}

const PURPOSE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  TRAINING: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-l-emerald-600 dark:border-l-emerald-400',
    icon: '🏇',
  },
  LESSON: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-l-amber-600 dark:border-l-amber-400',
    icon: '📋',
  },
  OTHER: {
    bg: 'bg-stone-100 dark:bg-stone-900/40',
    border: 'border-l-stone-500 dark:border-l-stone-400',
    icon: '🐴',
  },
}

const PURPOSE_COMPACT_STYLES: Record<string, string> = {
  TRAINING: 'bg-emerald-600/90 dark:bg-emerald-700/90 text-white',
  LESSON: 'bg-amber-600/90 dark:bg-amber-700/90 text-white',
  OTHER: 'bg-stone-500/90 dark:bg-stone-600/90 text-white',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getInitialColor(name?: string): string {
  if (!name) return 'bg-muted text-muted-foreground'
  const colors = [
    'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    'bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    'bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    'bg-teal-200 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  ]
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function ReservationCard({
  reservation,
  compact = false,
  showDetails = false,
  onClick,
}: ReservationCardProps) {
  const startTime = new Date(reservation.startTime)
  const endTime = new Date(reservation.endTime)
  const purposeStyle = PURPOSE_STYLES[reservation.purpose] || PURPOSE_STYLES.OTHER
  const compactStyle = PURPOSE_COMPACT_STYLES[reservation.purpose] || PURPOSE_COMPACT_STYLES.OTHER

  // Compact mode: used in week view and month view
  if (compact) {
    return (
      <div
        className={cn(
          'h-full rounded-sm px-1.5 py-0.5 text-xs overflow-hidden cursor-pointer transition-all',
          'hover:brightness-110 hover:shadow-sm',
          compactStyle,
          reservation.status === 'IMPACTED' && 'bg-orange-500 dark:bg-orange-600 text-white'
        )}
        onClick={onClick}
        title={`${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}: ${reservation.userName || 'Gereserveerd'} — ${PURPOSE_LABELS[reservation.purpose] || reservation.purpose}`}
      >
        <div className="flex items-center gap-1 font-semibold leading-tight">
          <span>{format(startTime, 'HH:mm')}</span>
          <span className="opacity-60">-</span>
          <span>{format(endTime, 'HH:mm')}</span>
        </div>
        <div className="truncate leading-tight mt-px font-medium">
          {reservation.userName || 'Gereserveerd'}
        </div>
        <div className="truncate opacity-75 leading-tight">
          {PURPOSE_LABELS[reservation.purpose] || reservation.purpose}
          {reservation.isOwn && reservation.notes ? ` · ${reservation.notes.slice(0, 15)}` : ''}
        </div>
      </div>
    )
  }

  // Full mode: used in day view
  return (
    <div
      className={cn(
        'h-full rounded-lg overflow-hidden cursor-pointer transition-all',
        'border-l-[4px] shadow-sm hover:shadow-md',
        purposeStyle.bg,
        purposeStyle.border,
        reservation.status === 'IMPACTED' &&
          'border-l-orange-500 bg-orange-50 dark:bg-orange-950/40'
      )}
      onClick={onClick}
    >
      <div className="p-3 h-full flex flex-col">
        {/* Header: time + purpose badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar initial */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                getInitialColor(reservation.userName)
              )}
            >
              {getInitials(reservation.userName)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate text-foreground">
                {reservation.userName || 'Gereserveerd'}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(startTime, 'HH:mm')} – {format(endTime, 'HH:mm')}
              </div>
            </div>
          </div>

          {/* Purpose badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
              reservation.purpose === 'TRAINING' && 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
              reservation.purpose === 'LESSON' && 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
              reservation.purpose === 'OTHER' && 'bg-stone-200/80 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300'
            )}
          >
            <span>{purposeStyle.icon}</span>
            {PURPOSE_LABELS[reservation.purpose] || reservation.purpose}
          </span>
        </div>

        {/* Notes (own reservations only) */}
        {showDetails && reservation.isOwn && reservation.notes && (
          <div className="mt-2 text-sm text-muted-foreground italic border-t border-border/40 pt-2">
            {reservation.notes}
          </div>
        )}

        {/* Impacted badge */}
        {reservation.status === 'IMPACTED' && (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-200/60 dark:bg-orange-900/40 px-2 py-0.5 rounded-full">
              ⚠ Getroffen door blokkade
            </span>
          </div>
        )}

        {/* Own indicator */}
        {reservation.isOwn && (
          <div className="mt-auto pt-1">
            <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wider">
              Jouw reservering
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
