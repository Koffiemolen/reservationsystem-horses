import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkBlockConflicts, createBlock } from './block.service'
import { prisma } from '@/lib/db'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    block: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

// Mock email service
vi.mock('./email.service', () => ({
  sendBlockNotification: vi.fn(),
}))

describe('Block Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkBlockConflicts', () => {
    const resourceId = 'test-resource-id'
    const startTime = new Date('2026-03-15T10:00:00Z')
    const endTime = new Date('2026-03-15T11:00:00Z')

    it('should return empty array when no conflicts exist', async () => {
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])

      const conflicts = await checkBlockConflicts(resourceId, startTime, endTime)

      expect(conflicts).toEqual([])
    })

    it('should detect conflicting CONFIRMED reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          userId: 'user-1',
          startTime: new Date('2026-03-15T09:30:00Z'),
          endTime: new Date('2026-03-15T10:30:00Z'),
          purpose: 'TRAINING',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
      ]

      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)

      const conflicts = await checkBlockConflicts(resourceId, startTime, endTime)

      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toMatchObject({
        id: 'res-1',
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        purpose: 'TRAINING',
      })
    })

    it('should only check CONFIRMED reservations', async () => {
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])

      await checkBlockConflicts(resourceId, startTime, endTime)

      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CONFIRMED',
          }),
        })
      )
    })

    it('should detect multiple overlapping reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          userId: 'user-1',
          startTime: new Date('2026-03-15T09:30:00Z'),
          endTime: new Date('2026-03-15T10:30:00Z'),
          purpose: 'TRAINING',
          user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
        },
        {
          id: 'res-2',
          userId: 'user-2',
          startTime: new Date('2026-03-15T10:30:00Z'),
          endTime: new Date('2026-03-15T11:30:00Z'),
          purpose: 'LESSON',
          user: { id: 'user-2', name: 'User 2', email: 'user2@example.com' },
        },
      ]

      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)

      const conflicts = await checkBlockConflicts(resourceId, startTime, endTime)

      expect(conflicts).toHaveLength(2)
    })
  })

  describe('createBlock', () => {
    const createdById = 'admin-123'
    const validData = {
      resourceId: 'resource-1',
      reason: 'Maintenance',
      startTime: '2026-03-15T10:00:00Z',
      endTime: '2026-03-15T11:00:00Z',
      isRecurring: false,
    }

    it('should throw error when conflicts exist and not confirmed', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          userId: 'user-1',
          startTime: new Date('2026-03-15T10:00:00Z'),
          endTime: new Date('2026-03-15T11:00:00Z'),
          purpose: 'TRAINING',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
      ]

      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)

      await expect(createBlock(createdById, validData, false)).rejects.toThrow(
        'CONFLICTS_EXIST'
      )
    })

    it('should create block when no conflicts exist', async () => {
      const mockBlock = {
        id: 'block-new',
        resourceId: validData.resourceId,
        reason: validData.reason,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        isRecurring: false,
        recurrenceRule: null,
        createdById,
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        createdBy: { id: createdById, name: 'Admin User' },
      }

      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])
      vi.mocked(prisma.block.create).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await createBlock(createdById, validData)

      expect(result.block.id).toBe('block-new')
      expect(result.impactedReservations).toEqual([])
      expect(prisma.block.create).toHaveBeenCalled()
    })

    it('should mark conflicting reservations as IMPACTED when confirmed', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          userId: 'user-1',
          startTime: new Date('2026-03-15T10:00:00Z'),
          endTime: new Date('2026-03-15T11:00:00Z'),
          purpose: 'TRAINING',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
        {
          id: 'res-2',
          userId: 'user-2',
          startTime: new Date('2026-03-15T10:30:00Z'),
          endTime: new Date('2026-03-15T11:30:00Z'),
          purpose: 'LESSON',
          user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
        },
      ]

      const mockBlock = {
        id: 'block-new',
        resourceId: validData.resourceId,
        reason: validData.reason,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        createdById,
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        createdBy: { id: createdById, name: 'Admin User' },
      }

      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)
      vi.mocked(prisma.reservation.updateMany).mockResolvedValue({ count: 2 } as any)
      vi.mocked(prisma.block.create).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await createBlock(createdById, validData, true)

      expect(result.block.id).toBe('block-new')
      expect(result.impactedReservations).toHaveLength(2)
      expect(prisma.reservation.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['res-1', 'res-2'] } },
        data: { status: 'IMPACTED' },
      })
    })

    it('should create audit logs for impacted reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          userId: 'user-1',
          startTime: new Date('2026-03-15T10:00:00Z'),
          endTime: new Date('2026-03-15T11:00:00Z'),
          purpose: 'TRAINING',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
      ]

      const mockBlock = {
        id: 'block-new',
        resourceId: validData.resourceId,
        reason: validData.reason,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        createdById,
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        createdBy: { id: createdById, name: 'Admin User' },
      }

      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)
      vi.mocked(prisma.reservation.updateMany).mockResolvedValue({ count: 1 } as any)
      vi.mocked(prisma.block.create).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      await createBlock(createdById, validData, true)

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: createdById,
            action: 'UPDATE',
            entityType: 'Reservation',
            entityId: 'res-1',
          }),
        })
      )
    })

    it('should create audit log for block creation', async () => {
      const mockBlock = {
        id: 'block-new',
        resourceId: validData.resourceId,
        reason: validData.reason,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        createdById,
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        createdBy: { id: createdById, name: 'Admin User' },
      }

      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])
      vi.mocked(prisma.block.create).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      await createBlock(createdById, validData)

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: createdById,
            action: 'CREATE',
            entityType: 'Block',
            entityId: 'block-new',
          }),
        })
      )
    })

    it('should handle recurring blocks', async () => {
      const recurringData = {
        ...validData,
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
      }

      const mockBlock = {
        id: 'block-recurring',
        resourceId: recurringData.resourceId,
        reason: recurringData.reason,
        startTime: new Date(recurringData.startTime),
        endTime: new Date(recurringData.endTime),
        isRecurring: true,
        recurrenceRule: recurringData.recurrenceRule,
        createdById,
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        createdBy: { id: createdById, name: 'Admin User' },
      }

      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])
      vi.mocked(prisma.block.create).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await createBlock(createdById, recurringData)

      expect(result.block.isRecurring).toBe(true)
      expect(result.block.recurrenceRule).toBe('FREQ=WEEKLY;BYDAY=MO')
    })
  })
})
