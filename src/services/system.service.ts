import { prisma } from '@/lib/db'
import { sendTestEmail } from './email.service'

interface DatabaseTestResult {
  connected: boolean
  latencyMs: number
  error?: string
}

interface EmailTestResult {
  success: boolean
  provider: string
  mode: string
  timestamp: Date
  error?: string
}

interface SystemConfig {
  environment: string
  emailProvider: string
  emailConfigured: boolean
  databaseType: string
  csrfEnabled: boolean
  rateLimitEnabled: boolean
}

interface SystemInfo {
  totalUsers: number
  totalReservations: number
  totalBlocks: number
  totalEvents: number
  totalAuditLogs: number
}

export async function testDatabaseConnection(): Promise<DatabaseTestResult> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const latencyMs = Date.now() - start
    return { connected: true, latencyMs }
  } catch (error) {
    const latencyMs = Date.now() - start
    return {
      connected: false,
      latencyMs,
      error: error instanceof Error ? error.message : 'Onbekende fout',
    }
  }
}

export async function testEmailConnection(testEmail: string): Promise<EmailTestResult> {
  try {
    const result = await sendTestEmail({
      recipientEmail: testEmail,
      recipientName: 'Test Ontvanger',
      testTime: new Date(),
    })

    const hasApiKey = !!process.env.EMAIL_API_KEY

    return {
      success: result,
      provider: hasApiKey ? 'Bird' : 'Console',
      mode: hasApiKey ? 'Productie (Bird)' : 'Console (geen API key)',
      timestamp: new Date(),
    }
  } catch (error) {
    return {
      success: false,
      provider: 'Onbekend',
      mode: 'Fout',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Onbekende fout',
    }
  }
}

export async function getSystemConfig(): Promise<SystemConfig> {
  return {
    environment: process.env.NODE_ENV || 'development',
    emailProvider: process.env.EMAIL_API_KEY ? 'Bird' : 'Console (geen API key)',
    emailConfigured: !!process.env.EMAIL_API_KEY,
    databaseType: 'SQLite',
    csrfEnabled: process.env.DISABLE_CSRF !== 'true',
    rateLimitEnabled: process.env.DISABLE_RATE_LIMIT !== 'true',
  }
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const [totalUsers, totalReservations, totalBlocks, totalEvents, totalAuditLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.reservation.count(),
      prisma.block.count(),
      prisma.event.count(),
      prisma.auditLog.count(),
    ])

  return {
    totalUsers,
    totalReservations,
    totalBlocks,
    totalEvents,
    totalAuditLogs,
  }
}
