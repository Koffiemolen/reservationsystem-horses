import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getReservationsForCalendar } from '@/services/reservation.service'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!resourceId || !start || !end) {
      return NextResponse.json(
        { error: 'resourceId, start en end zijn verplicht' },
        { status: 400 }
      )
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    // Get reservations
    const reservations = await getReservationsForCalendar(
      resourceId,
      startDate,
      endDate,
      session.user.id
    )

    // Get blocks for the same period
    const blocks = await prisma.block.findMany({
      where: {
        resourceId,
        OR: [
          { startTime: { gte: startDate, lte: endDate } },
          { endTime: { gte: startDate, lte: endDate } },
          { startTime: { lte: startDate }, endTime: { gte: endDate } },
        ],
      },
      select: {
        id: true,
        reason: true,
        startTime: true,
        endTime: true,
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({
      reservations,
      blocks,
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
