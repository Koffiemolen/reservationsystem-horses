import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Fetch all public events, sorted by start date
    const events = await prisma.event.findMany({
      where: {
        visibility: 'PUBLIC',
      },
      include: {
        resources: {
          include: {
            resource: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    // Map to client format
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startTime.toISOString(),
      endDate: event.endTime.toISOString(),
      isPublic: event.visibility === 'PUBLIC',
      resources: event.resources,
    }))

    return NextResponse.json({ events: formattedEvents })
  } catch (error) {
    console.error('Error fetching public events:', error)
    return NextResponse.json(
      { error: 'Kon evenementen niet laden' },
      { status: 500 }
    )
  }
}
