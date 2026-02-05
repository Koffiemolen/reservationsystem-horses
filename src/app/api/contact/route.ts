import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactSchema } from '@/lib/validators'
import { ZodError } from 'zod'
import { validateSecurityMiddleware } from '@/middleware/index'

export async function POST(request: NextRequest) {
  // Security validation (CSRF + rate limiting)
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  try {
    const body = await request.json()

    // Check honeypot field - if filled, it's likely spam
    if (body.website) {
      // Silently accept but don't process
      return NextResponse.json({ success: true })
    }

    // Validate input
    const validatedData = contactSchema.parse(body)

    // Store contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subject: validatedData.subject,
        message: validatedData.message,
        status: 'NEW',
      },
    })

    // In production, this would send an email notification
    // For development, we log to console
    console.log('='.repeat(50))
    console.log('NEW CONTACT FORM SUBMISSION')
    console.log('='.repeat(50))
    console.log(`ID: ${submission.id}`)
    console.log(`Name: ${submission.name}`)
    console.log(`Email: ${submission.email}`)
    console.log(`Phone: ${submission.phone || 'Niet opgegeven'}`)
    console.log(`Subject: ${submission.subject}`)
    console.log(`Message: ${submission.message}`)
    console.log(`Time: ${submission.createdAt.toLocaleString('nl-NL')}`)
    console.log('='.repeat(50))

    return NextResponse.json({
      success: true,
      message: 'Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.',
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validatie mislukt', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden. Probeer het later opnieuw.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // This endpoint could be used by admins to retrieve submissions
  // For now, return method not allowed
  return NextResponse.json(
    { error: 'Methode niet toegestaan' },
    { status: 405 }
  )
}
