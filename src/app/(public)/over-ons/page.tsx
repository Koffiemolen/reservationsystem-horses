'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Users, Target, Heart, Shield } from 'lucide-react'
import { ObfuscatedContact } from '@/components/ui/ObfuscatedContact'

export default function OverOnsPage() {
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
          padding: 2.5rem;
          box-shadow: 0 4px 24px rgba(74, 93, 74, 0.08);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
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
      `}</style>

      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-[var(--earth-sand)] to-[var(--earth-cream)]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="organic-title text-6xl md:text-7xl mb-6 text-[var(--earth-forest)]">
            Over Ons
          </h1>
          <p className="text-xl md:text-2xl text-[var(--earth-bark)] leading-relaxed">
            Aan de rand van Lieshout ligt onze manege met royale rijhal voor
            training, wedstrijden en evenementen — gerund door een bestuur en
            vrijwilligers sinds 1983
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

      {/* History */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="organic-card">
            <h2 className="organic-title text-4xl md:text-5xl mb-6 text-[var(--earth-forest)]">
              Onze Geschiedenis
            </h2>
            <div className="space-y-4 text-[var(--earth-bark)] leading-relaxed">
              <p>
                Stichting Manege de Raam is opgericht op 26 september 1983 en
                beheert Manege D'n Perdenbak in Lieshout. In de loop van de
                jaren heeft de manege door middel van vrijwilligers en een
                toegewijd bestuur een unieke plek weten te bewaren voor
                paardenliefhebbers in de regio.
              </p>
              <p>
                Op 25 augustus 2014 startte een grote renovatie: een nieuwe
                eb-en-vloed vloer in de binnenrijhal, veiligheidsglas tussen
                rijhal en kantine, en een nieuwe keerwand. De manege heropende
                op 3 oktober 2014. In de zomer van 2018 volgde de vervanging
                van het asbestdak, in samenwerking met de gemeente Laarbeek.
                De feestelijke heropening door burgemeester Frank van der
                Meijden vond plaats op 6 oktober 2018.
              </p>
              <p>
                In 2024 vierde de manege haar 40e verjaardag — een mijlpaal die
                onderstreept hoe Manege D'n Perdenbak een vaste waarde is
                geworden in de lokale paardwereld.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 bg-[var(--earth-cream)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="organic-title text-4xl md:text-5xl mb-12 text-center text-[var(--earth-forest)]">
            Onze Missie
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                title: 'Toegankelijkheid',
                desc: 'Het paardrijden toegankelijk maken voor iedereen, ongeacht ervaring of achtergrond.'
              },
              {
                icon: Target,
                title: 'Kwaliteit',
                desc: 'Het bieden van hoogwaardige faciliteiten en een veilige omgeving, ondersteund door een geldig veiligheidscertificaat.'
              },
              {
                icon: Heart,
                title: 'Gemeenschap',
                desc: 'Het creëren van een warme gemeenschap van paardrijliefhebbers, ondersteund door vrijwilligers die de manege draaiende houden.'
              },
              {
                icon: Shield,
                title: 'Dierenwelzijn',
                desc: 'Het waarborgen van het welzijn van de paarden staat altijd voorop.'
              }
            ].map((item, i) => (
              <div key={i} className="organic-card">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--earth-moss)] to-[var(--earth-forest)] flex items-center justify-center mb-4">
                  <item.icon size={28} className="text-white" />
                </div>
                <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">
                  {item.title}
                </h3>
                <p className="text-[var(--earth-bark)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="organic-title text-4xl md:text-5xl mb-12 text-center text-[var(--earth-forest)]">
            Het Bestuur
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="organic-card">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--earth-sand)] to-[var(--earth-clay)] flex items-center justify-center mb-4">
                <span className="organic-title text-2xl text-[var(--earth-forest)]">AvH</span>
              </div>
              <h3 className="organic-title text-2xl mb-2 text-[var(--earth-forest)]">
                Annemarie van den Hurk
              </h3>
              <p className="text-[var(--earth-moss)] font-semibold mb-3">
                Voorzitter & Veiligheidsbegeleider
              </p>
              <p className="text-[var(--earth-bark)] mb-3 leading-relaxed">
                Verantwoordelijk voor losse verhuur (rijhal en overig) en
                het beheer van de faciliteiten.
              </p>
              <ObfuscatedContact parts={['06', ' – ', '13 20 89 23']} type="phone" className="text-[var(--earth-bark)] font-medium" />
            </div>

            <div className="organic-card">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--earth-sand)] to-[var(--earth-clay)] flex items-center justify-center mb-4">
                <span className="organic-title text-2xl text-[var(--earth-forest)]">NvS</span>
              </div>
              <h3 className="organic-title text-2xl mb-2 text-[var(--earth-forest)]">
                Nicole van Schaik
              </h3>
              <p className="text-[var(--earth-moss)] font-semibold mb-3">
                Secretaris & Penningmesteres
              </p>
              <p className="text-[var(--earth-bark)] mb-3 leading-relaxed">
                Coördineert wedstrijden en behandelt verzoeken voor
                passe-partouts.
              </p>
              <ObfuscatedContact parts={['06', ' – ', '27 39 54 16']} type="phone" className="text-[var(--earth-bark)] font-medium" />
            </div>
          </div>

          <div className="organic-card bg-[var(--earth-sand)]/30">
            <p className="text-[var(--earth-bark)] leading-relaxed">
              Wij bedanken alle vrijwilligers die de manege netjes houden, de
              wedstrijden organiseren en ervoor zorgen dat het gezellig is in
              de kantine. Elke woensdagmiddag (13:00 – 14:00) is er een vast
              moment voor onderhoud door het vrijwilligersteam.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-24 px-6 bg-[var(--earth-cream)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="organic-title text-4xl md:text-5xl mb-12 text-center text-[var(--earth-forest)]">
            Onze Faciliteiten
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Binnenrijhal',
                desc: '25 × 50 meter met professionele Equisport zandboden. Gerenoveerd in 2014 met een nieuw geïsoleerd dak (2018), voorzien van ventilatie en LED-verlichting.'
              },
              {
                title: 'Buitenbak (Z-ring)',
                desc: 'Beschikbaar voor zomerwedstrijden en privé gebruik. Verhuur mogelijk voor €75 per dag.'
              },
              {
                title: 'Kantine',
                desc: 'Een gezellige kantine waar ruiters kunnen bijkomen, bemand door vrijwilligers tijdens evenementen en wedstrijden.'
              },
              {
                title: 'Terrein',
                desc: 'Het terrein is beschikbaar voor verhuur voor paard- en niet-paard-gerelateerde activiteiten zoals verenigingsfeesten.'
              }
            ].map((facility, i) => (
              <div key={i} className="organic-card">
                <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">
                  {facility.title}
                </h3>
                <p className="text-[var(--earth-bark)] leading-relaxed text-sm">
                  {facility.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center organic-card">
          <h2 className="organic-title text-4xl mb-6 text-[var(--earth-forest)]">
            Klaar om te beginnen?
          </h2>
          <p className="text-[var(--earth-bark)] mb-8 leading-relaxed">
            Wilt u onze rijhal gebruiken? Maak eenvoudig een account aan en
            reserveer direct via ons online reserveringssysteem. De rijhal
            is 24/7 beschikbaar voor reserveringen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="organic-btn">
              Account aanmaken
            </Link>
            <Link href="/login" className="organic-btn" style={{ background: 'transparent', color: 'var(--earth-forest)' }}>
              Inloggen
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6 bg-[var(--earth-cream)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="organic-card text-center">
              <MapPin size={32} className="text-[var(--earth-moss)] mx-auto mb-4" />
              <h3 className="organic-title text-xl mb-2 text-[var(--earth-forest)]">Adres</h3>
              <p className="text-[var(--earth-bark)] text-sm">
                Provinciale weg 26<br />
                5737 GH Lieshout
              </p>
            </div>
            <div className="organic-card text-center">
              <Phone size={32} className="text-[var(--earth-moss)] mx-auto mb-4" />
              <h3 className="organic-title text-xl mb-2 text-[var(--earth-forest)]">Telefoon</h3>
              <ObfuscatedContact parts={['06', ' – ', '27 39 54 16']} type="phone" className="text-[var(--earth-bark)] text-sm" />
            </div>
            <div className="organic-card text-center">
              <Mail size={32} className="text-[var(--earth-moss)] mx-auto mb-4" />
              <h3 className="organic-title text-xl mb-2 text-[var(--earth-forest)]">E-mail</h3>
              <Link href="/contact" className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)] transition-colors text-sm">
                Stuur ons een bericht →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
