import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { reservationSchema } from '@/lib/validators'
import { updateReservation, cancelReservation } from '@/services/reservation.service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        resource: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Reservering niet gevonden' }, { status: 404 })
    }

    // Only owner or admin can see full details
    const isOwner = reservation.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Geen toestemming om deze reservering te bekijken' },
        { status: 403 }
      )
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Get reservation error:', error)
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

    const { id } = await params
    const body = await request.json()

    // Partial validation
    const validatedData = reservationSchema.partial().safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const isAdmin = session.user.role === 'ADMIN'
    const reservation = await updateReservation(
      id,
      session.user.id,
      validatedData.data,
      isAdmin
    )

    return NextResponse.json({ reservation })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('TIME_BLOCKED:')) {
        const block = JSON.parse(error.message.replace('TIME_BLOCKED:', ''))
        return NextResponse.json(
          {
            error: 'TIME_BLOCKED',
            message: 'Dit tijdslot is geblokkeerd',
            block,
          },
          { status: 409 }
        )
      }

      if (error.message.startsWith('OVERLAP_EXISTS:')) {
        const overlaps = JSON.parse(error.message.replace('OVERLAP_EXISTS:', ''))
        return NextResponse.json(
          {
            warning: 'OVERLAP_EXISTS',
            message: 'Er zijn al reserveringen in deze periode',
            overlaps,
            requiresAcknowledge: true,
          },
          { status: 200 }
        )
      }

      if (error.message === 'Reservering niet gevonden') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      if (error.message.includes('Geen toestemming')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error('Update reservation error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || undefined

    const isAdmin = session.user.role === 'ADMIN'
    const reservation = await cancelReservation(id, session.user.id, reason, isAdmin)

    return NextResponse.json({ reservation })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Reservering niet gevonden') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      if (error.message.includes('Geen toestemming')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
    }

    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
