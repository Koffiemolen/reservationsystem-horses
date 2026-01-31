'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface Event {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  isPublic: boolean
  resources: Array<{
    resource: {
      id: string
      name: string
    }
  }>
}

export default function EvenementenPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events/public')
        if (!response.ok) {
          throw new Error('Kon evenementen niet laden')
        }
        const data = await response.json()
        setEvents(data.events || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const startDateStr = format(start, 'd MMMM yyyy', { locale: nl })
    const endDateStr = format(end, 'd MMMM yyyy', { locale: nl })
    const startTimeStr = format(start, 'HH:mm', { locale: nl })
    const endTimeStr = format(end, 'HH:mm', { locale: nl })

    // Check if same day
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`
    }

    // Multi-day event
    return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`
  }

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) >= new Date()
  }

  const upcomingEvents = events.filter(e => isUpcoming(e.startDate))
  const pastEvents = events.filter(e => !isUpcoming(e.startDate))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Evenementen</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Bekijk onze aankomende evenementen en activiteiten.
            Van wedstrijden tot clinics - er is altijd iets te beleven!
          </p>
        </div>
      </section>

      {/* Competition Info Bar */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-green-800 text-center">
            Bijna iedere maand worden dressuurwedstrijden georganiseerd voor
            pony's en paarden. Klassen: BB, B, L1, L2, M1, M2 (zomer: ook Z).
            Inschrijving via{' '}
            <a
              href="https://mijnknhs.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              mijnknhs.nl
            </a>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Evenementen laden...</p>
          </div>
        ) : error ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 w-full"
                variant="outline"
              >
                Probeer opnieuw
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Upcoming Events */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Aankomende Evenementen
              </h2>

              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">
                      Er zijn momenteel geen aankomende evenementen gepland.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Kom later terug voor nieuwe evenementen!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge variant="default" className="bg-green-600">
                            Aankomend
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatEventDate(event.startDate, event.endDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {event.description ? (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {event.description}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm italic mb-4">
                            Geen beschrijving beschikbaar
                          </p>
                        )}

                        {event.resources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.resources.map((er) => (
                              <Badge
                                key={er.resource.id}
                                variant="outline"
                                className="text-xs"
                              >
                                {er.resource.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Afgelopen Evenementen
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.slice(0, 6).map((event) => (
                    <Card key={event.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg text-gray-600">
                            {event.title}
                          </CardTitle>
                          <Badge variant="secondary">
                            Afgelopen
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatEventDate(event.startDate, event.endDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {event.description && (
                          <p className="text-gray-500 text-sm line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="bg-green-50 border-green-200 max-w-2xl mx-auto">
            <CardContent className="py-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Wilt u deelnemen aan een evenement?
              </h3>
              <p className="text-gray-600 mb-6">
                Voor wedstrijden: inschrijving via mijnknhs.nl. Voor vragen
                over evenementen neem contact op via wedstrijdderaam@live.nl
                of registreer een account om reserveringen te maken.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link href="/contact">Contact opnemen</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/registreren">Account aanmaken</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
