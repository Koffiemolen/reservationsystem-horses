import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { checkOverlaps } from '@/services/reservation.service'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const excludeId = searchParams.get('excludeId') || undefined

    if (!resourceId || !start || !end) {
      return NextResponse.json(
        { error: 'resourceId, start en end zijn verplicht' },
        { status: 400 }
      )
    }

    const startTime = new Date(start)
    const endTime = new Date(end)

    const result = await checkOverlaps(resourceId, startTime, endTime, excludeId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Check overlaps error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
