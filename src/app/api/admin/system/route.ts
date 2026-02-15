import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSystemConfig, getSystemInfo, testDatabaseConnection } from '@/services/system.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const [config, info, dbTest] = await Promise.all([
      getSystemConfig(),
      getSystemInfo(),
      testDatabaseConnection(),
    ])

    return NextResponse.json({
      config,
      info,
      health: {
        database: dbTest,
      },
    })
  } catch (error) {
    console.error('System API error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
