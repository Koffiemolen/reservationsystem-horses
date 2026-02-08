'use client'

import { ArrowRight, Calendar, Clock, MapPin, Mail, Star, Users, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Design3() {
  const [time, setTime] = useState(new Date())
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-section-index')
            if (index) setActiveSection(parseInt(index))
          }
        })
      },
      { threshold: 0.5 }
    )

    document.querySelectorAll('[data-section-index]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="retro-design">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');

        :root {
          --retro-purple: #9d4edd;
          --retro-pink: #ff006e;
          --retro-cyan: #00f5ff;
          --retro-yellow: #ffbe0b;
          --retro-dark: #1a1a2e;
          --retro-darker: #0f0f1e;
        }

        .retro-design {
          font-family: 'Rajdhani', sans-serif;
          background: var(--retro-dark);
          color: var(--retro-cyan);
          min-height: 100vh;
        }

        .retro-title {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .cyber-grid {
          background-image:
            linear-gradient(var(--retro-cyan) 1px, transparent 1px),
            linear-gradient(90deg, var(--retro-cyan) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
          position: absolute;
          inset: 0;
          perspective: 1000px;
          transform: rotateX(60deg) translateZ(-200px);
        }

        .neon-text {
          text-shadow:
            0 0 10px var(--retro-cyan),
            0 0 20px var(--retro-cyan),
            0 0 30px var(--retro-cyan),
            0 0 40px var(--retro-purple);
        }

        .neon-pink {
          text-shadow:
            0 0 10px var(--retro-pink),
            0 0 20px var(--retro-pink),
            0 0 30px var(--retro-pink);
        }

        .neon-border {
          border: 2px solid var(--retro-cyan);
          box-shadow:
            0 0 10px var(--retro-cyan),
            inset 0 0 10px rgba(0, 245, 255, 0.2);
        }

        .geometric-shape {
          clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
        }

        .scan-line {
          position: relative;
          overflow: hidden;
        }

        .scan-line::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--retro-cyan), transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% {
            left: -100%;
            top: 0;
          }
          50% {
            left: 100%;
            top: 50%;
          }
          100% {
            left: -100%;
            top: 100%;
          }
        }

        .pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px var(--retro-purple);
          }
          50% {
            box-shadow: 0 0 40px var(--retro-pink), 0 0 60px var(--retro-purple);
          }
        }

        .retro-card {
          background: linear-gradient(135deg, rgba(157, 78, 221, 0.1), rgba(255, 0, 110, 0.1));
          border: 2px solid var(--retro-purple);
          clip-path: polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .retro-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--retro-pink);
          box-shadow: 0 10px 40px rgba(255, 0, 110, 0.3);
        }

        .retro-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .retro-card:hover::before {
          left: 100%;
        }

        .retro-btn {
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, var(--retro-purple), var(--retro-pink));
          border: 2px solid var(--retro-cyan);
          color: white;
          clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .retro-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.4s ease;
        }

        .retro-btn:hover::before {
          left: 100%;
        }

        .retro-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px var(--retro-pink);
        }

        .diagonal-split {
          background: linear-gradient(135deg, var(--retro-darker) 50%, transparent 50%);
        }

        .glitch-animation {
          position: relative;
        }

        .glitch-animation::before,
        .glitch-animation::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .glitch-animation::before {
          animation: glitch-1 2s infinite;
          color: var(--retro-pink);
          z-index: -1;
        }

        .glitch-animation::after {
          animation: glitch-2 2s infinite;
          color: var(--retro-cyan);
          z-index: -2;
        }

        @keyframes glitch-1 {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        @keyframes glitch-2 {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(2px, -2px);
          }
          40% {
            transform: translate(2px, 2px);
          }
          60% {
            transform: translate(-2px, -2px);
          }
          80% {
            transform: translate(-2px, 2px);
          }
        }

        .corner-accent {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid var(--retro-cyan);
        }

        .corner-accent.top-left {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }

        .corner-accent.top-right {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        }

        .corner-accent.bottom-left {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        }

        .corner-accent.bottom-right {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }
      `}</style>

      {/* Cyber grid background */}
      <div className="cyber-grid" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--retro-darker)]/80 border-b-2 border-[var(--retro-purple)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="retro-title text-2xl neon-text">DE RAAM</div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6 text-sm font-bold">
              <a href="#home" className="hover:text-[var(--retro-pink)] transition-colors">HOME</a>
              <a href="#system" className="hover:text-[var(--retro-pink)] transition-colors">SYSTEM</a>
              <a href="#facilities" className="hover:text-[var(--retro-pink)] transition-colors">FACILITIES</a>
              <a href="#contact" className="hover:text-[var(--retro-pink)] transition-colors">CONTACT</a>
            </div>
            <div className="retro-title text-xs text-[var(--retro-yellow)]">
              {time.toLocaleTimeString('nl-NL')}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" data-section-index="0" className="min-h-screen flex items-center justify-center py-20 px-6 relative" style={{ marginTop: '64px' }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 neon-border bg-[var(--retro-darker)]">
                <Zap size={16} className="text-[var(--retro-yellow)]" />
                <span className="text-xs font-bold tracking-wider">OPERATIONAL SINCE 1998</span>
              </div>
              <h1 className="retro-title text-7xl md:text-8xl mb-6 neon-text glitch-animation leading-tight" data-text="MANEGE D'N PERDENBAK">
                MANEGE<br />D'N PERDENBAK
              </h1>
              <p className="text-lg mb-8 text-white/80 leading-relaxed max-w-md">
                Advanced equestrian facility in Brabant featuring 25×50m indoor arena
                with premium sand flooring
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/login" className="retro-btn inline-flex items-center justify-center gap-3">
                  <span>Login</span>
                  <ArrowRight size={20} />
                </a>
                <a href="/register" className="retro-btn inline-flex items-center justify-center gap-3" style={{ background: 'transparent', color: 'var(--retro-cyan)' }}>
                  <span>Register</span>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="geometric-shape aspect-square bg-gradient-to-br from-[var(--retro-purple)] via-[var(--retro-pink)] to-[var(--retro-yellow)] p-1 pulse-glow">
                <div className="geometric-shape w-full h-full bg-[var(--retro-darker)] flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="retro-title text-7xl neon-pink mb-4">25×50</div>
                    <div className="text-xs tracking-widest text-[var(--retro-cyan)]">METER ARENA</div>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                      <div className="neon-border p-3">
                        <div className="text-[var(--retro-yellow)] font-bold">LED</div>
                        <div className="text-white/60">LIGHTING</div>
                      </div>
                      <div className="neon-border p-3">
                        <div className="text-[var(--retro-yellow)] font-bold">24/7</div>
                        <div className="text-white/60">ACCESS</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="corner-accent top-left" />
              <div className="corner-accent top-right" />
              <div className="corner-accent bottom-left" />
              <div className="corner-accent bottom-right" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y-2 border-[var(--retro-purple)] bg-gradient-to-r from-[var(--retro-purple)]/20 via-[var(--retro-pink)]/20 to-[var(--retro-purple)]/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '1250', label: 'SQ METERS', icon: Star },
              { value: '2014', label: 'RENOVATED', icon: Zap },
              { value: '100%', label: 'UPTIME', icon: Clock },
              { value: 'KNHS', label: 'CERTIFIED', icon: Star }
            ].map((stat, i) => (
              <div key={i} className="scan-line">
                <stat.icon size={24} className="text-[var(--retro-yellow)] mx-auto mb-2" />
                <div className="retro-title text-4xl neon-text mb-1">{stat.value}</div>
                <div className="text-xs tracking-widest text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System access */}
      <section id="system" data-section-index="1" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="retro-title text-6xl mb-4 neon-pink text-center">SYSTEM ACCESS</h2>
          <p className="text-center text-white/60 mb-16 max-w-2xl mx-auto">
            Three-step protocol for arena reservation
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'STEP 01',
                subtitle: 'CREATE ACCOUNT',
                desc: 'Register for free system access and user credentials'
              },
              {
                icon: Calendar,
                title: 'STEP 02',
                subtitle: 'CHECK AVAILABILITY',
                desc: 'Real-time slot verification in arena scheduling system'
              },
              {
                icon: Clock,
                title: 'STEP 03',
                subtitle: 'CONFIRM BOOKING',
                desc: 'Instant confirmation protocol with email verification'
              }
            ].map((step, i) => (
              <div key={i} className="retro-card p-8 relative">
                <div className="flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-[var(--retro-purple)] to-[var(--retro-pink)] geometric-shape mx-auto">
                  <step.icon size={32} className="text-white" />
                </div>
                <div className="retro-title text-sm text-[var(--retro-yellow)] mb-2 text-center">
                  {step.title}
                </div>
                <h3 className="retro-title text-xl mb-4 text-center neon-text">
                  {step.subtitle}
                </h3>
                <p className="text-sm text-white/70 text-center leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" data-section-index="2" className="py-24 px-6 diagonal-split">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="neon-border aspect-video bg-gradient-to-br from-[var(--retro-purple)]/30 to-[var(--retro-pink)]/30 flex items-center justify-center scan-line">
                <div className="text-[var(--retro-cyan)]/50 text-sm tracking-widest text-center">
                  [ARENA VISUALIZATION]
                </div>
              </div>
            </div>
            <div>
              <h2 className="retro-title text-5xl mb-6 neon-pink">FACILITY SPECS</h2>
              <div className="space-y-4">
                {[
                  { label: 'INDOOR ARENA', value: '25×50 METERS' },
                  { label: 'FLOOR SYSTEM', value: 'EQUISPORT SAND' },
                  { label: 'CEILING', value: 'INSULATED 2018' },
                  { label: 'ILLUMINATION', value: 'LED ARRAY' },
                  { label: 'OUTDOOR RING', value: 'SUMMER ACTIVE' },
                  { label: 'AMENITIES', value: 'FULL CANTEEN' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 neon-border hover:bg-[var(--retro-purple)]/10 transition-colors">
                    <span className="text-sm text-white/60 tracking-wider">{item.label}</span>
                    <span className="retro-title text-sm text-[var(--retro-cyan)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitions */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="retro-card p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="retro-title text-5xl mb-6 neon-text">COMPETITION MODE</h2>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Monthly KNHS dressage competitions for ponies and horses. Classes BB, B, L1, L2, M1, M2 available.
                </p>
                <div className="neon-border inline-block px-6 py-4 bg-[var(--retro-darker)] mb-6">
                  <div className="text-xs font-bold tracking-widest text-[var(--retro-yellow)]">
                    REGISTRATION: MIJNKNHS.NL
                  </div>
                </div>
                <div>
                  <a href="/evenementen" className="retro-btn inline-flex items-center gap-3">
                    <span>View Events</span>
                    <ArrowRight size={20} />
                  </a>
                </div>
              </div>
              <div className="geometric-shape aspect-video bg-gradient-to-br from-[var(--retro-cyan)]/30 to-[var(--retro-purple)]/30 flex items-center justify-center scan-line">
                <div className="text-white/30 text-sm tracking-widest text-center">
                  [COMPETITION DATA]
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--retro-purple)] via-[var(--retro-pink)] to-[var(--retro-purple)] opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="retro-title text-7xl mb-8 neon-text">INITIALIZE<br />ACCOUNT</h2>
          <p className="text-xl mb-12 text-white/80 max-w-2xl mx-auto">
            Create your account now for immediate access to the reservation system
          </p>
          <a href="/register" className="retro-btn inline-flex items-center gap-3 text-lg px-10 py-5">
            <span>Start Registration</span>
            <ArrowRight size={24} />
          </a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" data-section-index="3" className="py-20 px-6 border-t-2 border-[var(--retro-purple)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="neon-border p-8 bg-[var(--retro-darker)]/50 relative">
              <MapPin size={32} className="text-[var(--retro-cyan)] mb-4" />
              <h3 className="retro-title text-2xl mb-4 text-[var(--retro-yellow)]">LOCATION</h3>
              <p className="text-white/70">
                Provinciale weg 26<br />
                5737 GH Lieshout<br />
                Noord-Brabant, NL
              </p>
            </div>
            <div className="neon-border p-8 bg-[var(--retro-darker)]/50 relative">
              <Mail size={32} className="text-[var(--retro-cyan)] mb-4" />
              <h3 className="retro-title text-2xl mb-4 text-[var(--retro-yellow)]">CONTACT</h3>
              <Link href="/contact" className="text-[var(--retro-pink)] hover:text-[var(--retro-cyan)] transition-colors">
                Send Message →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-2 border-[var(--retro-purple)] bg-[var(--retro-darker)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="retro-title text-2xl mb-4 neon-text">STICHTING MANEGE DE RAAM</div>
          <div className="text-xs tracking-widest text-white/40">
            © 2026 — ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </footer>
    </div>
  )
}
