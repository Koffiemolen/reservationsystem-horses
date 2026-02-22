'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { User, Mail, Phone, Shield, Calendar, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { fetchWithCsrf, formatDate, ROLE_LABELS } from '@/lib/utils'

interface ProfileUser {
  id: string
  email: string
  name: string
  phone: string | null
  phoneConsent: boolean
  role: string
  status: string
  createdAt: string
  _count: {
    reservations: number
  }
}

async function fetchProfile(): Promise<{ user: ProfileUser }> {
  const response = await fetch('/api/profile')
  if (!response.ok) throw new Error('Kon profiel niet laden')
  return response.json()
}

export default function ProfielPage() {
  const { update: updateSession } = useSession()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneConsent, setPhoneConsent] = useState(false)
  const [profileInitialized, setProfileInitialized] = useState(false)
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  const user = data?.user

  // Initialize form when data loads
  if (user && !profileInitialized) {
    setName(user.name)
    setPhone(user.phone || '')
    setPhoneConsent(user.phoneConsent)
    setProfileInitialized(true)
  }

  const handleSaveProfile = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Naam moet minimaal 2 tekens bevatten')
      return
    }

    setSaving(true)
    try {
      const response = await fetchWithCsrf('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), phoneConsent }),
      })

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

      toast.success('Profiel bijgewerkt')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      updateSession({ name: name.trim() })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Vul je huidige wachtwoord in')
      return
    }
    if (!newPassword) {
      toast.error('Vul een nieuw wachtwoord in')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen')
      return
    }
    if (newPassword.length < 12) {
      toast.error('Wachtwoord moet minimaal 12 tekens bevatten')
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetchWithCsrf('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

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

      toast.success('Wachtwoord gewijzigd')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Mijn Profiel</h1>
        <p className="text-muted-foreground mt-1">Beheer je accountgegevens</p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Accountinformatie
          </CardTitle>
          <CardDescription>Je basisgegevens en accountstatus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">E-mail:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Rol:</span>
            <Badge variant="outline">{ROLE_LABELS[user?.role || ''] || user?.role}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Lid sinds:</span>
            <span>{user?.createdAt ? formatDate(user.createdAt, 'd MMMM yyyy') : '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Actieve reserveringen:</span>
            <span className="font-medium">{user?._count?.reservations ?? 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profiel bewerken</CardTitle>
          <CardDescription>Wijzig je naam en contactgegevens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Je volledige naam"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06-12345678"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="phoneConsent"
              checked={phoneConsent}
              onChange={(e) => setPhoneConsent(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <Label htmlFor="phoneConsent" className="text-sm font-normal">
              Mijn telefoonnummer mag zichtbaar zijn voor andere leden
            </Label>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Wachtwoord wijzigen
          </CardTitle>
          <CardDescription>
            Minimaal 12 tekens met een hoofdletter, kleine letter, cijfer en speciaal teken
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Huidig wachtwoord</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Je huidige wachtwoord"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Je nieuwe wachtwoord"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Bevestig nieuw wachtwoord</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Herhaal je nieuwe wachtwoord"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            variant="outline"
          >
            <Lock className="h-4 w-4 mr-2" />
            {changingPassword ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
