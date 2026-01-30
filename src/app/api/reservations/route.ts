import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { reservationSchema } from '@/lib/validators'
import { createReservation, getUserReservations } from '@/services/reservation.service'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('history') === 'true'

    const reservations = await getUserReservations(session.user.id, includeHistory)

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = reservationSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const reservation = await createReservation(session.user.id, validatedData.data)

    return NextResponse.json({ reservation }, { status: 201 })
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
    }

    console.error('Create reservation error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het maken van de reservering' },
      { status: 500 }
    )
  }
}
