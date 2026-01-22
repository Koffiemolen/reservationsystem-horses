import { prisma } from '@/lib/db'
import type { BlockInput } from '@/lib/validators'
import { sendBlockNotification } from '@/services/email.service'

export interface ConflictingReservation {
  id: string
  userId: string
  userName: string
  userEmail: string
  startTime: Date
  endTime: Date
  purpose: string
}

export async function checkBlockConflicts(
  resourceId: string,
  startTime: Date,
  endTime: Date
): Promise<ConflictingReservation[]> {
  const conflicting = await prisma.reservation.findMany({
    where: {
      resourceId,
      status: 'CONFIRMED',
      OR: [
        { startTime: { lte: startTime }, endTime: { gt: startTime } },
        { startTime: { lt: endTime }, endTime: { gte: endTime } },
        { startTime: { gte: startTime }, endTime: { lte: endTime } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return conflicting.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user.name,
    userEmail: r.user.email,
    startTime: r.startTime,
    endTime: r.endTime,
    purpose: r.purpose,
  }))
}

export async function createBlock(
  createdById: string,
  data: BlockInput,
  confirmConflicts: boolean = false
) {
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)

  // Check for conflicting reservations
  const conflicts = await checkBlockConflicts(data.resourceId, startTime, endTime)

  if (conflicts.length > 0 && !confirmConflicts) {
    throw new Error(`CONFLICTS_EXIST:${JSON.stringify(conflicts)}`)
  }

  // If confirmed, mark conflicting reservations as IMPACTED
  if (conflicts.length > 0 && confirmConflicts) {
    await prisma.reservation.updateMany({
      where: {
        id: { in: conflicts.map((c) => c.id) },
      },
      data: {
        status: 'IMPACTED',
      },
    })

    // Create audit logs for impacted reservations
    for (const conflict of conflicts) {
      await prisma.auditLog.create({
        data: {
          userId: createdById,
          action: 'UPDATE',
          entityType: 'Reservation',
          entityId: conflict.id,
          changes: JSON.stringify({
            status: { from: 'CONFIRMED', to: 'IMPACTED' },
            reason: `Block created: ${data.reason}`,
          }),
        },
      })
    }
  }

  // Create the block
  const block = await prisma.block.create({
    data: {
      resourceId: data.resourceId,
      reason: data.reason,
      startTime,
      endTime,
      isRecurring: data.isRecurring,
      recurrenceRule: data.recurrenceRule,
      createdById,
    },
    include: {
      resource: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: createdById,
      action: 'CREATE',
      entityType: 'Block',
      entityId: block.id,
      changes: JSON.stringify({
        resourceId: data.resourceId,
        reason: data.reason,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        impactedReservations: conflicts.length,
      }),
    },
  })

  // Send email notifications to affected users
  if (conflicts.length > 0) {
    // Group conflicts by user
    const conflictsByUser = conflicts.reduce((acc, conflict) => {
      if (!acc[conflict.userId]) {
        acc[conflict.userId] = {
          userName: conflict.userName,
          userEmail: conflict.userEmail,
          reservations: [],
        }
      }
      acc[conflict.userId].reservations.push({
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        purpose: conflict.purpose,
      })
      return acc
    }, {} as Record<string, { userName: string; userEmail: string; reservations: Array<{ startTime: Date; endTime: Date; purpose: string }> }>)

    // Send email to each affected user
    for (const userData of Object.values(conflictsByUser)) {
      await sendBlockNotification({
        userName: userData.userName,
        userEmail: userData.userEmail,
        resourceName: block.resource.name,
        startTime: block.startTime,
        endTime: block.endTime,
        reason: block.reason,
        affectedReservations: userData.reservations,
      })
    }
  }

  return { block, impactedReservations: conflicts }
}

export async function updateBlock(
  blockId: string,
  userId: string,
  data: Partial<BlockInput>
) {
  const existing = await prisma.block.findUnique({
    where: { id: blockId },
  })

  if (!existing) {
    throw new Error('Block niet gevonden')
  }

  const startTime = data.startTime ? new Date(data.startTime) : existing.startTime
  const endTime = data.endTime ? new Date(data.endTime) : existing.endTime
  const resourceId = data.resourceId || existing.resourceId

  const block = await prisma.block.update({
    where: { id: blockId },
    data: {
      resourceId,
      reason: data.reason || existing.reason,
      startTime,
      endTime,
      isRecurring: data.isRecurring ?? existing.isRecurring,
      recurrenceRule: data.recurrenceRule ?? existing.recurrenceRule,
    },
    include: {
      resource: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE',
      entityType: 'Block',
      entityId: block.id,
      changes: JSON.stringify({
        before: {
          reason: existing.reason,
          startTime: existing.startTime.toISOString(),
          endTime: existing.endTime.toISOString(),
        },
        after: {
          reason: block.reason,
          startTime: block.startTime.toISOString(),
          endTime: block.endTime.toISOString(),
        },
      }),
    },
  })

  return block
}

export async function deleteBlock(blockId: string, userId: string) {
  const existing = await prisma.block.findUnique({
    where: { id: blockId },
  })

  if (!existing) {
    throw new Error('Block niet gevonden')
  }

  // Find and restore impacted reservations
  const impactedReservations = await prisma.reservation.findMany({
    where: {
      resourceId: existing.resourceId,
      status: 'IMPACTED',
      OR: [
        { startTime: { lte: existing.startTime }, endTime: { gt: existing.startTime } },
        { startTime: { lt: existing.endTime }, endTime: { gte: existing.endTime } },
        { startTime: { gte: existing.startTime }, endTime: { lte: existing.endTime } },
      ],
    },
  })

  // Restore reservations to CONFIRMED
  if (impactedReservations.length > 0) {
    await prisma.reservation.updateMany({
      where: {
        id: { in: impactedReservations.map((r) => r.id) },
      },
      data: {
        status: 'CONFIRMED',
      },
    })
  }

  // Delete the block
  await prisma.block.delete({
    where: { id: blockId },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'DELETE',
      entityType: 'Block',
      entityId: blockId,
      changes: JSON.stringify({
        reason: existing.reason,
        restoredReservations: impactedReservations.length,
      }),
    },
  })

  return { deletedId: blockId, restoredReservations: impactedReservations.length }
}

export async function getBlocks(resourceId?: string, includeExpired: boolean = false) {
  const where: { resourceId?: string; endTime?: { gte: Date } } = {}

  if (resourceId) {
    where.resourceId = resourceId
  }

  if (!includeExpired) {
    where.endTime = { gte: new Date() }
  }

  return prisma.block.findMany({
    where,
    include: {
      resource: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })
}
