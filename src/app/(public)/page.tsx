'use client'

import { ArrowRight, Calendar, Clock, Leaf, MapPin, Mail, Sparkles, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { WatermarkedImage } from '@/components/ui/WatermarkedImage'

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress((scrolled / maxScroll) * 100)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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

        .organic-blob {
          border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
          animation: morph 8s ease-in-out infinite;
        }

        @keyframes morph {
          0%, 100% {
            border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%;
          }
          25% {
            border-radius: 48% 52% 68% 32% / 42% 58% 42% 58%;
          }
          50% {
            border-radius: 40% 60% 42% 58% / 48% 33% 67% 52%;
          }
          75% {
            border-radius: 58% 42% 55% 45% / 62% 48% 52% 38%;
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(2deg);
          }
        }

        .fade-in-up {
          animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        .organic-btn-outline {
          background: transparent;
          color: var(--earth-forest);
        }

        .organic-btn-outline:hover {
          background: var(--earth-forest);
          color: var(--earth-cream);
        }

        .wave-divider {
          position: relative;
          width: 100%;
          height: 60px;
        }

        .leaf-decoration {
          opacity: 0.1;
          position: absolute;
          pointer-events: none;
        }

        .stagger-delay-1 { animation-delay: 0.1s; }
        .stagger-delay-2 { animation-delay: 0.2s; }
        .stagger-delay-3 { animation-delay: 0.3s; }
      `}</style>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <Leaf
          className="leaf-decoration float-animation"
          size={120}
          style={{
            top: '10%',
            left: '5%',
            color: 'var(--earth-moss)',
            animationDelay: '0s'
          }}
        />
        <Leaf
          className="leaf-decoration float-animation"
          size={80}
          style={{
            top: '50%',
            right: '10%',
            color: 'var(--earth-clay)',
            animationDelay: '2s'
          }}
        />
        <Leaf
          className="leaf-decoration float-animation"
          size={100}
          style={{
            bottom: '20%',
            left: '15%',
            color: 'var(--earth-sand)',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-[var(--earth-moss)] to-[var(--earth-forest)] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-lg bg-[var(--earth-cream)]/80">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="organic-title text-3xl text-[var(--earth-forest)]">De Raam</div>
          <div className="flex gap-8 text-sm font-semibold">
            <a href="#welkom" className="hover:text-[var(--earth-moss)] transition-colors">Welkom</a>
            <a href="#faciliteiten" className="hover:text-[var(--earth-moss)] transition-colors">Faciliteiten</a>
            <a href="#wedstrijden" className="hover:text-[var(--earth-moss)] transition-colors">Wedstrijden</a>
            <a href="#contact" className="hover:text-[var(--earth-moss)] transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="welkom" className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm">
              <Sparkles size={16} className="text-[var(--earth-moss)]" />
              <span className="text-sm font-semibold text-[var(--earth-forest)]">Sinds 1998</span>
            </div>
            <h1 className="organic-title text-7xl md:text-9xl mb-8 text-[var(--earth-forest)] leading-none">
              Manege<br />
              <span className="italic">D'n Perdenbak</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed text-[var(--earth-bark)]">
              Een harmonieuze plek waar paarden en ruiters samenkomen in de
              sereniteit van de Brabantse natuur
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/login" className="organic-btn">
                Inloggen
                <ArrowRight size={20} />
              </a>
              <a href="/register" className="organic-btn organic-btn-outline">
                Account aanmaken
              </a>
            </div>
          </div>
        </div>

        {/* Organic shape background */}
        <div
          className="absolute top-1/4 right-0 w-96 h-96 organic-blob opacity-10"
          style={{ background: 'var(--earth-moss)' }}
        />
        <div
          className="absolute bottom-1/4 left-0 w-80 h-80 organic-blob opacity-10"
          style={{ background: 'var(--earth-clay)', animationDelay: '2s' }}
        />
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

      {/* How it works */}
      <section className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="organic-title text-5xl md:text-6xl text-center mb-4 text-[var(--earth-forest)]">
            Hoe het werkt
          </h2>
          <p className="text-center text-[var(--earth-bark)] mb-16 max-w-2xl mx-auto">
            Begin in drie eenvoudige stappen met het reserveren van tijd in onze rijhal
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Account aanmaken',
                desc: 'Registreer gratis en krijg direct toegang tot ons volledige reserveringssysteem'
              },
              {
                icon: Calendar,
                title: 'Tijd selecteren',
                desc: 'Bekijk realtime beschikbaarheid en kies het perfecte moment voor jouw training'
              },
              {
                icon: Clock,
                title: 'Direct reserveren',
                desc: 'Bevestig je boeking met één klik en ontvang direct een bevestigingsmail'
              }
            ].map((step, i) => (
              <div
                key={i}
                className={`organic-card fade-in-up stagger-delay-${i + 1}`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--earth-moss)] to-[var(--earth-forest)] flex items-center justify-center mb-6">
                  <step.icon size={32} className="text-white" />
                </div>
                <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">
                  {step.title}
                </h3>
                <p className="text-[var(--earth-bark)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider inverted */}
      <div className="wave-divider rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,60 C300,100 500,20 600,60 C700,100 900,20 1200,60 L1200,120 L0,120 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Facilities */}
      <section id="faciliteiten" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="organic-title text-5xl md:text-6xl mb-6 text-[var(--earth-forest)]">
                Premium faciliteiten
              </h2>
              <p className="text-lg mb-8 text-[var(--earth-bark)] leading-relaxed">
                Onze binnenrijhal van 25×50 meter met professionele Equisport zandboden
                biedt de perfecte omgeving voor training en wedstrijden
              </p>
              <div className="space-y-4">
                {[
                  'Geïsoleerd dak met optimale ventilatie',
                  'LED-verlichting voor alle weersomstandigheden',
                  'Buitenbak beschikbaar in zomermaanden',
                  'Gezellige kantine voor ontmoeting'
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--earth-moss)] mt-2 flex-shrink-0" />
                    <span className="text-[var(--earth-bark)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="organic-blob overflow-hidden aspect-square">
                <WatermarkedImage
                  src="/images/facility-indoor-arena.jpg"
                  alt="Binnenrijhal 25×50 meter met professionele zandboden"
                  width={800}
                  height={800}
                  className="w-full h-full"
                  watermarkPosition="bottom-right"
                  watermarkSize="medium"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitions */}
      <section id="wedstrijden" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="organic-card">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div
                  className="organic-blob overflow-hidden aspect-video"
                  style={{ borderRadius: '48% 52% 68% 32% / 42% 58% 42% 58%' }}
                >
                  <WatermarkedImage
                    src="/images/event-competition.jpg"
                    alt="KNHS dressuurwedstrijd bij Manege D'n Perdenbak"
                    width={800}
                    height={450}
                    className="w-full h-full"
                    watermarkPosition="bottom-right"
                    watermarkSize="small"
                  />
                </div>
              </div>
              <div>
                <h2 className="organic-title text-5xl mb-6 text-[var(--earth-forest)]">
                  Wedstrijden & Evenementen
                </h2>
                <p className="text-[var(--earth-bark)] mb-6 leading-relaxed">
                  Maandelijks organiseren we KNHS dressuurwedstrijden voor pony's en paarden.
                  Alle niveaus zijn welkom, van BB tot M2.
                </p>
                <p className="italic text-[var(--earth-moss)] text-xl mb-6">
                  "Paarden liefhebbers weten hoe geluk ruikt"
                </p>
                <a href="/evenementen" className="organic-btn">
                  Bekijk evenementen
                  <ArrowRight size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 organic-blob opacity-5"
          style={{ background: 'var(--earth-forest)', width: '150%', height: '150%', top: '-25%', left: '-25%' }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="organic-title text-6xl md:text-7xl mb-8 text-[var(--earth-forest)]">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl mb-12 text-[var(--earth-bark)] max-w-2xl mx-auto leading-relaxed">
            Word lid van onze gemeenschap en ervaar de vrijheid van eenvoudig reserveren
          </p>
          <a href="/register" className="organic-btn text-lg px-8 py-4">
            Gratis registreren
            <ArrowRight size={24} />
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="organic-card">
              <MapPin size={32} className="text-[var(--earth-moss)] mb-4" />
              <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">Bezoek ons</h3>
              <p className="text-[var(--earth-bark)]">
                Provinciale weg 26<br />
                5737 GH Lieshout<br />
                Noord-Brabant
              </p>
            </div>
            <div className="organic-card">
              <Mail size={32} className="text-[var(--earth-moss)] mb-4" />
              <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">Neem contact op</h3>
              <Link href="/contact" className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)] transition-colors">
                Stuur ons een bericht →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--earth-sand)]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="organic-title text-3xl mb-4 text-[var(--earth-forest)]">
            Stichting Manege De Raam
          </div>
          <p className="text-sm text-[var(--earth-bark)]">
            © 2026 — Beheerder van Manege D'n Perdenbak
          </p>
        </div>
      </footer>
    </div>
  )
}
