'use client'

import { useQuery } from '@tanstack/react-query'
import { Calendar, Users, Clock, AlertTriangle, Wrench, TrendingUp, UserPlus, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTimeRange, PURPOSE_LABELS } from '@/lib/utils'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  upcomingReservations: number
  todayReservations: number
  activeBlocks: number
}

interface RecentReservation {
  id: string
  startTime: string
  endTime: string
  purpose: string
  status: string
  user: { name: string }
  resource: { name: string }
}

interface DetailedStats {
  userActivity: {
    newUsersThisMonth: number
    activeUsers: number
    disabledUsers: number
  }
  reservationTrends: Array<{ date: string; count: number }>
  reservationBreakdown: {
    confirmed: number
    cancelled: number
    impacted: number
  }
  purposeBreakdown: {
    training: number
    lesson: number
    other: number
  }
  averageReservationsPerDay: number
  cancellationRate: number
}

interface DashboardData {
  stats: DashboardStats
  recentReservations: RecentReservation[]
  detailedStats?: DetailedStats
}

async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch('/api/admin/dashboard?detailed=true')
  if (!response.ok) throw new Error('Failed to fetch dashboard data')
  return response.json()
}

function MiniBarChart({ data }: { data: Array<{ date: string; count: number }> }) {
  if (!data || data.length === 0) return null
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-[2px] h-16">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/70 rounded-t-sm min-h-[2px] transition-all hover:bg-primary"
          style={{ height: `${(d.count / maxCount) * 100}%` }}
          title={`${d.date}: ${d.count}`}
        />
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardData,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Er is een fout opgetreden bij het laden van het dashboard.</p>
      </div>
    )
  }

  const stats = data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    upcomingReservations: 0,
    todayReservations: 0,
    activeBlocks: 0,
  }

  const detailed = data?.detailedStats

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overzicht van het reserveringssysteem
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} actief
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserveringen Vandaag</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayReservations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingReservations} aankomend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aankomende Reserveringen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingReservations}</div>
            <p className="text-xs text-muted-foreground">
              Komende 30 dagen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Blokkades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBlocks}</div>
            <p className="text-xs text-muted-foreground">
              Momenteel actief
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Statistics */}
      {detailed && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nieuwe Gebruikers</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detailed.userActivity.newUsersThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Deze maand geregistreerd
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gem. Reserveringen/Dag</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detailed.averageReservationsPerDay}</div>
              <p className="text-xs text-muted-foreground">
                Laatste 30 dagen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annuleringspercentage</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detailed.cancellationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Van alle reserveringen
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reservation Trends & Breakdowns */}
      {detailed && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reserveringen Trend</CardTitle>
              <CardDescription>Laatste 30 dagen</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={detailed.reservationTrends} />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>30 dagen geleden</span>
                <span>Vandaag</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reserveringen per Doel</CardTitle>
              <CardDescription>Bevestigde reserveringen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Training</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{
                          width: `${
                            ((detailed.purposeBreakdown.training) /
                              Math.max(
                                detailed.purposeBreakdown.training +
                                  detailed.purposeBreakdown.lesson +
                                  detailed.purposeBreakdown.other,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {detailed.purposeBreakdown.training}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Les</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{
                          width: `${
                            ((detailed.purposeBreakdown.lesson) /
                              Math.max(
                                detailed.purposeBreakdown.training +
                                  detailed.purposeBreakdown.lesson +
                                  detailed.purposeBreakdown.other,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {detailed.purposeBreakdown.lesson}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anders</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-amber-500 rounded-full h-2"
                        style={{
                          width: `${
                            ((detailed.purposeBreakdown.other) /
                              Math.max(
                                detailed.purposeBreakdown.training +
                                  detailed.purposeBreakdown.lesson +
                                  detailed.purposeBreakdown.other,
                                1
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {detailed.purposeBreakdown.other}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Badge variant="outline" className="text-xs">
                  {detailed.reservationBreakdown.confirmed} bevestigd
                </Badge>
                <Badge variant="outline" className="text-xs text-red-600">
                  {detailed.reservationBreakdown.cancelled} geannuleerd
                </Badge>
                <Badge variant="outline" className="text-xs text-amber-600">
                  {detailed.reservationBreakdown.impacted} beïnvloed
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/admin/gebruikers">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Gebruikers beheren</h3>
              <p className="text-sm text-muted-foreground">
                Bekijk en beheer gebruikersaccounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reserveringen">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Alle reserveringen</h3>
              <p className="text-sm text-muted-foreground">
                Bekijk en beheer alle reserveringen
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/blokkades">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <AlertTriangle className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Blokkades</h3>
              <p className="text-sm text-muted-foreground">
                Beheer tijdsblokkades
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/evenementen">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Evenementen</h3>
              <p className="text-sm text-muted-foreground">
                Beheer evenementen en wedstrijden
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/systeem">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <Wrench className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Systeeminstellingen</h3>
              <p className="text-sm text-muted-foreground">
                Configuratie en verbindingstests
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Recente Reserveringen</CardTitle>
          <CardDescription>
            De laatste 10 aankomende reserveringen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentReservations && data.recentReservations.length > 0 ? (
            <div className="space-y-4">
              {data.recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(reservation.startTime), 'EEEE d MMMM', { locale: nl })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeRange(reservation.startTime, reservation.endTime)} - {reservation.user.name}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {PURPOSE_LABELS[reservation.purpose] || reservation.purpose}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Geen aankomende reserveringen
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
