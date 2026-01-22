import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { eventSchema } from '@/lib/validators'
import { updateEvent, deleteEvent } from '@/services/event.service'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        resources: {
          include: {
            resource: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Evenement niet gevonden' }, { status: 404 })
    }

    // Check visibility permissions
    const session = await auth()
    if (event.visibility !== 'PUBLIC') {
      if (!session?.user) {
        return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
      }
      if (event.visibility === 'ADMIN' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
      }
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Get event error:', error)
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

    const validatedData = eventSchema.partial().safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }

    const event = await updateEvent(id, session.user.id, validatedData.data)

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Evenement niet gevonden') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error('Update event error:', error)
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const { id } = await params
    const result = await deleteEvent(id, session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Evenement niet gevonden') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
