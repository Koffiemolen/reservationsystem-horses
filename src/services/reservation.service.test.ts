import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkOverlaps, createReservation } from './reservation.service'
import { prisma } from '@/lib/db'

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    block: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

// Mock email service
vi.mock('./email.service', () => ({
  sendReservationConfirmation: vi.fn(),
  sendReservationCancellation: vi.fn(),
}))

describe('Reservation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkOverlaps', () => {
    const resourceId = 'test-resource-id'
    const startTime = new Date('2026-03-15T10:00:00Z')
    const endTime = new Date('2026-03-15T11:00:00Z')

    it('should detect no overlaps when time slot is free', async () => {
      // Mock: No blocks or reservations
      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result).toEqual({
        hasOverlaps: false,
        hasBlock: false,
        overlappingReservations: [],
        block: null,
      })
    })

    it('should detect block in time slot', async () => {
      const mockBlock = {
        id: 'block-1',
        reason: 'Maintenance',
        startTime: new Date('2026-03-15T09:30:00Z'),
        endTime: new Date('2026-03-15T10:30:00Z'),
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result.hasBlock).toBe(true)
      expect(result.block).toEqual(mockBlock)
    })

    it('should detect overlapping reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          startTime: new Date('2026-03-15T09:30:00Z'),
          endTime: new Date('2026-03-15T10:30:00Z'),
          purpose: 'TRAINING',
        },
        {
          id: 'res-2',
          startTime: new Date('2026-03-15T10:30:00Z'),
          endTime: new Date('2026-03-15T11:30:00Z'),
          purpose: 'LESSON',
        },
      ]

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result.hasOverlaps).toBe(true)
      expect(result.overlappingReservations).toHaveLength(2)
    })

    it('should handle edge case: exact same start/end time', async () => {
      const mockReservation = {
        id: 'res-1',
        startTime: new Date('2026-03-15T10:00:00Z'),
        endTime: new Date('2026-03-15T11:00:00Z'),
        purpose: 'TRAINING',
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([mockReservation] as any)

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result.hasOverlaps).toBe(true)
    })

    it('should exclude specific reservation ID from overlap check', async () => {
      const mockReservation = {
        id: 'res-1',
        startTime: new Date('2026-03-15T10:00:00Z'),
        endTime: new Date('2026-03-15T11:00:00Z'),
        purpose: 'TRAINING',
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])

      // Call with excludeReservationId
      const result = await checkOverlaps(resourceId, startTime, endTime, 'res-1')

      expect(result.hasOverlaps).toBe(false)
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: 'res-1' },
          }),
        })
      )
    })

    it('should detect partial overlap at start boundary', async () => {
      const mockReservation = {
        id: 'res-1',
        startTime: new Date('2026-03-15T09:30:00Z'),
        endTime: new Date('2026-03-15T10:15:00Z'),
        purpose: 'TRAINING',
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([mockReservation] as any)

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result.hasOverlaps).toBe(true)
    })

    it('should detect partial overlap at end boundary', async () => {
      const mockReservation = {
        id: 'res-1',
        startTime: new Date('2026-03-15T10:45:00Z'),
        endTime: new Date('2026-03-15T11:30:00Z'),
        purpose: 'TRAINING',
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([mockReservation] as any)

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result.hasOverlaps).toBe(true)
    })

    it('should detect reservation completely contained within slot', async () => {
      const mockReservation = {
        id: 'res-1',
        startTime: new Date('2026-03-15T10:15:00Z'),
        endTime: new Date('2026-03-15T10:45:00Z'),
        purpose: 'TRAINING',
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([mockReservation] as any)

      const result = await checkOverlaps(resourceId, startTime, endTime)

      expect(result.hasOverlaps).toBe(true)
    })
  })

  describe('createReservation', () => {
    const userId = 'user-123'
    const validData = {
      resourceId: 'resource-1',
      startTime: '2026-03-15T10:00:00Z',
      endTime: '2026-03-15T11:00:00Z',
      purpose: 'TRAINING' as const,
      notes: 'Training session',
    }

    it('should throw error when time slot is blocked', async () => {
      const mockBlock = {
        id: 'block-1',
        reason: 'Maintenance',
        startTime: new Date('2026-03-15T09:30:00Z'),
        endTime: new Date('2026-03-15T10:30:00Z'),
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(mockBlock as any)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])

      await expect(createReservation(userId, validData)).rejects.toThrow('TIME_BLOCKED')
    })

    it('should throw error when overlaps exist and not acknowledged', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          startTime: new Date('2026-03-15T10:00:00Z'),
          endTime: new Date('2026-03-15T11:00:00Z'),
          purpose: 'TRAINING',
        },
      ]

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)

      await expect(createReservation(userId, validData)).rejects.toThrow('OVERLAP_EXISTS')
    })

    it('should create reservation when time slot is free', async () => {
      const mockReservation = {
        id: 'res-new',
        userId,
        resourceId: validData.resourceId,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        purpose: validData.purpose,
        notes: validData.notes,
        status: 'CONFIRMED',
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        user: { id: userId, name: 'Test User', email: 'test@example.com' },
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])
      vi.mocked(prisma.reservation.create).mockResolvedValue(mockReservation as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const result = await createReservation(userId, validData)

      expect(result.id).toBe('res-new')
      expect(result.status).toBe('CONFIRMED')
      expect(prisma.reservation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            resourceId: validData.resourceId,
            purpose: validData.purpose,
            status: 'CONFIRMED',
          }),
        })
      )
    })

    it('should create reservation when overlap is acknowledged', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          startTime: new Date('2026-03-15T10:00:00Z'),
          endTime: new Date('2026-03-15T11:00:00Z'),
          purpose: 'TRAINING',
        },
      ]

      const mockReservation = {
        id: 'res-new',
        userId,
        resourceId: validData.resourceId,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        purpose: validData.purpose,
        status: 'CONFIRMED',
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        user: { id: userId, name: 'Test User', email: 'test@example.com' },
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue(mockReservations as any)
      vi.mocked(prisma.reservation.create).mockResolvedValue(mockReservation as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      const dataWithAcknowledge = { ...validData, acknowledgeOverlap: true }
      const result = await createReservation(userId, dataWithAcknowledge)

      expect(result.id).toBe('res-new')
      expect(prisma.reservation.create).toHaveBeenCalled()
    })

    it('should create audit log when reservation is created', async () => {
      const mockReservation = {
        id: 'res-new',
        userId,
        resourceId: validData.resourceId,
        startTime: new Date(validData.startTime),
        endTime: new Date(validData.endTime),
        purpose: validData.purpose,
        status: 'CONFIRMED',
        resource: { id: 'resource-1', name: 'Rijhal binnen' },
        user: { id: userId, name: 'Test User', email: 'test@example.com' },
      }

      vi.mocked(prisma.block.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.reservation.findMany).mockResolvedValue([])
      vi.mocked(prisma.reservation.create).mockResolvedValue(mockReservation as any)
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)

      await createReservation(userId, validData)

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            action: 'CREATE',
            entityType: 'Reservation',
            entityId: 'res-new',
          }),
        })
      )
    })
  })
})
