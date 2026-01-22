import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import {
  getUserById,
  updateUserRole,
  disableUser,
  enableUser,
} from '@/services/user.service'

const updateSchema = z.object({
  role: z.enum(['USER', 'ORGANIZER', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  reason: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { id } = await params
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const validatedData = updateSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const { role, status, reason } = validatedData.data

    // Update role if provided
    if (role) {
      const user = await updateUserRole(id, session.user.id, role)
      return NextResponse.json({ user })
    }

    // Update status if provided
    if (status === 'DISABLED') {
      const result = await disableUser(id, session.user.id, reason)
      return NextResponse.json(result)
    }

    if (status === 'ACTIVE') {
      const user = await enableUser(id, session.user.id)
      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: 'Geen wijzigingen opgegeven' }, { status: 400 })
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Gebruiker niet gevonden' ||
        error.message === 'Gebruiker is al uitgeschakeld' ||
        error.message === 'Gebruiker is al actief'
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
