import { prisma } from '@/lib/db'

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          reservations: {
            where: { status: 'CONFIRMED' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      phoneConsent: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reservations: {
        orderBy: { startTime: 'desc' },
        take: 20,
        include: {
          resource: true,
        },
      },
    },
  })
}

export async function updateUserRole(
  userId: string,
  adminUserId: string,
  newRole: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('Gebruiker niet gevonden')
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      changes: JSON.stringify({
        field: 'role',
        from: user.role,
        to: newRole,
      }),
    },
  })

  return updatedUser
}

export async function disableUser(
  userId: string,
  adminUserId: string,
  reason?: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('Gebruiker niet gevonden')
  }

  if (user.status === 'DISABLED') {
    throw new Error('Gebruiker is al uitgeschakeld')
  }

  // Get all future reservations for this user
  const futureReservations = await prisma.reservation.findMany({
    where: {
      userId,
      status: 'CONFIRMED',
      startTime: { gte: new Date() },
    },
  })

  // Disable user and cancel all future reservations
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { status: 'DISABLED' },
    }),
    prisma.reservation.updateMany({
      where: {
        userId,
        status: 'CONFIRMED',
        startTime: { gte: new Date() },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason || 'Account uitgeschakeld door beheerder',
      },
    }),
  ])

  // Create audit log for user disable
  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'DISABLE',
      entityType: 'User',
      entityId: userId,
      changes: JSON.stringify({
        reason: reason || 'Account uitgeschakeld door beheerder',
        cancelledReservations: futureReservations.length,
      }),
    },
  })

  // Create audit logs for cancelled reservations
  for (const reservation of futureReservations) {
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CANCEL',
        entityType: 'Reservation',
        entityId: reservation.id,
        changes: JSON.stringify({
          reason: 'Account uitgeschakeld door beheerder',
        }),
      },
    })
  }

  return {
    user: updatedUser,
    cancelledReservations: futureReservations.length,
  }
}

export async function enableUser(userId: string, adminUserId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('Gebruiker niet gevonden')
  }

  if (user.status === 'ACTIVE') {
    throw new Error('Gebruiker is al actief')
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
  })

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'UPDATE',
      entityType: 'User',
      entityId: userId,
      changes: JSON.stringify({
        field: 'status',
        from: 'DISABLED',
        to: 'ACTIVE',
      }),
    },
  })

  return updatedUser
}

export async function getUserCancellationHistory(userId: string) {
  return prisma.reservation.findMany({
    where: {
      userId,
      status: 'CANCELLED',
    },
    include: {
      resource: true,
    },
    orderBy: { cancelledAt: 'desc' },
  })
}
