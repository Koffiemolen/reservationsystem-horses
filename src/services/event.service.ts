import { prisma } from '@/lib/db'
import type { EventInput } from '@/lib/validators'

export async function createEvent(createdById: string, data: EventInput) {
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)

  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      startTime,
      endTime,
      visibility: data.visibility,
      createdById,
      resources: data.resourceIds?.length
        ? {
            create: data.resourceIds.map((resourceId) => ({
              resourceId,
            })),
          }
        : undefined,
    },
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

  await prisma.auditLog.create({
    data: {
      userId: createdById,
      action: 'CREATE',
      entityType: 'Event',
      entityId: event.id,
      changes: JSON.stringify({
        title: data.title,
        visibility: data.visibility,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      }),
    },
  })

  return event
}

export async function updateEvent(
  eventId: string,
  userId: string,
  data: Partial<EventInput>
) {
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    include: { resources: true },
  })

  if (!existing) {
    throw new Error('Evenement niet gevonden')
  }

  const startTime = data.startTime ? new Date(data.startTime) : existing.startTime
  const endTime = data.endTime ? new Date(data.endTime) : existing.endTime

  // Update resources if provided
  if (data.resourceIds !== undefined) {
    // Delete existing resource connections
    await prisma.eventResource.deleteMany({
      where: { eventId },
    })

    // Create new resource connections
    if (data.resourceIds.length > 0) {
      await prisma.eventResource.createMany({
        data: data.resourceIds.map((resourceId) => ({
          eventId,
          resourceId,
        })),
      })
    }
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: data.title || existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      startTime,
      endTime,
      visibility: data.visibility || existing.visibility,
    },
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

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE',
      entityType: 'Event',
      entityId: event.id,
      changes: JSON.stringify({
        before: {
          title: existing.title,
          visibility: existing.visibility,
          startTime: existing.startTime.toISOString(),
          endTime: existing.endTime.toISOString(),
        },
        after: {
          title: event.title,
          visibility: event.visibility,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime.toISOString(),
        },
      }),
    },
  })

  return event
}

export async function deleteEvent(eventId: string, userId: string) {
  const existing = await prisma.event.findUnique({
    where: { id: eventId },
  })

  if (!existing) {
    throw new Error('Evenement niet gevonden')
  }

  await prisma.event.delete({
    where: { id: eventId },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'DELETE',
      entityType: 'Event',
      entityId: eventId,
      changes: JSON.stringify({
        title: existing.title,
        visibility: existing.visibility,
      }),
    },
  })

  return { deletedId: eventId }
}

export async function getEvents(options: {
  visibility?: string[]
  resourceId?: string
  startDate?: Date
  endDate?: Date
  includeExpired?: boolean
}) {
  const { visibility, resourceId, startDate, endDate, includeExpired = false } = options

  const where: {
    visibility?: { in: string[] }
    startTime?: { gte?: Date; lte?: Date }
    endTime?: { gte: Date }
    resources?: { some: { resourceId: string } }
  } = {}

  if (visibility) {
    where.visibility = { in: visibility }
  }

  if (!includeExpired) {
    where.endTime = { gte: new Date() }
  }

  if (startDate) {
    where.startTime = { ...where.startTime, gte: startDate }
  }

  if (endDate) {
    where.startTime = { ...where.startTime, lte: endDate }
  }

  if (resourceId) {
    where.resources = { some: { resourceId } }
  }

  return prisma.event.findMany({
    where,
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
    orderBy: { startTime: 'asc' },
  })
}

export async function getPublicEvents(startDate?: Date, endDate?: Date) {
  return getEvents({
    visibility: ['PUBLIC'],
    startDate,
    endDate,
    includeExpired: false,
  })
}
