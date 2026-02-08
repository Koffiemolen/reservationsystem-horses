'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Calendar, MapPin } from 'lucide-react'

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

    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`
    }

    return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr}`
  }

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) >= new Date()
  }

  const upcomingEvents = events.filter(e => isUpcoming(e.startDate))
  const pastEvents = events.filter(e => !isUpcoming(e.startDate))

  return (
    <div className="organic-design">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --earth-cream: #f5f1e8;
          --earth-sand: #e8dcc4;
          --earth-moss: #8b9d83;
          --earth-forest: #4a5d4a;
          --earth-bark: #5c4a3a;
          --earth-clay: #c9a88e;
        }

        .organic-design {
          font-family: 'Lora', serif;
          background: var(--earth-cream);
          color: var(--earth-bark);
        }

        .organic-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        .organic-card {
          background: white;
          border-radius: 32px;
          padding: 2rem;
          box-shadow: 0 4px 24px rgba(74, 93, 74, 0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .organic-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(74, 93, 74, 0.15);
        }

        .organic-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 50px;
          background: var(--earth-forest);
          color: var(--earth-cream);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 2px solid var(--earth-forest);
        }

        .organic-btn:hover {
          background: var(--earth-moss);
          border-color: var(--earth-moss);
          transform: scale(1.05);
        }

        .wave-divider {
          position: relative;
          width: 100%;
          height: 60px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-[var(--earth-sand)] to-[var(--earth-cream)]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="organic-title text-6xl md:text-7xl mb-6 text-[var(--earth-forest)]">
            Evenementen
          </h1>
          <p className="text-xl md:text-2xl text-[var(--earth-bark)] leading-relaxed">
            Bekijk onze aankomende evenementen en activiteiten.
            Van wedstrijden tot clinics - er is altijd iets te beleven!
          </p>
        </div>
      </section>

      {/* Info Bar */}
      <section className="py-6 px-6 bg-[var(--earth-moss)]/10 border-y border-[var(--earth-sand)]">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-[var(--earth-forest)]">
            Bijna iedere maand worden dressuurwedstrijden georganiseerd voor
            pony's en paarden. Klassen: BB, B, L1, L2, M1, M2 (zomer: ook Z).
            Inschrijving via{' '}
            <a
              href="https://mijnknhs.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--earth-moss)] transition-colors"
            >
              mijnknhs.nl
            </a>
          </p>
        </div>
      </section>

      {/* Wave divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,60 C300,100 500,20 600,60 C700,100 900,20 1200,60 L1200,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Content */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[var(--earth-sand)] border-t-[var(--earth-forest)] rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-[var(--earth-bark)]">Evenementen laden...</p>
            </div>
          ) : error ? (
            <div className="organic-card max-w-md mx-auto text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="organic-btn"
              >
                Probeer opnieuw
              </button>
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              <div className="mb-16">
                <h2 className="organic-title text-4xl mb-8 text-[var(--earth-forest)]">
                  Aankomende Evenementen
                </h2>

                {upcomingEvents.length === 0 ? (
                  <div className="organic-card text-center py-12">
                    <Calendar size={48} className="text-[var(--earth-sand)] mx-auto mb-4" />
                    <p className="text-[var(--earth-bark)]">
                      Er zijn momenteel geen aankomende evenementen gepland.
                    </p>
                    <p className="text-sm text-[var(--earth-bark)]/60 mt-2">
                      Kom later terug voor nieuwe evenementen!
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="organic-card">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="organic-title text-2xl text-[var(--earth-forest)]">
                            {event.title}
                          </h3>
                          <span className="px-3 py-1 bg-[var(--earth-moss)] text-white text-xs rounded-full flex-shrink-0 ml-2">
                            Aankomend
                          </span>
                        </div>
                        <p className="text-sm text-[var(--earth-bark)]/70 mb-4">
                          {formatEventDate(event.startDate, event.endDate)}
                        </p>
                        {event.description ? (
                          <p className="text-sm text-[var(--earth-bark)] mb-4 line-clamp-3">
                            {event.description}
                          </p>
                        ) : (
                          <p className="text-sm text-[var(--earth-bark)]/40 italic mb-4">
                            Geen beschrijving beschikbaar
                          </p>
                        )}

                        {event.resources.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {event.resources.map((er) => (
                              <span
                                key={er.resource.id}
                                className="px-3 py-1 bg-[var(--earth-sand)]/50 text-[var(--earth-bark)] text-xs rounded-full"
                              >
                                <MapPin size={12} className="inline mr-1" />
                                {er.resource.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 className="organic-title text-4xl mb-8 text-[var(--earth-forest)]">
                    Afgelopen Evenementen
                  </h2>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastEvents.slice(0, 6).map((event) => (
                      <div key={event.id} className="organic-card opacity-60">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="organic-title text-xl text-[var(--earth-bark)]">
                            {event.title}
                          </h3>
                          <span className="px-3 py-1 bg-[var(--earth-sand)] text-[var(--earth-bark)] text-xs rounded-full flex-shrink-0 ml-2">
                            Afgelopen
                          </span>
                        </div>
                        <p className="text-sm text-[var(--earth-bark)]/70 mb-2">
                          {formatEventDate(event.startDate, event.endDate)}
                        </p>
                        {event.description && (
                          <p className="text-sm text-[var(--earth-bark)]/60 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[var(--earth-cream)]">
        <div className="max-w-4xl mx-auto text-center organic-card">
          <h2 className="organic-title text-4xl mb-4 text-[var(--earth-forest)]">
            Wilt u deelnemen aan een evenement?
          </h2>
          <p className="text-[var(--earth-bark)] mb-8 leading-relaxed">
            Voor wedstrijden: inschrijving via mijnknhs.nl. Voor vragen
            over evenementen neem contact op via wedstrijdderaam@live.nl
            of registreer een account om reserveringen te maken.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="organic-btn">
              Contact opnemen
            </Link>
            <Link href="/register" className="organic-btn" style={{ background: 'transparent', color: 'var(--earth-forest)' }}>
              Account aanmaken
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
