import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { validateSecurityMiddleware } from '@/security'
import { passwordSchema } from '@/lib/validators'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Naam moet minimaal 2 tekens bevatten').optional(),
  phone: z.string().optional(),
  phoneConsent: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) return false
  return true
}, {
  message: 'Huidig wachtwoord is verplicht om een nieuw wachtwoord in te stellen',
  path: ['currentPassword'],
})

export async function GET(request: Request) {
  const securityError = await validateSecurityMiddleware(request, { skipCsrf: true })
  if (securityError) return securityError

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneConsent: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            reservations: { where: { status: 'CONFIRMED' } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateProfileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, phone, phoneConsent, currentPassword, newPassword } = validated.data

    // If changing password, verify the current one
    if (newPassword && currentPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { passwordHash: true },
      })

      if (!user) {
        return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Huidig wachtwoord is onjuist' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (phoneConsent !== undefined) updateData.phoneConsent = phoneConsent
    if (newPassword) {
      updateData.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        phoneConsent: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: session.user.id,
        changes: JSON.stringify({
          fields: Object.keys(updateData).filter(k => k !== 'passwordHash'),
          passwordChanged: !!newPassword,
        }),
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
