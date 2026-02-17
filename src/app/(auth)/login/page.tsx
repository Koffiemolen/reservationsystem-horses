'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/agenda'
  const registered = searchParams.get('registered')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Ongeldige e-mail of wachtwoord')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inloggen</CardTitle>
        <CardDescription>
          Log in om reserveringen te maken en beheren
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {registered && (
            <Alert>
              <AlertDescription>
                Account aangemaakt! Je kunt nu inloggen.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Wachtwoord</Label>
              <Link
                href="/wachtwoord-vergeten"
                className="text-sm text-primary hover:underline"
              >
                Wachtwoord vergeten?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Nog geen account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Registreer
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginFallback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inloggen</CardTitle>
        <CardDescription>
          Log in om reserveringen te maken en beheren
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>E-mailadres</Label>
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="space-y-2">
          <Label>Wachtwoord</Label>
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  )
}
