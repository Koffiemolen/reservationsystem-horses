'use client'

import { ArrowRight, Calendar, ChevronRight, Clock, MapPin, Mail, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Design4() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => setScrollY(window.scrollY)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="luxury-design">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        :root {
          --lux-cream: #faf8f4;
          --lux-gold: #d4af37;
          --lux-gold-dark: #b8941f;
          --lux-charcoal: #2d2d2d;
          --lux-gray: #6b6b6b;
          --lux-light-gray: #e8e5df;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .luxury-design {
          font-family: 'Montserrat', sans-serif;
          background: var(--lux-cream);
          color: var(--lux-charcoal);
          font-weight: 300;
          letter-spacing: 0.02em;
        }

        .luxury-title {
          font-family: 'Playfair Display', serif;
          font-weight: 400;
          letter-spacing: 0.05em;
        }

        .luxury-title-italic {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
        }

        .luxury-line {
          width: 60px;
          height: 1px;
          background: var(--lux-gold);
          margin: 0 auto;
        }

        .luxury-fade-in {
          opacity: 0;
          animation: luxuryFadeIn 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes luxuryFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .luxury-fade-in {
          transform: translateY(30px);
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .luxury-btn {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 3rem;
          border: 1px solid var(--lux-charcoal);
          background: transparent;
          color: var(--lux-charcoal);
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .luxury-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--lux-charcoal);
          transition: left 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: -1;
        }

        .luxury-btn:hover::before {
          left: 0;
        }

        .luxury-btn:hover {
          color: var(--lux-cream);
          border-color: var(--lux-charcoal);
        }

        .luxury-btn-gold {
          border-color: var(--lux-gold);
          color: var(--lux-gold);
        }

        .luxury-btn-gold::before {
          background: var(--lux-gold);
        }

        .luxury-btn-gold:hover {
          color: white;
          border-color: var(--lux-gold);
        }

        .luxury-card {
          background: white;
          padding: 3rem;
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.04);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .luxury-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 1px;
          background: var(--lux-gold);
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .luxury-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 12px 60px rgba(0, 0, 0, 0.08);
        }

        .luxury-card:hover::after {
          width: 80%;
        }

        .parallax-slow {
          transition: transform 0.3s ease-out;
        }

        .luxury-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--lux-light-gray), transparent);
          margin: 4rem 0;
        }

        .luxury-number {
          font-family: 'Playfair Display', serif;
          font-size: 5rem;
          line-height: 1;
          color: var(--lux-gold);
          font-weight: 300;
          opacity: 0.15;
          position: absolute;
          top: -1rem;
          left: 2rem;
        }

        .image-placeholder {
          background: linear-gradient(135deg, var(--lux-light-gray), #f5f3ed);
          position: relative;
          overflow: hidden;
        }

        .image-placeholder::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          to {
            left: 100%;
          }
        }

        .elegant-border {
          border: 1px solid var(--lux-light-gray);
        }

        .hover-underline {
          position: relative;
          display: inline-block;
        }

        .hover-underline::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--lux-gold);
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hover-underline:hover::after {
          width: 100%;
        }

        .quote-mark {
          font-family: 'Playfair Display', serif;
          font-size: 8rem;
          line-height: 0;
          color: var(--lux-gold);
          opacity: 0.2;
        }

        nav {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--lux-cream)]/95 border-b border-[var(--lux-light-gray)]">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="luxury-title text-2xl tracking-wider">De Raam</div>
          <div className="hidden md:flex gap-12 text-xs font-medium tracking-widest uppercase">
            <a href="#home" className="hover-underline text-[var(--lux-gray)] hover:text-[var(--lux-charcoal)] transition-colors">Home</a>
            <a href="#about" className="hover-underline text-[var(--lux-gray)] hover:text-[var(--lux-charcoal)] transition-colors">Over Ons</a>
            <a href="#facilities" className="hover-underline text-[var(--lux-gray)] hover:text-[var(--lux-charcoal)] transition-colors">Faciliteiten</a>
            <a href="#contact" className="hover-underline text-[var(--lux-gray)] hover:text-[var(--lux-charcoal)] transition-colors">Contact</a>
          </div>
          <a href="/login" className="text-xs font-medium tracking-widest uppercase hover-underline">
            Login
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="min-h-screen flex items-center justify-center px-8 py-32">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">
            <div className={`luxury-fade-in ${isVisible ? '' : ''}`}>
              <div className="luxury-line mb-8" />
            </div>
            <h1 className={`luxury-title text-6xl md:text-8xl mb-6 luxury-fade-in delay-100`}>
              Manege
            </h1>
            <h2 className={`luxury-title-italic text-5xl md:text-7xl mb-12 text-[var(--lux-gold)] luxury-fade-in delay-200`}>
              D'n Perdenbak
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-16 leading-relaxed text-[var(--lux-gray)] luxury-fade-in delay-300`}>
              Een verfijnde paardensportlocatie in het hart van Brabant,
              waar traditie en excellentie samenkomen sinds 1998
            </p>
            <div className={`flex flex-col sm:flex-row gap-6 justify-center luxury-fade-in delay-400`}>
              <a href="/register" className="luxury-btn luxury-btn-gold">
                <span>Registreren</span>
                <ArrowRight size={18} />
              </a>
              <a href="#about" className="luxury-btn">
                <span>Ontdek Meer</span>
                <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* Stats */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: '1250', unit: 'm²', label: 'Rijhal oppervlakte' },
              { value: '25', unit: '×50m', label: 'Arena afmetingen' },
              { value: '2014', unit: '', label: 'Vloer renovatie' },
              { value: '2018', unit: '', label: 'Nieuw dak & LED' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="luxury-title text-5xl mb-2 text-[var(--lux-gold)]">
                  {stat.value}
                  <span className="text-2xl">{stat.unit}</span>
                </div>
                <div className="luxury-line mb-4" />
                <div className="text-xs uppercase tracking-widest text-[var(--lux-gray)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="luxury-divider" />

      {/* About */}
      <section id="about" className="py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="luxury-line mb-6" />
            <h2 className="luxury-title text-5xl md:text-6xl mb-6">Hoe het werkt</h2>
            <p className="text-[var(--lux-gray)] max-w-2xl mx-auto">
              Reserveren bij Manege D'n Perdenbak is eenvoudig en transparant
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Users,
                title: 'Account Aanmaken',
                desc: 'Registreer kostenloos voor toegang tot ons online reserveringssysteem'
              },
              {
                icon: Calendar,
                title: 'Beschikbaarheid Bekijken',
                desc: 'Bekijk in realtime welke tijdsloten beschikbaar zijn in de rijhal'
              },
              {
                icon: Clock,
                title: 'Direct Reserveren',
                desc: 'Bevestig uw reservering en ontvang een directe bevestiging per e-mail'
              }
            ].map((step, i) => (
              <div key={i} className="luxury-card relative">
                <div className="luxury-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-[var(--lux-gold)] flex items-center justify-center mb-8 mx-auto">
                    <step.icon size={24} className="text-[var(--lux-gold)]" />
                  </div>
                  <h3 className="luxury-title text-2xl mb-4 text-center">{step.title}</h3>
                  <p className="text-[var(--lux-gray)] text-center leading-relaxed text-sm">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1">
              <div className="luxury-line mb-6" />
              <h2 className="luxury-title text-5xl md:text-6xl mb-8">
                Premium<br />Faciliteiten
              </h2>
              <p className="text-[var(--lux-gray)] mb-12 leading-relaxed text-lg">
                Onze binnenrijhal van 25 bij 50 meter beschikt over een professionele
                Equisport zandboden, gerenoveerd in 2014. Het geïsoleerde dak uit 2018
                biedt optimale ventilatie en LED-verlichting.
              </p>
              <div className="space-y-6">
                {[
                  'Professionele Equisport zandboden',
                  'Geïsoleerd dak met ventilatie',
                  'Moderne LED-verlichting',
                  'Buitenbak voor zomermaanden',
                  'Comfortabele kantine'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 group">
                    <div className="w-8 h-[1px] bg-[var(--lux-gold)] transition-all duration-500 group-hover:w-16" />
                    <span className="text-sm uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="image-placeholder aspect-[4/5] elegant-border flex items-center justify-center">
                <div className="text-[var(--lux-gray)] text-xs tracking-widest text-center uppercase">
                  Arena Impressie
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-24 px-8 bg-[var(--lux-cream)]">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="quote-mark">"</div>
          <p className="luxury-title-italic text-3xl md:text-4xl mb-8 leading-relaxed">
            Paarden liefhebbers weten hoe geluk ruikt
          </p>
          <div className="luxury-line" />
        </div>
      </section>

      {/* Competitions */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="image-placeholder aspect-video elegant-border flex items-center justify-center">
              <div className="text-[var(--lux-gray)] text-xs tracking-widest text-center uppercase">
                Wedstrijd Impressie
              </div>
            </div>
            <div>
              <div className="luxury-line mb-6" />
              <h2 className="luxury-title text-5xl mb-8">Wedstrijden</h2>
              <p className="text-[var(--lux-gray)] mb-8 leading-relaxed">
                Bij Stichting Manege de Raam vinden maandelijks KNHS dressuurwedstrijden
                plaats voor pony's en paarden. Beschikbare klassen: BB, B, L1, L2, M1 en M2.
              </p>
              <div className="elegant-border inline-block px-8 py-4 mb-8">
                <div className="text-xs tracking-widest uppercase text-[var(--lux-gray)]">
                  Inschrijven via <span className="text-[var(--lux-gold)]">mijnknhs.nl</span>
                </div>
              </div>
              <div>
                <a href="/evenementen" className="luxury-btn">
                  <span>Alle Evenementen</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-8 bg-[var(--lux-charcoal)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="luxury-line mb-8" style={{ background: 'var(--lux-gold)' }} />
          <h2 className="luxury-title text-5xl md:text-6xl mb-8">
            Klaar om te beginnen?
          </h2>
          <p className="text-lg mb-12 text-white/70 max-w-2xl mx-auto leading-relaxed">
            Maak vandaag nog een account aan en begin met het reserveren van tijd
            in onze professionele rijhal
          </p>
          <a href="/register" className="luxury-btn luxury-btn-gold">
            <span>Gratis Registreren</span>
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="luxury-line mb-6" />
            <h2 className="luxury-title text-5xl mb-4">Contact</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="text-center">
              <MapPin size={32} className="text-[var(--lux-gold)] mx-auto mb-6" />
              <h3 className="luxury-title text-2xl mb-4">Locatie</h3>
              <p className="text-[var(--lux-gray)]">
                Provinciale weg 26<br />
                5737 GH Lieshout<br />
                Noord-Brabant
              </p>
            </div>
            <div className="text-center">
              <Mail size={32} className="text-[var(--lux-gold)] mx-auto mb-6" />
              <h3 className="luxury-title text-2xl mb-4">E-mail</h3>
              <Link href="/contact" className="text-[var(--lux-gold)] hover-underline">
                Contactformulier
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-[var(--lux-light-gray)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="luxury-title text-3xl mb-4">Stichting Manege De Raam</div>
          <p className="text-xs tracking-widest uppercase text-[var(--lux-gray)]">
            © 2026 — Beheerder van Manege D'n Perdenbak
          </p>
        </div>
      </footer>
    </div>
  )
}
