import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST, GET } from './route'
import { auth } from '@/lib/auth'
import * as reservationService from '@/services/reservation.service'

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

// Mock reservation service
vi.mock('@/services/reservation.service', () => ({
  createReservation: vi.fn(),
  getUserReservations: vi.fn(),
}))

// Mock security middleware
vi.mock('@/security', () => ({
  validateSecurityMiddleware: vi.fn().mockResolvedValue(null),
}))

describe('POST /api/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 'res-1',
        startTime: '2026-03-15T10:00:00Z',
        endTime: '2026-03-15T11:00:00Z',
        purpose: 'TRAINING',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Niet ingelogd')
  })

  it('should return 400 for invalid input data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2026-12-31',
    } as any)

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 'res-1',
        // Missing startTime and endTime
        purpose: 'TRAINING',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Ongeldige gegevens')
  })

  it('should return 409 when time slot is blocked', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2026-12-31',
    } as any)

    const blockError = new Error(
      `TIME_BLOCKED:${JSON.stringify({
        id: 'block-1',
        reason: 'Maintenance',
        startTime: '2026-03-15T09:00:00Z',
        endTime: '2026-03-15T12:00:00Z',
      })}`
    )

    vi.mocked(reservationService.createReservation).mockRejectedValue(blockError)

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 'res-1',
        startTime: '2026-03-15T10:00:00Z',
        endTime: '2026-03-15T11:00:00Z',
        purpose: 'TRAINING',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe('TIME_BLOCKED')
    expect(data.block).toBeDefined()
  })

  it('should return 200 with warning when overlap exists', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2026-12-31',
    } as any)

    const overlapError = new Error(
      `OVERLAP_EXISTS:${JSON.stringify([
        {
          id: 'res-2',
          startTime: '2026-03-15T10:00:00Z',
          endTime: '2026-03-15T11:00:00Z',
          purpose: 'LESSON',
        },
      ])}`
    )

    vi.mocked(reservationService.createReservation).mockRejectedValue(overlapError)

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 'res-1',
        startTime: '2026-03-15T10:00:00Z',
        endTime: '2026-03-15T11:00:00Z',
        purpose: 'TRAINING',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.warning).toBe('OVERLAP_EXISTS')
    expect(data.requiresAcknowledge).toBe(true)
    expect(data.overlaps).toBeDefined()
  })

  it('should create reservation successfully with valid data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2026-12-31',
    } as any)

    const mockReservation = {
      id: 'res-new',
      userId: 'user-1',
      resourceId: 'res-1',
      startTime: new Date('2026-03-15T10:00:00Z'),
      endTime: new Date('2026-03-15T11:00:00Z'),
      purpose: 'TRAINING',
      status: 'CONFIRMED',
    }

    vi.mocked(reservationService.createReservation).mockResolvedValue(mockReservation as any)

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceId: 'res-1',
        startTime: '2026-03-15T10:00:00Z',
        endTime: '2026-03-15T11:00:00Z',
        purpose: 'TRAINING',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.reservation.id).toBe('res-new')
    expect(data.reservation.status).toBe('CONFIRMED')
  })
})

describe('GET /api/reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Niet ingelogd')
  })

  it('should return user reservations when authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2026-12-31',
    } as any)

    const mockReservations = [
      {
        id: 'res-1',
        startTime: new Date('2026-03-15T10:00:00Z'),
        endTime: new Date('2026-03-15T11:00:00Z'),
        purpose: 'TRAINING',
        status: 'CONFIRMED',
      },
      {
        id: 'res-2',
        startTime: new Date('2026-03-16T14:00:00Z'),
        endTime: new Date('2026-03-16T15:00:00Z'),
        purpose: 'LESSON',
        status: 'CONFIRMED',
      },
    ]

    vi.mocked(reservationService.getUserReservations).mockResolvedValue(
      mockReservations as any
    )

    const request = new Request('http://localhost:3000/api/reservations', {
      method: 'GET',
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.reservations).toHaveLength(2)
    expect(reservationService.getUserReservations).toHaveBeenCalledWith('user-1', false)
  })

  it('should include history when query parameter is set', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'test@example.com', role: 'USER' },
      expires: '2026-12-31',
    } as any)

    vi.mocked(reservationService.getUserReservations).mockResolvedValue([] as any)

    const request = new Request(
      'http://localhost:3000/api/reservations?history=true',
      {
        method: 'GET',
      }
    )

    await GET(request)

    expect(reservationService.getUserReservations).toHaveBeenCalledWith('user-1', true)
  })
})
