import { prisma } from '@/lib/db'
import { type ReservationInput } from '@/lib/validators'
import { sendReservationConfirmation, sendReservationCancellation } from '@/services/email.service'

export interface OverlapResult {
  hasOverlaps: boolean
  hasBlock: boolean
  overlappingReservations: {
    id: string
    startTime: Date
    endTime: Date
    purpose: string
  }[]
  block: {
    id: string
    reason: string
    startTime: Date
    endTime: Date
  } | null
}

export async function checkOverlaps(
  resourceId: string,
  startTime: Date,
  endTime: Date,
  excludeReservationId?: string
): Promise<OverlapResult> {
  // Check for blocks
  const block = await prisma.block.findFirst({
    where: {
      resourceId,
      OR: [
        { startTime: { lte: startTime }, endTime: { gt: startTime } },
        { startTime: { lt: endTime }, endTime: { gte: endTime } },
        { startTime: { gte: startTime }, endTime: { lte: endTime } },
      ],
    },
    select: {
      id: true,
      reason: true,
      startTime: true,
      endTime: true,
    },
  })

  // Check for overlapping reservations
  const overlappingReservations = await prisma.reservation.findMany({
    where: {
      resourceId,
      status: 'CONFIRMED',
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      OR: [
        { startTime: { lte: startTime }, endTime: { gt: startTime } },
        { startTime: { lt: endTime }, endTime: { gte: endTime } },
        { startTime: { gte: startTime }, endTime: { lte: endTime } },
      ],
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      purpose: true,
    },
  })

  return {
    hasOverlaps: overlappingReservations.length > 0,
    hasBlock: block !== null,
    overlappingReservations,
    block,
  }
}

export async function createReservation(
  userId: string,
  data: ReservationInput
) {
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)

  // Check for blocks first
  const overlapResult = await checkOverlaps(data.resourceId, startTime, endTime)

  if (overlapResult.hasBlock) {
    throw new Error(`TIME_BLOCKED:${JSON.stringify(overlapResult.block)}`)
  }

  // If there are overlaps and user hasn't acknowledged
  if (overlapResult.hasOverlaps && !data.acknowledgeOverlap) {
    throw new Error(`OVERLAP_EXISTS:${JSON.stringify(overlapResult.overlappingReservations)}`)
  }

  // Create the reservation
  const reservation = await prisma.reservation.create({
    data: {
      userId,
      resourceId: data.resourceId,
      startTime,
      endTime,
      purpose: data.purpose,
      notes: data.notes,
      status: 'CONFIRMED',
    },
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

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      entityType: 'Reservation',
      entityId: reservation.id,
      changes: JSON.stringify({
        resourceId: data.resourceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        purpose: data.purpose,
      }),
    },
  })

  // Send confirmation email
  await sendReservationConfirmation({
    userName: reservation.user.name,
    userEmail: reservation.user.email,
    resourceName: reservation.resource.name,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    purpose: reservation.purpose,
    notes: reservation.notes,
  })

  return reservation
}

export async function updateReservation(
  reservationId: string,
  userId: string,
  data: Partial<ReservationInput>,
  isAdmin: boolean = false
) {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
  })

  if (!existing) {
    throw new Error('Reservering niet gevonden')
  }

  if (!isAdmin && existing.userId !== userId) {
    throw new Error('Geen toestemming om deze reservering te bewerken')
  }

  const startTime = data.startTime ? new Date(data.startTime) : existing.startTime
  const endTime = data.endTime ? new Date(data.endTime) : existing.endTime
  const resourceId = data.resourceId || existing.resourceId

  // Check for overlaps if time or resource changed
  if (data.startTime || data.endTime || data.resourceId) {
    const overlapResult = await checkOverlaps(resourceId, startTime, endTime, reservationId)

    if (overlapResult.hasBlock) {
      throw new Error(`TIME_BLOCKED:${JSON.stringify(overlapResult.block)}`)
    }

    if (overlapResult.hasOverlaps && !data.acknowledgeOverlap) {
      throw new Error(`OVERLAP_EXISTS:${JSON.stringify(overlapResult.overlappingReservations)}`)
    }
  }

  const reservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      resourceId,
      startTime,
      endTime,
      purpose: data.purpose || existing.purpose,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    },
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

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE',
      entityType: 'Reservation',
      entityId: reservation.id,
      changes: JSON.stringify({
        before: {
          startTime: existing.startTime.toISOString(),
          endTime: existing.endTime.toISOString(),
          purpose: existing.purpose,
        },
        after: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          purpose: data.purpose || existing.purpose,
        },
      }),
    },
  })

  return reservation
}

export async function cancelReservation(
  reservationId: string,
  userId: string,
  reason?: string,
  isAdmin: boolean = false
) {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
  })

  if (!existing) {
    throw new Error('Reservering niet gevonden')
  }

  if (!isAdmin && existing.userId !== userId) {
    throw new Error('Geen toestemming om deze reservering te annuleren')
  }

  const reservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason || 'Geannuleerd door gebruiker',
    },
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

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CANCEL',
      entityType: 'Reservation',
      entityId: reservation.id,
      changes: JSON.stringify({
        cancelledAt: new Date().toISOString(),
        cancelReason: reason || 'Geannuleerd door gebruiker',
      }),
    },
  })

  // Send cancellation email
  await sendReservationCancellation({
    userName: reservation.user.name,
    userEmail: reservation.user.email,
    resourceName: reservation.resource.name,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    purpose: reservation.purpose,
    reason,
  })

  return reservation
}

export async function getReservationsForCalendar(
  resourceId: string,
  startDate: Date,
  endDate: Date,
  currentUserId?: string
) {
  const reservations = await prisma.reservation.findMany({
    where: {
      resourceId,
      status: { not: 'CANCELLED' },
      OR: [
        { startTime: { gte: startDate, lte: endDate } },
        { endTime: { gte: startDate, lte: endDate } },
        { startTime: { lte: startDate }, endTime: { gte: endDate } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })

  // Format reservations for calendar — show names for all (small community),
  // but keep notes private to the reservation owner
  return reservations.map((r) => ({
    id: r.id,
    startTime: r.startTime,
    endTime: r.endTime,
    purpose: r.purpose,
    status: r.status,
    isOwn: r.userId === currentUserId,
    userName: r.user.name,
    notes: r.userId === currentUserId ? r.notes : undefined,
  }))
}

export async function getUserReservations(userId: string, includeHistory: boolean = false) {
  const where: { userId: string; status?: { not: string } } = { userId }

  if (!includeHistory) {
    where.status = { not: 'CANCELLED' }
  }

  return prisma.reservation.findMany({
    where,
    include: {
      resource: true,
    },
    orderBy: { startTime: 'desc' },
  })
}
