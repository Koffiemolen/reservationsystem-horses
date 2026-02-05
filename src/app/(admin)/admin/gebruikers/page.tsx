'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { UserCog, Ban, Check, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROLE_LABELS, fetchWithCsrf } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  role: string
  status: string
  createdAt: string
  _count: {
    reservations: number
  }
}

async function fetchUsers(): Promise<{ users: User[] }> {
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [disableReason, setDisableReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { data, isLoading: isLoadingUsers, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      // Handle CSRF token errors
      if (response.status === 403) {
        toast.error('Beveiligingstoken verlopen. De pagina wordt herladen...')
        setTimeout(() => window.location.reload(), 2000)
        return
      }

      // Handle rate limiting
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

      toast.success('Rol gewijzigd')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setRoleDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (enable: boolean) => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      const response = await fetchWithCsrf(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: enable ? 'ACTIVE' : 'DISABLED',
          reason: enable ? undefined : disableReason,
        }),
      })

      // Handle CSRF token errors
      if (response.status === 403) {
        toast.error('Beveiligingstoken verlopen. De pagina wordt herladen...')
        setTimeout(() => window.location.reload(), 2000)
        return
      }

      // Handle rate limiting
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

      const result = await response.json()
      if (result.cancelledReservations) {
        toast.success(
          `Gebruiker uitgeschakeld. ${result.cancelledReservations} reservering(en) geannuleerd.`
        )
      } else {
        toast.success(enable ? 'Gebruiker geactiveerd' : 'Gebruiker uitgeschakeld')
      }

      queryClient.invalidateQueries({ queryKey: ['users'] })
      setDisableDialogOpen(false)
      setDisableReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Er is een fout opgetreden bij het laden van gebruikers.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gebruikers</h1>
        <p className="text-muted-foreground mt-1">
          Beheer gebruikersaccounts en rechten
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefoon</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reserveringen</TableHead>
              <TableHead>Aangemaakt</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                  >
                    {user.status === 'ACTIVE' ? 'Actief' : 'Uitgeschakeld'}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.reservations}</TableCell>
                <TableCell>
                  {format(new Date(user.createdAt), 'd MMM yyyy', { locale: nl })}
                </TableCell>
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
                          setSelectedUser(user)
                          setNewRole(user.role)
                          setRoleDialogOpen(true)
                        }}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Rol wijzigen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'ACTIVE' ? (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user)
                            setDisableDialogOpen(true)
                          }}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Uitschakelen
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            handleStatusChange(true)
                          }}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Activeren
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rol wijzigen</DialogTitle>
            <DialogDescription>
              Wijzig de rol van {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nieuwe rol</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Gebruiker</SelectItem>
                  <SelectItem value="ORGANIZER">Organisator</SelectItem>
                  <SelectItem value="ADMIN">Beheerder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleRoleChange} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable User Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gebruiker uitschakelen</DialogTitle>
            <DialogDescription>
              Weet je zeker dat je {selectedUser?.name} wilt uitschakelen? Alle
              toekomstige reserveringen worden automatisch geannuleerd.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reden (optioneel)</Label>
              <Input
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Reden voor uitschakelen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusChange(false)}
              disabled={isLoading}
            >
              {isLoading ? 'Bezig...' : 'Uitschakelen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
