'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Calendar, Clock, Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReservationForm } from '@/components/reservations/ReservationForm'
import { PURPOSE_LABELS, STATUS_LABELS, formatDate, formatTimeRange, fetchWithCsrf } from '@/lib/utils'
import type { Reservation } from '@/types'

const DEFAULT_RESOURCE_ID = 'rijhal-binnen'

async function fetchReservations(includeHistory: boolean): Promise<{ reservations: Reservation[] }> {
  const response = await fetch(`/api/reservations?history=${includeHistory}`)
  if (!response.ok) throw new Error('Failed to fetch reservations')
  return response.json()
}

export default function ReservationsPage() {
  const queryClient = useQueryClient()
  const [showHistory, setShowHistory] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['reservations', showHistory],
    queryFn: () => fetchReservations(showHistory),
  })

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      const response = await fetchWithCsrf(`/api/reservations/${deletingId}`, {
        method: 'DELETE',
      })

      // Handle CSRF and rate limit errors
      if (response.status === 403) {
        toast.error('Beveiligingstoken verlopen. De pagina wordt herladen...')
        setTimeout(() => window.location.reload(), 2000)
        return
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        toast.error(
          retryAfter
            ? `Te veel verzoeken. Probeer over ${retryAfter} seconden opnieuw.`
            : 'Te veel verzoeken. Probeer het later opnieuw.'
        )
        return
      }

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success('Reservering geannuleerd')
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  const upcomingReservations = data?.reservations.filter(
    (r) => r.status !== 'CANCELLED' && new Date(r.startTime) >= new Date()
  ) || []

  const pastReservations = data?.reservations.filter(
    (r) => r.status === 'CANCELLED' || new Date(r.startTime) < new Date()
  ) || []

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const isPast = new Date(reservation.startTime) < new Date()
    const isCancelled = reservation.status === 'CANCELLED'

    return (
      <Card className={isCancelled ? 'opacity-60' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatDate(reservation.startTime, 'EEEE d MMMM yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTimeRange(reservation.startTime, reservation.endTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {PURPOSE_LABELS[reservation.purpose] || reservation.purpose}
                </Badge>
                <Badge
                  variant={
                    reservation.status === 'CONFIRMED'
                      ? 'default'
                      : reservation.status === 'CANCELLED'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {STATUS_LABELS[reservation.status] || reservation.status}
                </Badge>
              </div>
              {reservation.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {reservation.notes}
                </p>
              )}
              {isCancelled && reservation.cancelReason && (
                <p className="text-sm text-destructive mt-2">
                  Reden: {reservation.cancelReason}
                </p>
              )}
            </div>

            {!isPast && !isCancelled && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(reservation)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setDeletingId(reservation.id)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mijn Reserveringen</h1>
          <p className="text-muted-foreground mt-1">
            Bekijk en beheer je reserveringen
          </p>
        </div>
        <Button onClick={() => {
          setEditingReservation(undefined)
          setFormOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe reservering
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Aankomend ({upcomingReservations.length})
          </TabsTrigger>
          <TabsTrigger value="history" onClick={() => setShowHistory(true)}>
            Geschiedenis ({pastReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : upcomingReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Je hebt geen aankomende reserveringen
                </p>
                <Button className="mt-4" onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Maak een reservering
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : pastReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Geen geschiedenis gevonden</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reservation Form Dialog */}
      <ReservationForm
        resourceId={DEFAULT_RESOURCE_ID}
        existingReservation={editingReservation}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingReservation(undefined)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reservering annuleren?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze reservering wilt annuleren? Dit kan niet
              ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Terug</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Annuleren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
