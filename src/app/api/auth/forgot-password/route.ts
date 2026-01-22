import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { passwordResetRequestSchema } from '@/lib/validators'
import { sendPasswordReset } from '@/services/email.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = passwordResetRequestSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      )
    }

    const { email } = validatedData.data

    // Find user (don't reveal if user exists or not)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user || user.status !== 'ACTIVE') {
      // Log attempt but return success
      console.log('Password reset requested for non-existent/disabled user:', email)
      return NextResponse.json({ message: 'Als er een account bestaat, ontvang je een e-mail' })
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    })

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Send password reset email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/wachtwoord-reset?token=${token}`

    await sendPasswordReset({
      userName: user.name,
      userEmail: user.email,
      resetToken: token,
      resetUrl,
    })

    return NextResponse.json({ message: 'Als er een account bestaat, ontvang je een e-mail' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
