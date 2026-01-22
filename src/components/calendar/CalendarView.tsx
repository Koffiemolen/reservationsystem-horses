'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCalendar } from '@/hooks/useCalendar'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import type { CalendarView as CalendarViewType } from '@/types'

interface CalendarViewProps {
  resourceId: string
  initialView?: CalendarViewType
  onCreateReservation?: (date: Date, startTime?: Date) => void
}

export function CalendarView({
  resourceId,
  initialView = 'week',
  onCreateReservation,
}: CalendarViewProps) {
  const {
    currentDate,
    view,
    setView,
    dateRange,
    data,
    isLoading,
    goToNext,
    goToPrevious,
    goToToday,
    goToDate,
  } = useCalendar(resourceId, initialView)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    if (view === 'month') {
      goToDate(date)
      setView('day')
    }
  }

  const handleTimeClick = (date: Date, time: Date) => {
    if (onCreateReservation) {
      onCreateReservation(date, time)
    }
  }

  const getTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: nl })
      case 'week':
        return `Week ${format(currentDate, 'w, yyyy', { locale: nl })}`
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: nl })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Vandaag
          </Button>
          <h2 className="text-lg font-semibold ml-2 capitalize">{getTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as CalendarViewType)}>
            <TabsList>
              <TabsTrigger value="month">Maand</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Dag</TabsTrigger>
            </TabsList>
          </Tabs>

          {onCreateReservation && (
            <Button onClick={() => onCreateReservation(currentDate)}>
              <Plus className="h-4 w-4 mr-2" />
              Reserveren
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {view === 'month' && (
              <MonthView
                currentDate={currentDate}
                dateRange={dateRange}
                reservations={data?.reservations || []}
                blocks={data?.blocks || []}
                onDateClick={handleDateClick}
              />
            )}
            {view === 'week' && (
              <WeekView
                currentDate={currentDate}
                dateRange={dateRange}
                reservations={data?.reservations || []}
                blocks={data?.blocks || []}
                onDateClick={handleDateClick}
                onTimeClick={handleTimeClick}
              />
            )}
            {view === 'day' && (
              <DayView
                currentDate={currentDate}
                reservations={data?.reservations || []}
                blocks={data?.blocks || []}
                onTimeClick={handleTimeClick}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
