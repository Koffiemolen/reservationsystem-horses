'use client'

import { useMemo } from 'react'
import {
  format,
  isSameDay,
  setHours,
  setMinutes,
  isWithinInterval,
} from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CalendarReservation, CalendarBlock } from '@/types'
import { ReservationCard } from './ReservationCard'
import { BlockIndicator } from './BlockIndicator'

interface DayViewProps {
  currentDate: Date
  reservations: CalendarReservation[]
  blocks: CalendarBlock[]
  onTimeClick?: (date: Date, time: Date) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const HOUR_HEIGHT = 80 // pixels per hour

export function DayView({
  currentDate,
  reservations,
  blocks,
  onTimeClick,
}: DayViewProps) {
  const dayReservations = useMemo(() => {
    return reservations.filter((r) => {
      const start = new Date(r.startTime)
      const end = new Date(r.endTime)
      return (
        isSameDay(start, currentDate) ||
        isSameDay(end, currentDate) ||
        isWithinInterval(currentDate, { start, end })
      )
    })
  }, [reservations, currentDate])

  const dayBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      return (
        isSameDay(start, currentDate) ||
        isSameDay(end, currentDate) ||
        isWithinInterval(currentDate, { start, end })
      )
    })
  }, [blocks, currentDate])

  const getEventPosition = (event: CalendarReservation | CalendarBlock) => {
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)

    let startMinutes: number
    if (isSameDay(eventStart, currentDate)) {
      startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes()
    } else {
      startMinutes = 0
    }

    let endMinutes: number
    if (isSameDay(eventEnd, currentDate)) {
      endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes()
    } else {
      endMinutes = 24 * 60
    }

    const duration = endMinutes - startMinutes
    const top = (startMinutes / 60) * HOUR_HEIGHT
    const height = Math.max((duration / 60) * HOUR_HEIGHT, 30)

    return { top, height }
  }

  const handleTimeClick = (hour: number) => {
    if (onTimeClick) {
      const time = setMinutes(setHours(currentDate, hour), 0)
      onTimeClick(currentDate, time)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <div className="text-center py-4 border-b">
        <div className="text-lg font-semibold capitalize">
          {format(currentDate, 'EEEE', { locale: nl })}
        </div>
        <div className="text-3xl font-bold text-primary">
          {format(currentDate, 'd MMMM yyyy', { locale: nl })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Time labels */}
        <div className="w-20 flex-shrink-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="relative"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <span className="absolute -top-3 right-3 text-sm text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day column */}
        <div className="flex-1 relative border-l">
          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="border-b border-dashed border-muted cursor-pointer hover:bg-muted/30 transition-colors"
              style={{ height: `${HOUR_HEIGHT}px` }}
              onClick={() => handleTimeClick(hour)}
            >
              {/* Half hour line */}
              <div
                className="border-b border-dotted border-muted/50"
                style={{ marginTop: `${HOUR_HEIGHT / 2}px` }}
              />
            </div>
          ))}

          {/* Blocks */}
          {dayBlocks.map((block) => {
            const { top, height } = getEventPosition(block)
            return (
              <div
                key={block.id}
                className="absolute left-2 right-2"
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <BlockIndicator block={block} showTime />
              </div>
            )
          })}

          {/* Reservations */}
          {dayReservations.map((reservation) => {
            const { top, height } = getEventPosition(reservation)
            return (
              <div
                key={reservation.id}
                className="absolute left-2 right-2"
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <ReservationCard reservation={reservation} showDetails />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
