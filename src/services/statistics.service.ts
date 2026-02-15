import { prisma } from '@/lib/db'
import { subDays, startOfDay, endOfDay, startOfMonth } from 'date-fns'

interface ReservationTrend {
  date: string
  count: number
}

interface UserActivityStats {
  newUsersThisMonth: number
  activeUsers: number
  disabledUsers: number
}

interface ReservationBreakdown {
  confirmed: number
  cancelled: number
  impacted: number
}

interface PurposeBreakdown {
  training: number
  lesson: number
  other: number
}

export interface DetailedStats {
  userActivity: UserActivityStats
  reservationTrends: ReservationTrend[]
  reservationBreakdown: ReservationBreakdown
  purposeBreakdown: PurposeBreakdown
  averageReservationsPerDay: number
  cancellationRate: number
}

export async function getDetailedStats(): Promise<DetailedStats> {
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const monthStart = startOfMonth(now)

  const [
    newUsersThisMonth,
    activeUsers,
    disabledUsers,
    confirmedCount,
    cancelledCount,
    impactedCount,
    trainingCount,
    lessonCount,
    otherCount,
    recentReservations,
  ] = await Promise.all([
    // New users this month
    prisma.user.count({
      where: { createdAt: { gte: monthStart } },
    }),
    // Active users
    prisma.user.count({
      where: { status: 'ACTIVE' },
    }),
    // Disabled users
    prisma.user.count({
      where: { status: 'DISABLED' },
    }),
    // Reservation status breakdown
    prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
    prisma.reservation.count({ where: { status: 'CANCELLED' } }),
    prisma.reservation.count({ where: { status: 'IMPACTED' } }),
    // Purpose breakdown (confirmed only)
    prisma.reservation.count({
      where: { status: 'CONFIRMED', purpose: 'TRAINING' },
    }),
    prisma.reservation.count({
      where: { status: 'CONFIRMED', purpose: 'LESSON' },
    }),
    prisma.reservation.count({
      where: { status: 'CONFIRMED', purpose: 'OTHER' },
    }),
    // Recent reservations for trends (last 30 days)
    prisma.reservation.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: 'CONFIRMED',
      },
      select: { createdAt: true },
    }),
  ])

  // Build daily trends for last 30 days
  const trendMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const date = subDays(now, i)
    const key = startOfDay(date).toISOString().split('T')[0]
    trendMap.set(key, 0)
  }

  for (const r of recentReservations) {
    const key = startOfDay(r.createdAt).toISOString().split('T')[0]
    if (trendMap.has(key)) {
      trendMap.set(key, (trendMap.get(key) || 0) + 1)
    }
  }

  const reservationTrends: ReservationTrend[] = Array.from(trendMap.entries()).map(
    ([date, count]) => ({ date, count })
  )

  const totalReservations = confirmedCount + cancelledCount + impactedCount
  const cancellationRate = totalReservations > 0 ? (cancelledCount / totalReservations) * 100 : 0
  const averageReservationsPerDay =
    reservationTrends.length > 0
      ? reservationTrends.reduce((sum, t) => sum + t.count, 0) / reservationTrends.length
      : 0

  return {
    userActivity: {
      newUsersThisMonth,
      activeUsers,
      disabledUsers,
    },
    reservationTrends,
    reservationBreakdown: {
      confirmed: confirmedCount,
      cancelled: cancelledCount,
      impacted: impactedCount,
    },
    purposeBreakdown: {
      training: trainingCount,
      lesson: lessonCount,
      other: otherCount,
    },
    averageReservationsPerDay: Math.round(averageReservationsPerDay * 10) / 10,
    cancellationRate: Math.round(cancellationRate * 10) / 10,
  }
}
