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

export function ReservationCard({
  reservation,
  compact = false,
  showDetails = false,
  onClick,
}: ReservationCardProps) {
  const startTime = new Date(reservation.startTime)
  const endTime = new Date(reservation.endTime)

  if (compact) {
    return (
      <div
        className={cn(
          'h-full rounded px-1 py-0.5 text-xs overflow-hidden cursor-pointer transition-colors',
          reservation.isOwn
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground',
          reservation.status === 'IMPACTED' && 'bg-orange-500 text-white'
        )}
        onClick={onClick}
        title={`${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}: ${
          reservation.isOwn ? reservation.notes || PURPOSE_LABELS[reservation.purpose] : 'Gereserveerd'
        }`}
      >
        <div className="font-medium truncate">
          {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
        </div>
        {reservation.isOwn && (
          <div className="truncate opacity-90">
            {reservation.notes?.slice(0, 20) || PURPOSE_LABELS[reservation.purpose]}
          </div>
        )}
        {!reservation.isOwn && <div className="truncate opacity-90">Gereserveerd</div>}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'h-full rounded-lg p-2 overflow-hidden cursor-pointer transition-colors shadow-sm',
        reservation.isOwn
          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
          : 'bg-muted hover:bg-muted/80 text-muted-foreground border',
        reservation.status === 'IMPACTED' && 'bg-orange-500 text-white'
      )}
      onClick={onClick}
    >
      <div className="font-semibold">
        {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
      </div>

      <div className="mt-1 text-sm">
        {reservation.isOwn ? (
          <>
            <div className="font-medium">
              {PURPOSE_LABELS[reservation.purpose] || reservation.purpose}
            </div>
            {showDetails && reservation.notes && (
              <div className="mt-1 opacity-90">{reservation.notes}</div>
            )}
            {showDetails && reservation.userName && (
              <div className="mt-2 text-xs opacity-75">{reservation.userName}</div>
            )}
          </>
        ) : (
          <div className="italic">Gereserveerd door andere gebruiker</div>
        )}
      </div>

      {reservation.status === 'IMPACTED' && (
        <div className="mt-2 text-xs font-medium">
          Getroffen door blokkade
        </div>
      )}
    </div>
  )
}
