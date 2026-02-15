'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatDateShort, formatTimeRange, VISIBILITY_LABELS, fetchWithCsrf } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  visibility: string
  createdAt: string
  createdBy: { id: string; name: string }
  resources: Array<{ resource: { id: string; name: string } }>
}

interface EventFormData {
  title: string
  description: string
  startTime: string
  endTime: string
  visibility: string
}

const emptyForm: EventFormData = {
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  visibility: 'PUBLIC',
}

async function fetchEvents(): Promise<{ events: Event[] }> {
  const response = await fetch('/api/events')
  if (!response.ok) throw new Error('Failed to fetch events')
  return response.json()
}

function toLocalDatetime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function visibilityBadgeVariant(visibility: string): 'default' | 'secondary' | 'outline' {
  switch (visibility) {
    case 'PUBLIC': return 'default'
    case 'MEMBERS': return 'secondary'
    case 'ADMIN': return 'outline'
    default: return 'outline'
  }
}

export default function EvenementenPage() {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState<EventFormData>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)

  const { data, isLoading: isLoadingEvents, error } = useQuery({
    queryKey: ['admin-events'],
    queryFn: fetchEvents,
  })

  const handleSecurityError = (response: Response) => {
    if (response.status === 403) {
      toast.error('Beveiligingstoken verlopen. De pagina wordt herladen...')
      setTimeout(() => window.location.reload(), 2000)
      return true
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      toast.error(
        retryAfter
          ? `Te veel verzoeken. Probeer over ${retryAfter} seconden opnieuw.`
          : 'Te veel verzoeken. Probeer het later opnieuw.'
      )
      return true
    }
    return false
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error('Vul alle verplichte velden in')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          visibility: formData.visibility,
        }),
      })

      if (handleSecurityError(response)) return

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success('Evenement aangemaakt')
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      setCreateDialogOpen(false)
      setFormData(emptyForm)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedEvent || !formData.title || !formData.startTime || !formData.endTime) return

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/events/${selectedEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          visibility: formData.visibility,
        }),
      })

      if (handleSecurityError(response)) return

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success('Evenement bijgewerkt')
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      setEditDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/events/${selectedEvent.id}`, {
        method: 'DELETE',
      })

      if (handleSecurityError(response)) return

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success('Evenement verwijderd')
      queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      setDeleteDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const isExpired = (endTime: string) => new Date(endTime) < new Date()

  if (isLoadingEvents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Er is een fout opgetreden bij het laden van evenementen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evenementen</h1>
          <p className="text-muted-foreground mt-1">
            Beheer evenementen en wedstrijden
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm)
            setCreateDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuw evenement
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Tijd</TableHead>
              <TableHead>Zichtbaarheid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aangemaakt door</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.events && data.events.length > 0 ? (
              data.events.map((event) => (
                <TableRow key={event.id} className={isExpired(event.endTime) ? 'opacity-50' : ''}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDateShort(event.startTime)}</TableCell>
                  <TableCell>{formatTimeRange(event.startTime, event.endTime)}</TableCell>
                  <TableCell>
                    <Badge variant={visibilityBadgeVariant(event.visibility)}>
                      {VISIBILITY_LABELS[event.visibility] || event.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isExpired(event.endTime) ? 'secondary' : 'outline'}>
                      {isExpired(event.endTime) ? 'Verlopen' : 'Gepland'}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.createdBy.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedEvent(event)
                            setFormData({
                              title: event.title,
                              description: event.description || '',
                              startTime: toLocalDatetime(event.startTime),
                              endTime: toLocalDatetime(event.endTime),
                              visibility: event.visibility,
                            })
                            setEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedEvent(event)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Geen evenementen gevonden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw evenement</DialogTitle>
            <DialogDescription>
              Maak een nieuw evenement aan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Titel</Label>
              <Input
                id="create-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Naam van het evenement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Beschrijving (optioneel)</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschrijving van het evenement"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-start">Starttijd</Label>
                <Input
                  id="create-start"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-end">Eindtijd</Label>
                <Input
                  id="create-end"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zichtbaarheid</Label>
              <Select
                value={formData.visibility}
                onValueChange={(v) => setFormData({ ...formData, visibility: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Openbaar</SelectItem>
                  <SelectItem value="MEMBERS">Alleen leden</SelectItem>
                  <SelectItem value="ADMIN">Alleen beheerders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Aanmaken'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evenement bewerken</DialogTitle>
            <DialogDescription>
              Wijzig de gegevens van dit evenement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschrijving (optioneel)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Starttijd</Label>
                <Input
                  id="edit-start"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">Eindtijd</Label>
                <Input
                  id="edit-end"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zichtbaarheid</Label>
              <Select
                value={formData.visibility}
                onValueChange={(v) => setFormData({ ...formData, visibility: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Openbaar</SelectItem>
                  <SelectItem value="MEMBERS">Alleen leden</SelectItem>
                  <SelectItem value="ADMIN">Alleen beheerders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evenement verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je dit evenement wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <p className="font-medium">{selectedEvent.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateShort(selectedEvent.startTime)} {formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuleren
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Verwijderen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
