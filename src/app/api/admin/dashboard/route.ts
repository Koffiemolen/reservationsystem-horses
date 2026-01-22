import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay, addDays } from 'date-fns'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const thirtyDaysFromNow = addDays(now, 30)

    // Get stats
    const [
      totalUsers,
      activeUsers,
      todayReservations,
      upcomingReservations,
      activeBlocks,
      recentReservations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.reservation.count({
        where: {
          status: 'CONFIRMED',
          startTime: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.reservation.count({
        where: {
          status: 'CONFIRMED',
          startTime: { gte: now, lte: thirtyDaysFromNow },
        },
      }),
      prisma.block.count({
        where: {
          endTime: { gte: now },
        },
      }),
      prisma.reservation.findMany({
        where: {
          status: 'CONFIRMED',
          startTime: { gte: now },
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          resource: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
        take: 10,
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        todayReservations,
        upcomingReservations,
        activeBlocks,
      },
      recentReservations,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
