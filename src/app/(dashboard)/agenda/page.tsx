'use client'

import { useState } from 'react'
import { CalendarView } from '@/components/calendar/CalendarView'
import { ReservationForm } from '@/components/reservations/ReservationForm'

// Default resource ID - Rijhal binnen
const DEFAULT_RESOURCE_ID = 'rijhal-binnen'

export default function AgendaPage() {
  const [reservationFormOpen, setReservationFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<Date | undefined>()

  const handleCreateReservation = (date: Date, time?: Date) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setReservationFormOpen(true)
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <CalendarView
        resourceId={DEFAULT_RESOURCE_ID}
        initialView="week"
        onCreateReservation={handleCreateReservation}
      />

      <ReservationForm
        resourceId={DEFAULT_RESOURCE_ID}
        initialDate={selectedDate}
        initialStartTime={selectedTime}
        open={reservationFormOpen}
        onOpenChange={setReservationFormOpen}
      />
    </div>
  )
}
