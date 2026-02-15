import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateSecurityMiddleware } from '@/security'
import { testEmailSchema } from '@/lib/validators'
import { testEmailConnection } from '@/services/system.service'

export async function POST(request: Request) {
  // Security validation (CSRF + rate limiting)
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = testEmailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await testEmailConnection(parsed.data.email)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test email API error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van de test email' },
      { status: 500 }
    )
  }
}
