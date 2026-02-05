'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchWithCsrf } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phoneConsent: false,
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchWithCsrf('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      // Handle CSRF and rate limit errors
      if (response.status === 403) {
        setError('Beveiligingstoken verlopen. Herlaad de pagina.')
        return
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        setError(retryAfter ? `Te veel pogingen. Probeer over ${retryAfter} seconden opnieuw.` : 'Te veel pogingen.')
        return
      }

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Registratie mislukt')
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registreren</CardTitle>
        <CardDescription>
          Maak een account aan om reserveringen te kunnen maken
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              type="text"
              placeholder="Voornaam Achternaam"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="naam@voorbeeld.nl"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimaal 12 tekens, met hoofdletter, kleine letter, cijfer en speciaal teken
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer (optioneel)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0612345678"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="phoneConsent"
              className="mt-1"
              {...register('phoneConsent')}
            />
            <Label htmlFor="phoneConsent" className="text-sm font-normal">
              Ik geef toestemming om mijn telefoonnummer te gebruiken voor contact over reserveringen
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Bezig met registreren...' : 'Registreren'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Al een account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inloggen
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
