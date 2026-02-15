'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatDateShort, formatTimeRange, PURPOSE_LABELS, STATUS_LABELS, fetchWithCsrf } from '@/lib/utils'

interface Reservation {
  id: string
  startTime: string
  endTime: string
  purpose: string
  notes: string | null
  status: string
  cancelledAt: string | null
  cancelReason: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  resource: { id: string; name: string }
}

async function fetchReservations(status?: string): Promise<{ reservations: Reservation[] }> {
  const url = status && status !== 'ALL'
    ? `/api/admin/reservations?status=${status}`
    : '/api/admin/reservations'
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch reservations')
  return response.json()
}

function statusBadgeVariant(status: string): 'default' | 'destructive' | 'secondary' | 'outline' {
  switch (status) {
    case 'CONFIRMED': return 'default'
    case 'CANCELLED': return 'destructive'
    case 'IMPACTED': return 'secondary'
    default: return 'outline'
  }
}

export default function ReserveringenPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { data, isLoading: isLoadingReservations, error } = useQuery({
    queryKey: ['admin-reservations', statusFilter],
    queryFn: () => fetchReservations(statusFilter),
  })

  const handleCancel = async () => {
    if (!selectedReservation) return

    setIsLoading(true)
    try {
      const url = cancelReason
        ? `/api/reservations/${selectedReservation.id}?reason=${encodeURIComponent(cancelReason)}`
        : `/api/reservations/${selectedReservation.id}`

      const response = await fetchWithCsrf(url, { method: 'DELETE' })

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
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] })
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingReservations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Er is een fout opgetreden bij het laden van reserveringen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alle Reserveringen</h1>
        <p className="text-muted-foreground mt-1">
          Overzicht van alle reserveringen in het systeem
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter op status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Alle statussen</SelectItem>
              <SelectItem value="CONFIRMED">Bevestigd</SelectItem>
              <SelectItem value="CANCELLED">Geannuleerd</SelectItem>
              <SelectItem value="IMPACTED">Getroffen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {data?.reservations.length ?? 0} reservering(en)
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gebruiker</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Tijd</TableHead>
              <TableHead>Doel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opmerkingen</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.reservations && data.reservations.length > 0 ? (
              data.reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{reservation.user.name}</p>
                      <p className="text-xs text-muted-foreground">{reservation.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateShort(reservation.startTime)}</TableCell>
                  <TableCell>{formatTimeRange(reservation.startTime, reservation.endTime)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PURPOSE_LABELS[reservation.purpose] || reservation.purpose}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(reservation.status)}>
                      {STATUS_LABELS[reservation.status] || reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {reservation.cancelReason || reservation.notes || '-'}
                  </TableCell>
                  <TableCell>
                    {reservation.status === 'CONFIRMED' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedReservation(reservation)
                              setCancelDialogOpen(true)
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Annuleren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Geen reserveringen gevonden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservering annuleren</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je de reservering van {selectedReservation?.user.name} wilt annuleren?
              De gebruiker ontvangt een e-mailnotificatie.
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="py-2 text-sm">
              <p>{formatDateShort(selectedReservation.startTime)} {formatTimeRange(selectedReservation.startTime, selectedReservation.endTime)}</p>
              <p className="text-muted-foreground">
                {PURPOSE_LABELS[selectedReservation.purpose] || selectedReservation.purpose}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reden (optioneel)</Label>
            <Input
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reden voor annulering"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Terug
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Annuleren'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
