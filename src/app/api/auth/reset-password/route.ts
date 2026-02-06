import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { passwordSchema } from '@/lib/validators'
import { z } from 'zod'
import { validateSecurityMiddleware } from '@/security'

const resetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export async function POST(request: Request) {
  // Security validation (CSRF + rate limiting)
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  try {
    const body = await request.json()
    const validatedData = resetSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens' },
        { status: 400 }
      )
    }

    const { token, password } = validatedData.data

    // Find reset token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!passwordReset) {
      return NextResponse.json(
        { error: 'Ongeldige of verlopen reset link' },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (passwordReset.expiresAt < new Date()) {
      await prisma.passwordReset.delete({ where: { id: passwordReset.id } })
      return NextResponse.json(
        { error: 'Reset link is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (passwordReset.usedAt) {
      return NextResponse.json(
        { error: 'Deze reset link is al gebruikt' },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          userId: passwordReset.userId,
          action: 'UPDATE',
          entityType: 'User',
          entityId: passwordReset.userId,
          changes: JSON.stringify({ passwordChanged: true }),
        },
      }),
    ])

    return NextResponse.json({ message: 'Wachtwoord gewijzigd' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
