'use client'

import { useMemo } from 'react'
import {
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  isWithinInterval,
  differenceInMinutes,
} from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CalendarReservation, CalendarBlock } from '@/types'
import { ReservationCard } from './ReservationCard'
import { BlockIndicator } from './BlockIndicator'

interface WeekViewProps {
  currentDate: Date
  dateRange: { start: Date; end: Date }
  reservations: CalendarReservation[]
  blocks: CalendarBlock[]
  onDateClick?: (date: Date) => void
  onTimeClick?: (date: Date, time: Date) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 60 // pixels per hour

export function WeekView({
  currentDate,
  dateRange,
  reservations,
  blocks,
  onDateClick,
  onTimeClick,
}: WeekViewProps) {
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

  const getBlocksForDay = (day: Date) => {
    return blocks.filter((b) => {
      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      return (
        isSameDay(start, day) ||
        isSameDay(end, day) ||
        isWithinInterval(day, { start, end })
      )
    })
  }

  const getEventPosition = (event: CalendarReservation | CalendarBlock, day: Date) => {
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)

    // Calculate start position
    let startMinutes: number
    if (isSameDay(eventStart, day)) {
      startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    } else {
      startMinutes = 0 // Event started on previous day
    }

    // Calculate end position
    let endMinutes: number
    if (isSameDay(eventEnd, day)) {
      endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()
    } else {
      endMinutes = 24 * 60 // Event continues to next day
    }

    const duration = endMinutes - startMinutes
    const top = (startMinutes / 60) * HOUR_HEIGHT
    const height = Math.max((duration / 60) * HOUR_HEIGHT, 20) // Minimum height

    return { top, height }
  }

  const handleTimeClick = (day: Date, hour: number) => {
    if (onTimeClick) {
      const time = setMinutes(setHours(day, hour), 0)
      onTimeClick(day, time)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable container for header + time grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with day names */}
        <div className="flex border-b sticky top-0 bg-background z-10">
          <div className="w-16 flex-shrink-0" /> {/* Time column spacer */}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'flex-1 text-center py-2 border-l cursor-pointer hover:bg-muted/50',
                isToday(day) && 'bg-primary/10'
              )}
              onClick={() => onDateClick?.(day)}
            >
              <div className="text-sm text-muted-foreground">
                {format(day, 'EEE', { locale: nl })}
              </div>
              <div
                className={cn(
                  'text-lg font-semibold',
                  isToday(day) && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex">
        {/* Time labels */}
        <div className="w-16 flex-shrink-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] text-xs text-muted-foreground text-right pr-2 relative"
            >
              <span className="absolute -top-2 right-2">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayReservations = getEventsForDay(day)
          const dayBlocks = getBlocksForDay(day)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex-1 border-l relative',
                isToday(day) && 'bg-primary/5'
              )}
            >
              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-dashed border-muted cursor-pointer hover:bg-muted/30"
                  onClick={() => handleTimeClick(day, hour)}
                />
              ))}

              {/* Blocks */}
              {dayBlocks.map((block) => {
                const { top, height } = getEventPosition(block, day)
                return (
                  <div
                    key={block.id}
                    className="absolute left-0 right-0 mx-1"
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <BlockIndicator block={block} />
                  </div>
                )
              })}

              {/* Reservations */}
              {dayReservations.map((reservation) => {
                const { top, height } = getEventPosition(reservation, day)
                return (
                  <div
                    key={reservation.id}
                    className="absolute left-0 right-0 mx-1"
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <ReservationCard reservation={reservation} compact />
                  </div>
                )
              })}
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
