'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, addHours, setHours, setMinutes } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { reservationSchema, type ReservationInput } from '@/lib/validators'
import { PURPOSE_LABELS, formatTime } from '@/lib/utils'
import { OverlapWarning } from './OverlapWarning'
import type { Reservation } from '@/types'

interface ReservationFormProps {
  resourceId: string
  initialDate?: Date
  initialStartTime?: Date
  existingReservation?: Reservation
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface OverlapInfo {
  startTime: string
  endTime: string
  purpose: string
}

export function ReservationForm({
  resourceId,
  initialDate,
  initialStartTime,
  existingReservation,
  open,
  onOpenChange,
  onSuccess,
}: ReservationFormProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [overlaps, setOverlaps] = useState<OverlapInfo[] | null>(null)
  const [blockError, setBlockError] = useState<string | null>(null)

  const isEditing = !!existingReservation

  const defaultDate = initialDate || new Date()
  const defaultStartTime = initialStartTime || setMinutes(setHours(new Date(), 10), 0)
  const defaultEndTime = addHours(defaultStartTime, 1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: existingReservation
      ? {
          resourceId: existingReservation.resourceId,
          startTime: new Date(existingReservation.startTime).toISOString(),
          endTime: new Date(existingReservation.endTime).toISOString(),
          purpose: existingReservation.purpose as 'TRAINING' | 'LESSON' | 'OTHER',
          notes: existingReservation.notes || '',
          acknowledgeOverlap: false,
        }
      : {
          resourceId,
          startTime: defaultStartTime.toISOString(),
          endTime: defaultEndTime.toISOString(),
          purpose: 'TRAINING',
          notes: '',
          acknowledgeOverlap: false,
        },
  })

  const startTime = watch('startTime')
  const endTime = watch('endTime')
  const acknowledgeOverlap = watch('acknowledgeOverlap')

  // Check for overlaps when time changes
  useEffect(() => {
    const checkOverlaps = async () => {
      if (!startTime || !endTime) return

      try {
        const params = new URLSearchParams({
          resourceId,
          start: startTime,
          end: endTime,
        })
        if (existingReservation) {
          params.append('excludeId', existingReservation.id)
        }

        const response = await fetch(`/api/reservations/check-overlaps?${params}`)
        const data = await response.json()

        if (data.hasBlock) {
          setBlockError(`Dit tijdslot is geblokkeerd: ${data.block?.reason}`)
          setOverlaps(null)
        } else if (data.hasOverlaps) {
          setOverlaps(data.overlappingReservations)
          setBlockError(null)
        } else {
          setOverlaps(null)
          setBlockError(null)
        }
      } catch (error) {
        console.error('Error checking overlaps:', error)
      }
    }

    const debounce = setTimeout(checkOverlaps, 300)
    return () => clearTimeout(debounce)
  }, [startTime, endTime, resourceId, existingReservation])

  const onSubmit = async (data: ReservationInput) => {
    if (blockError) {
      toast.error('Dit tijdslot is geblokkeerd')
      return
    }

    setIsLoading(true)

    try {
      const url = isEditing
        ? `/api/reservations/${existingReservation.id}`
        : '/api/reservations'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.warning === 'OVERLAP_EXISTS' && !data.acknowledgeOverlap) {
        setOverlaps(result.overlaps)
        return
      }

      if (!response.ok) {
        if (result.error === 'TIME_BLOCKED') {
          setBlockError(`Dit tijdslot is geblokkeerd: ${result.block?.reason}`)
          return
        }
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success(isEditing ? 'Reservering bijgewerkt' : 'Reservering aangemaakt')
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      onOpenChange(false)
      onSuccess?.()
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const currentStart = new Date(startTime)
    const currentEnd = new Date(endTime)

    const newStart = new Date(date)
    newStart.setHours(currentStart.getHours(), currentStart.getMinutes())

    const newEnd = new Date(date)
    newEnd.setHours(currentEnd.getHours(), currentEnd.getMinutes())

    setValue('startTime', newStart.toISOString())
    setValue('endTime', newEnd.toISOString())
  }

  const handleTimeChange = (field: 'startTime' | 'endTime', timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const currentDate = new Date(field === 'startTime' ? startTime : endTime)
    currentDate.setHours(hours, minutes, 0, 0)
    setValue(field, currentDate.toISOString())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Reservering bewerken' : 'Nieuwe reservering'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Pas de details van je reservering aan'
              : 'Maak een nieuwe reservering voor de rijhal'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Datum</Label>
            <Calendar
              mode="single"
              selected={new Date(startTime)}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTimeInput">Starttijd</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTimeInput"
                  type="time"
                  className="pl-10"
                  value={format(new Date(startTime), 'HH:mm')}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTimeInput">Eindtijd</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTimeInput"
                  type="time"
                  className="pl-10"
                  value={format(new Date(endTime), 'HH:mm')}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
          {errors.endTime && (
            <p className="text-sm text-destructive">{errors.endTime.message}</p>
          )}

          {/* Purpose */}
          <div className="space-y-2">
            <Label>Doel</Label>
            <Select
              value={watch('purpose')}
              onValueChange={(value) =>
                setValue('purpose', value as 'TRAINING' | 'LESSON' | 'OTHER')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer doel" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PURPOSE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.purpose && (
              <p className="text-sm text-destructive">{errors.purpose.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notities (optioneel)</Label>
            <Textarea
              id="notes"
              placeholder="Extra informatie over je reservering..."
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Block Error */}
          {blockError && (
            <Alert variant="destructive">
              <AlertTitle>Tijdslot geblokkeerd</AlertTitle>
              <AlertDescription>{blockError}</AlertDescription>
            </Alert>
          )}

          {/* Overlap Warning */}
          {overlaps && overlaps.length > 0 && !blockError && (
            <OverlapWarning
              overlaps={overlaps}
              acknowledged={acknowledgeOverlap || false}
              onAcknowledgeChange={(checked) => setValue('acknowledgeOverlap', checked)}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!blockError}
            >
              {isLoading
                ? 'Bezig...'
                : isEditing
                  ? 'Opslaan'
                  : 'Reserveren'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
