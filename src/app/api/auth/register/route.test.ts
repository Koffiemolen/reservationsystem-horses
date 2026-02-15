import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from './route'
import { prisma } from '@/lib/db'
import * as emailService from '@/services/email.service'
import bcrypt from 'bcryptjs'

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

// Mock email service
vi.mock('@/services/email.service', () => ({
  sendWelcomeEmail: vi.fn(),
}))

// Mock security middleware
vi.mock('@/security', () => ({
  validateSecurityMiddleware: vi.fn().mockResolvedValue(null),
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 for invalid email', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'ValidPass123!@#',
        phoneConsent: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Ongeldige gegevens')
  })

  it('should return 400 for weak password', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak', // Too short, no uppercase, no symbol
        phoneConsent: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Ongeldige gegevens')
    expect(data.details).toBeDefined()
  })

  it('should return 400 when email already exists', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    } as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        phoneConsent: false,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Er bestaat al een account met dit e-mailadres')
  })

  it('should normalize email to lowercase', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user',
      email: 'test@example.com',
      name: 'Test User',
    } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'TEST@EXAMPLE.COM', // Uppercase
        password: 'ValidPass123!@#',
        phoneConsent: false,
      }),
    })

    await POST(request)

    // Check that findUnique was called with lowercase
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    })

    // Check that create was called with lowercase
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
        }),
      })
    )
  })

  it('should hash password with bcrypt', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user',
      email: 'test@example.com',
      name: 'Test User',
    } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        phoneConsent: false,
      }),
    })

    await POST(request)

    // Verify bcrypt was called with cost factor 12
    expect(bcrypt.hash).toHaveBeenCalledWith('ValidPass123!@#', 12)

    // Verify hashed password was saved
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: 'hashed-password',
        }),
      })
    )
  })

  it('should create audit log after successful registration', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user',
      email: 'test@example.com',
      name: 'Test User',
    } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        phoneConsent: false,
      }),
    })

    await POST(request)

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'new-user',
          action: 'CREATE',
          entityType: 'User',
          entityId: 'new-user',
        }),
      })
    )
  })

  it('should send welcome email after successful registration', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user',
      email: 'test@example.com',
      name: 'Test User',
    } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        phoneConsent: false,
      }),
    })

    await POST(request)

    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith({
      userName: 'Test User',
      userEmail: 'test@example.com',
      loginUrl: expect.stringContaining('/login'),
    })
  })

  it('should successfully register user with all valid data', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: 'new-user',
      email: 'test@example.com',
      name: 'Test User',
    } as any)
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as any)

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        phone: '+31612345678',
        phoneConsent: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('Account aangemaakt')
    expect(data.userId).toBe('new-user')
  })
})
