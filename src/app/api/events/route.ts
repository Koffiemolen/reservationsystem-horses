import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { eventSchema } from '@/lib/validators'
import { createEvent, getEvents, getPublicEvents } from '@/services/event.service'

export async function GET(request: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)

    const startDate = searchParams.get('start')
      ? new Date(searchParams.get('start')!)
      : undefined
    const endDate = searchParams.get('end')
      ? new Date(searchParams.get('end')!)
      : undefined
    const resourceId = searchParams.get('resourceId') || undefined
    const publicOnly = searchParams.get('public') === 'true'

    // If not logged in or public only requested, return public events only
    if (!session?.user || publicOnly) {
      const events = await getPublicEvents(startDate, endDate)
      return NextResponse.json({ events })
    }

    // Determine visibility based on role
    let visibility: string[]
    if (session.user.role === 'ADMIN') {
      visibility = ['PUBLIC', 'MEMBERS', 'ADMIN']
    } else {
      visibility = ['PUBLIC', 'MEMBERS']
    }

    const events = await getEvents({
      visibility,
      resourceId,
      startDate,
      endDate,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get events error:', error)
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = eventSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const event = await createEvent(session.user.id, validatedData.data)

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
