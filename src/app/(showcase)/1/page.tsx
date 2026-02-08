'use client'

import { ArrowRight, Calendar, Clock, MapPin, Mail, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Design1() {
  const [scrollY, setScrollY] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="brutalist-design bg-black text-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

        .brutalist-design {
          font-family: 'Space Mono', monospace;
          overflow-x: hidden;
        }

        .brutalist-title {
          font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 0.05em;
        }

        .brutalist-border {
          border: 4px solid currentColor;
        }

        .brutalist-shadow {
          box-shadow: 8px 8px 0 rgba(255, 255, 255, 0.1);
        }

        .noise-overlay {
          position: relative;
          overflow: hidden;
        }

        .noise-overlay::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        .noise-overlay > * {
          position: relative;
          z-index: 2;
        }

        .glitch-text {
          position: relative;
          animation: glitch 3s infinite;
        }

        @keyframes glitch {
          0%, 90%, 100% {
            transform: translateX(0);
          }
          91% {
            transform: translateX(-2px);
          }
          92% {
            transform: translateX(2px);
          }
          93% {
            transform: translateX(-2px);
          }
        }

        .slide-in {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; animation-fill-mode: forwards; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; animation-fill-mode: forwards; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards; }

        .brutalist-link {
          position: relative;
          display: inline-block;
          padding: 16px 32px;
          border: 3px solid white;
          background: black;
          color: white;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .brutalist-link:hover {
          transform: translate(-4px, -4px);
          box-shadow: 4px 4px 0 white;
        }

        .brutalist-link:active {
          transform: translate(0, 0);
          box-shadow: 0 0 0 white;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="brutalist-title text-2xl">DE RAAM</div>
          <div className="flex gap-6 text-sm font-bold tracking-wider">
            <a href="#over" className="hover:underline">OVER</a>
            <a href="#faciliteiten" className="hover:underline">FACILITEITEN</a>
            <a href="#contact" className="hover:underline">CONTACT</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center noise-overlay relative" style={{ marginTop: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="brutalist-title text-8xl md:text-9xl leading-none mb-8 glitch-text">
                MANEGE<br />
                D'N<br />
                PERDENBAK
              </h1>
              <p className="text-lg mb-8 max-w-md leading-relaxed">
                Professionele paardensportfaciliteiten in het hart van Brabant.
                Binnenrijhal 25×50m met premium zandboden.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/login" className="brutalist-link">
                  LOGIN
                  <ArrowRight className="inline-block ml-2" size={20} />
                </a>
                <a href="/register" className="brutalist-link bg-white text-black border-white">
                  REGISTREER
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="brutalist-border brutalist-shadow aspect-square bg-zinc-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="brutalist-title text-6xl mb-4">25×50M</div>
                  <div className="text-sm tracking-wider">PROFESSIONELE RIJHAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y-4 border-white bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: '1250', label: 'M² RIJHAL' },
              { num: '2014', label: 'GERENOVEERD' },
              { num: '24/7', label: 'BESCHIKBAAR' },
              { num: 'LED', label: 'VERLICHTING' }
            ].map((stat, i) => (
              <div key={i} className={`text-center slide-in stagger-${i + 1}`}>
                <div className="brutalist-title text-5xl mb-2">{stat.num}</div>
                <div className="text-xs tracking-widest font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="over" className="py-24 noise-overlay">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="brutalist-title text-7xl mb-16">HOE HET WERKT</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: '01. ACCOUNT',
                desc: 'Gratis registratie voor toegang tot het reserveringssysteem'
              },
              {
                icon: Calendar,
                title: '02. BESCHIKBAARHEID',
                desc: 'Realtime inzicht in vrije tijdslots in de rijhal'
              },
              {
                icon: Clock,
                title: '03. RESERVEREN',
                desc: 'Direct boeken met onmiddellijke bevestiging per email'
              }
            ].map((step, i) => (
              <div
                key={i}
                className="brutalist-border p-8 bg-zinc-900 cursor-pointer transition-all duration-300 hover:bg-white hover:text-black group"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <step.icon size={48} className="mb-6" />
                <h3 className="brutalist-title text-3xl mb-4">{step.title}</h3>
                <p className="text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="faciliteiten" className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="brutalist-title text-7xl mb-8 leading-none">
                PREMIUM<br />
                FACILITEITEN
              </h2>
              <div className="space-y-6">
                {[
                  'BINNENRIJHAL 25×50M',
                  'EQUISPORT ZANDBODEN',
                  'GEÏSOLEERD DAK 2018',
                  'LED VERLICHTING',
                  'BUITENBAK (ZOMER)',
                  'KANTINE FACILITEITEN'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-8 h-8 border-4 border-black group-hover:bg-black transition-colors" />
                    <div className="text-xl font-bold tracking-wide">{item}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="brutalist-border brutalist-shadow aspect-video bg-zinc-200 flex items-center justify-center">
              <div className="text-zinc-600 text-sm tracking-wider text-center">
                [RIJHAL IMPRESSIE]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitions */}
      <section className="py-24 noise-overlay">
        <div className="max-w-7xl mx-auto px-4">
          <div className="brutalist-border brutalist-shadow p-12 bg-zinc-900">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="brutalist-border aspect-video bg-zinc-800 flex items-center justify-center">
                <div className="text-zinc-400 text-sm tracking-wider text-center">
                  [WEDSTRIJD FOTO]
                </div>
              </div>
              <div>
                <h2 className="brutalist-title text-6xl mb-6">WEDSTRIJDEN</h2>
                <p className="mb-6 leading-relaxed">
                  Maandelijkse KNHS dressuurwedstrijden voor pony's en paarden.
                  Klassen BB, B, L1, L2, M1 en M2.
                </p>
                <div className="brutalist-border inline-block px-6 py-3 bg-white text-black">
                  <div className="text-sm font-bold tracking-wider">INSCHRIJVEN VIA MIJNKNHS.NL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-black">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="brutalist-title text-8xl mb-8">KLAAR OM<br />TE STARTEN?</h2>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Maak vandaag een account en begin direct met reserveren. Gratis en zonder verplichtingen.
          </p>
          <a href="/register" className="brutalist-link bg-black text-white border-black text-xl">
            GRATIS REGISTREREN
            <ArrowRight className="inline-block ml-3" size={24} />
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 border-t-4 border-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="brutalist-title text-4xl mb-4">LOCATIE</div>
              <p className="text-lg">
                Provinciale weg 26<br />
                5737 GH Lieshout
              </p>
            </div>
            <div>
              <div className="brutalist-title text-4xl mb-4">CONTACT</div>
              <Link href="/contact" className="text-lg hover:underline">
                CONTACTFORMULIER →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-white py-8 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="brutalist-title text-2xl mb-2">STICHTING MANEGE DE RAAM</div>
          <div className="tracking-widest">© 2026 — ALLE RECHTEN VOORBEHOUDEN</div>
        </div>
      </footer>
    </div>
  )
}
