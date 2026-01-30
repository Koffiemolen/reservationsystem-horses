'use client'

import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from 'date-fns'
import type { CalendarView, CalendarData } from '@/types'

async function fetchCalendarData(
  resourceId: string,
  start: Date,
  end: Date
): Promise<CalendarData> {
  const params = new URLSearchParams({
    resourceId,
    start: start.toISOString(),
    end: end.toISOString(),
  })

  const response = await fetch(`/api/calendar/reservations?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch calendar data')
  }
  return response.json()
}

export function useCalendar(resourceId: string, initialView: CalendarView = 'week') {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>(initialView)

  const dateRange = useMemo(() => {
    switch (view) {
      case 'month':
        return {
          start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
          end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
        }
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        }
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
        }
    }
  }, [currentDate, view])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['calendar', resourceId, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => fetchCalendarData(resourceId, dateRange.start, dateRange.end),
    staleTime: 30000, // 30 seconds
  })

  const goToNext = useCallback(() => {
    switch (view) {
      case 'month':
        setCurrentDate((d) => addMonths(d, 1))
        break
      case 'week':
        setCurrentDate((d) => addWeeks(d, 1))
        break
      case 'day':
        setCurrentDate((d) => addDays(d, 1))
        break
    }
  }, [view])

  const goToPrevious = useCallback(() => {
    switch (view) {
      case 'month':
        setCurrentDate((d) => subMonths(d, 1))
        break
      case 'week':
        setCurrentDate((d) => subWeeks(d, 1))
        break
      case 'day':
        setCurrentDate((d) => subDays(d, 1))
        break
    }
  }, [view])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  return {
    currentDate,
    view,
    setView,
    dateRange,
    data,
    isLoading,
    error,
    refetch,
    goToNext,
    goToPrevious,
    goToToday,
    goToDate,
  }
}
