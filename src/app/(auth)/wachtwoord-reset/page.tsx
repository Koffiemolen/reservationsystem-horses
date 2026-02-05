'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { passwordSchema } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { fetchWithCsrf } from '@/lib/utils'

const resetFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
  })

type ResetFormInput = z.infer<typeof resetFormSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInput>({
    resolver: zodResolver(resetFormSchema),
  })

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ongeldige link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Deze reset link is ongeldig of verlopen. Vraag een nieuwe reset link aan.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/wachtwoord-vergeten" className="w-full">
            <Button className="w-full">Nieuwe link aanvragen</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  const onSubmit = async (data: ResetFormInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchWithCsrf('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
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
        setError(result.error || 'Er is een fout opgetreden')
        return
      }

      router.push('/login?reset=true')
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nieuw wachtwoord instellen</CardTitle>
        <CardDescription>
          Kies een nieuw wachtwoord voor je account
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
            <Label htmlFor="password">Nieuw wachtwoord</Label>
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
            <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Bezig met opslaan...' : 'Wachtwoord opslaan'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Laden...</p>
        </CardContent>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
