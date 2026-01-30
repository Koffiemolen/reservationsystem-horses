'use client'

import { useMemo } from 'react'
import {
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWithinInterval,
} from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CalendarReservation, CalendarBlock } from '@/types'
import { PURPOSE_LABELS } from '@/lib/utils'

interface MonthViewProps {
  currentDate: Date
  dateRange: { start: Date; end: Date }
  reservations: CalendarReservation[]
  blocks: CalendarBlock[]
  onDateClick?: (date: Date) => void
}

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

export function MonthView({
  currentDate,
  dateRange,
  reservations,
  blocks,
  onDateClick,
}: MonthViewProps) {
  const days = useMemo(
    () => eachDayOfInterval({ start: dateRange.start, end: dateRange.end }),
    [dateRange]
  )

  const getEventsForDay = (day: Date) => {
    return reservations.filter((r) => {
      const start = new Date(r.startTime)
      const end = new Date(r.endTime)
      return (
        isSameDay(start, day) ||
        isSameDay(end, day) ||
        isWithinInterval(day, { start, end })
      )
    })
  }

  const hasBlockOnDay = (day: Date) => {
    return blocks.some((b) => {
      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      return (
        isSameDay(start, day) ||
        isSameDay(end, day) ||
        isWithinInterval(day, { start, end })
      )
    })
  }

  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [days])

  return (
    <div className="flex flex-col h-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day) => {
              const dayEvents = getEventsForDay(day)
              const hasBlock = hasBlockOnDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-24 p-1 border-l first:border-l-0 cursor-pointer hover:bg-muted/50 transition-colors',
                    !isCurrentMonth && 'bg-muted/30',
                    isToday(day) && 'bg-primary/10',
                    hasBlock && 'bg-destructive/10'
                  )}
                  onClick={() => onDateClick?.(day)}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={cn(
                        'text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full',
                        isToday(day) && 'bg-primary text-primary-foreground',
                        !isCurrentMonth && 'text-muted-foreground'
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs px-1 py-0.5 rounded truncate',
                            event.isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          )}
                          title={`${format(new Date(event.startTime), 'HH:mm')} - ${PURPOSE_LABELS[event.purpose] || event.purpose}`}
                        >
                          {format(new Date(event.startTime), 'HH:mm')}{' '}
                          {event.isOwn && (event.notes?.slice(0, 10) || PURPOSE_LABELS[event.purpose])}
                          {!event.isOwn && 'Gereserveerd'}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 3} meer
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
