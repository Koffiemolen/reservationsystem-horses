import { prisma } from '@/lib/db'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL' | 'DISABLE'
export type EntityType = 'User' | 'Reservation' | 'Block' | 'Event' | 'Resource'

export async function createAuditLog(
  userId: string | null,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  changes?: Record<string, unknown>
) {
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      changes: changes ? JSON.stringify(changes) : null,
    },
  })
}

export async function getAuditLogs(options: {
  entityType?: EntityType
  entityId?: string
  userId?: string
  limit?: number
  offset?: number
}) {
  const { entityType, entityId, userId, limit = 50, offset = 0 } = options

  const where: {
    entityType?: EntityType
    entityId?: string
    userId?: string
  } = {}

  if (entityType) where.entityType = entityType
  if (entityId) where.entityId = entityId
  if (userId) where.userId = userId

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs: logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null,
    })),
    total,
    hasMore: offset + logs.length < total,
  }
}

export async function getEntityHistory(entityType: EntityType, entityId: string) {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return logs.map((log) => ({
    ...log,
    changes: log.changes ? JSON.parse(log.changes) : null,
  }))
}
