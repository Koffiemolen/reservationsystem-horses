'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, AlertTriangle, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateShort, formatTimeRange, fetchWithCsrf } from '@/lib/utils'

interface Block {
  id: string
  resourceId: string
  reason: string
  startTime: string
  endTime: string
  isRecurring: boolean
  createdAt: string
  resource: { id: string; name: string }
  createdBy: { id: string; name: string }
}

interface ConflictingReservation {
  id: string
  userName: string
  startTime: string
  endTime: string
  purpose: string
}

interface BlockFormData {
  reason: string
  startTime: string
  endTime: string
}

const emptyForm: BlockFormData = { reason: '', startTime: '', endTime: '' }

async function fetchBlocks(): Promise<{ blocks: Block[] }> {
  const response = await fetch('/api/blocks?includeExpired=true')
  if (!response.ok) throw new Error('Failed to fetch blocks')
  return response.json()
}

async function fetchResources(): Promise<{ resources: Array<{ id: string; name: string }> }> {
  const response = await fetch('/api/resources')
  if (!response.ok) throw new Error('Failed to fetch resources')
  return response.json()
}

function toLocalDatetime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function BlokkadePage() {
  const queryClient = useQueryClient()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [formData, setFormData] = useState<BlockFormData>(emptyForm)
  const [conflicts, setConflicts] = useState<ConflictingReservation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { data, isLoading: isLoadingBlocks, error } = useQuery({
    queryKey: ['admin-blocks'],
    queryFn: fetchBlocks,
  })

  const { data: resourcesData } = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  })

  const resourceId = resourcesData?.resources?.[0]?.id || ''

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

  const handleCreate = async (confirmConflicts = false) => {
    if (!formData.reason || !formData.startTime || !formData.endTime) {
      toast.error('Vul alle verplichte velden in')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          reason: formData.reason,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          confirmConflicts,
        }),
      })

      if (handleSecurityError(response)) return

      const result = await response.json()

      if (result.warning === 'CONFLICTS_EXIST') {
        setConflicts(result.conflicts)
        setCreateDialogOpen(false)
        setConflictDialogOpen(true)
        return
      }

      if (!response.ok) {
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success('Blokkade aangemaakt')
      queryClient.invalidateQueries({ queryKey: ['admin-blocks'] })
      setCreateDialogOpen(false)
      setConflictDialogOpen(false)
      setFormData(emptyForm)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedBlock || !formData.reason || !formData.startTime || !formData.endTime) return

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/blocks/${selectedBlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: formData.reason,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        }),
      })

      if (handleSecurityError(response)) return

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      toast.success('Blokkade bijgewerkt')
      queryClient.invalidateQueries({ queryKey: ['admin-blocks'] })
      setEditDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBlock) return

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/blocks/${selectedBlock.id}`, {
        method: 'DELETE',
      })

      if (handleSecurityError(response)) return

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      const result = await response.json()
      if (result.restoredReservations > 0) {
        toast.success(
          `Blokkade verwijderd. ${result.restoredReservations} reservering(en) hersteld.`
        )
      } else {
        toast.success('Blokkade verwijderd')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-blocks'] })
      setDeleteDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const isExpired = (endTime: string) => new Date(endTime) < new Date()

  if (isLoadingBlocks) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Er is een fout opgetreden bij het laden van blokkades.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blokkades</h1>
          <p className="text-muted-foreground mt-1">
            Beheer tijdsblokkades voor de faciliteiten
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm)
            setCreateDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe blokkade
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reden</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Tijd</TableHead>
              <TableHead>Locatie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aangemaakt door</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.blocks && data.blocks.length > 0 ? (
              data.blocks.map((block) => (
                <TableRow key={block.id} className={isExpired(block.endTime) ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{block.reason}</TableCell>
                  <TableCell>{formatDateShort(block.startTime)}</TableCell>
                  <TableCell>{formatTimeRange(block.startTime, block.endTime)}</TableCell>
                  <TableCell>{block.resource.name}</TableCell>
                  <TableCell>
                    <Badge variant={isExpired(block.endTime) ? 'secondary' : 'destructive'}>
                      {isExpired(block.endTime) ? 'Verlopen' : 'Actief'}
                    </Badge>
                  </TableCell>
                  <TableCell>{block.createdBy.name}</TableCell>
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
                            setSelectedBlock(block)
                            setFormData({
                              reason: block.reason,
                              startTime: toLocalDatetime(block.startTime),
                              endTime: toLocalDatetime(block.endTime),
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
                            setSelectedBlock(block)
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
                  Geen blokkades gevonden
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
            <DialogTitle>Nieuwe blokkade</DialogTitle>
            <DialogDescription>
              Maak een nieuwe tijdsblokkade aan. Bestaande reserveringen worden als getroffen gemarkeerd.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-reason">Reden</Label>
              <Input
                id="create-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Bijv. Onderhoud, Evenement, enz."
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={() => handleCreate(false)} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Aanmaken'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Confirmation Dialog */}
      <Dialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Getroffen reserveringen
            </DialogTitle>
            <DialogDescription>
              De volgende reserveringen worden als getroffen gemarkeerd. Gebruikers ontvangen een e-mailnotificatie.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4 max-h-60 overflow-y-auto">
            {conflicts.map((c) => (
              <div key={c.id} className="flex justify-between items-center p-2 rounded-md bg-muted">
                <div>
                  <p className="font-medium text-sm">{c.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(c.startTime)} {formatTimeRange(c.startTime, c.endTime)}
                  </p>
                </div>
                <Badge variant="outline">{c.purpose}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConflictDialogOpen(false)}>
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleCreate(true)}
              disabled={isLoading}
            >
              {isLoading ? 'Bezig...' : `Doorgaan (${conflicts.length} getroffen)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blokkade bewerken</DialogTitle>
            <DialogDescription>
              Wijzig de gegevens van deze blokkade
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-reason">Reden</Label>
              <Input
                id="edit-reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
            <DialogTitle>Blokkade verwijderen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je deze blokkade wilt verwijderen? Getroffen reserveringen worden automatisch hersteld naar bevestigd.
            </DialogDescription>
          </DialogHeader>
          {selectedBlock && (
            <div className="py-4">
              <p className="font-medium">{selectedBlock.reason}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateShort(selectedBlock.startTime)} {formatTimeRange(selectedBlock.startTime, selectedBlock.endTime)}
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
