export interface CalendarReservation {
  id: string
  startTime: Date | string
  endTime: Date | string
  purpose: string
  status: string
  isOwn: boolean
  userName?: string
  notes?: string
}

export interface CalendarBlock {
  id: string
  reason: string
  startTime: Date | string
  endTime: Date | string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date | string
  endTime: Date | string
  visibility: string
}

export interface CalendarData {
  reservations: CalendarReservation[]
  blocks: CalendarBlock[]
  events?: CalendarEvent[]
}

export interface Resource {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  phone?: string
  phoneConsent: boolean
  createdAt: Date | string
}

export interface Reservation {
  id: string
  userId: string
  resourceId: string
  startTime: Date | string
  endTime: Date | string
  purpose: string
  notes?: string
  status: string
  createdAt: Date | string
  updatedAt: Date | string
  cancelledAt?: Date | string
  cancelReason?: string
  resource?: Resource
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export interface Block {
  id: string
  resourceId: string
  reason: string
  startTime: Date | string
  endTime: Date | string
  isRecurring: boolean
  recurrenceRule?: string
  createdById: string
  createdAt: Date | string
}

export interface Event {
  id: string
  title: string
  description?: string
  startTime: Date | string
  endTime: Date | string
  visibility: string
  createdById: string
  createdAt: Date | string
  resources?: Resource[]
}

export type CalendarView = 'month' | 'week' | 'day'
