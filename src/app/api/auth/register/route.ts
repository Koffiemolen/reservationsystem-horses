import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { registerSchema } from '@/lib/validators'
import { sendWelcomeEmail } from '@/services/email.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password, phone, phoneConsent } = validatedData.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Er bestaat al een account met dit e-mailadres' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        phoneConsent: phoneConsent || false,
      },
    })

    // Log the registration
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        changes: JSON.stringify({ email: user.email, name: user.name }),
      },
    })

    // Send welcome email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    await sendWelcomeEmail({
      userName: user.name,
      userEmail: user.email,
      loginUrl: `${baseUrl}/login`,
    })

    return NextResponse.json(
      { message: 'Account aangemaakt', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het registreren' },
      { status: 500 }
    )
  }
}
