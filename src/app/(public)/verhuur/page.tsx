'use client'

import { ObfuscatedContact } from '@/components/ui/ObfuscatedContact'

export default function VerhuurPage() {
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
        }

        .wave-divider {
          position: relative;
          width: 100%;
          height: 60px;
        }

        .pricing-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .pricing-table thead th {
          padding: 1rem;
          text-align: left;
          color: var(--earth-forest);
          font-weight: 600;
          border-bottom: 2px solid var(--earth-sand);
        }

        .pricing-table tbody td {
          padding: 1rem;
          border-bottom: 1px solid var(--earth-sand);
        }

        .pricing-table tbody tr:last-child td {
          border-bottom: none;
        }
      `}</style>

      {/* Hero */}
      <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-br from-[var(--earth-sand)] to-[var(--earth-cream)]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="organic-title text-6xl md:text-7xl mb-6 text-[var(--earth-forest)]">
            Service & Verhuur
          </h1>
          <p className="text-xl md:text-2xl text-[var(--earth-bark)] leading-relaxed">
            Overzicht van alle huurmogelijkheden en tarieven bij Manege D'n Perdenbak
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

      {/* Rijhal Verhuur */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="organic-card">
            <h2 className="organic-title text-4xl mb-4 text-[var(--earth-forest)]">
              Rijhal Verhuur
            </h2>
            <p className="text-[var(--earth-bark)] mb-8">
              Binnenrijhal en buitenbak beschikbaar voor individuele huur en passe-partouts
            </p>

            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Optie</th>
                  <th>Prijs</th>
                  <th>Borg</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-[var(--earth-bark)]">Binnenrijhal — per persoon/uur</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€12</td>
                  <td className="text-[var(--earth-bark)]/50">—</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)]">Buitenbak — per persoon/uur</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€10</td>
                  <td className="text-[var(--earth-bark)]/50">—</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)]">Winter passe-partout (1 okt – 1 apr)</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€250</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€25</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)] pl-8">↳ Extra huisgenoot</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€75</td>
                  <td className="text-[var(--earth-bark)]/50">—</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)]">Zomer passe-partout (1 apr – 1 okt)</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€150</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€25</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)] pl-8">↳ Extra huisgenoot</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€50</td>
                  <td className="text-[var(--earth-bark)]/50">—</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)]">Maand passe-partouts</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€60</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€25</td>
                </tr>
                <tr>
                  <td className="text-[var(--earth-bark)] pl-8">↳ Extra huisgenoot</td>
                  <td className="text-[var(--earth-bark)] font-semibold">€40</td>
                  <td className="text-[var(--earth-bark)]/50">—</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-8 p-6 bg-[var(--earth-sand)]/30 rounded-2xl">
              <p className="text-sm font-semibold text-[var(--earth-forest)] mb-3">
                Contactpersonen
              </p>
              <p className="text-sm text-[var(--earth-bark)] mb-2">
                <strong>Losse huur:</strong> Annemarie van den Hurk — <ObfuscatedContact parts={['0499', '-', '423689', ' / ', '06', '-', '13208923']} type="phone" className="text-[var(--earth-bark)]" />
              </p>
              <p className="text-sm text-[var(--earth-bark)]">
                <strong>Passe-partouts:</strong> Nicole van Schaik — <ObfuscatedContact parts={['06', '-', '27395416']} type="phone" className="text-[var(--earth-bark)]" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overige Verhuur */}
      <section className="py-24 px-6 bg-[var(--earth-cream)]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="organic-card">
            <h2 className="organic-title text-4xl mb-4 text-[var(--earth-forest)]">
              Overige Verhuur
            </h2>
            <p className="text-[var(--earth-bark)] mb-8">
              Terrein, kantine en Z-ring beschikbaar voor evenementen en clubs
            </p>

            <div className="space-y-8">
              {/* Manege / Foyer & Terrein */}
              <div>
                <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">
                  Manege / Foyer & Terrein
                </h3>
                <p className="text-sm text-[var(--earth-bark)] mb-4">
                  Beschikbaar voor paard- en niet-paard-gerelateerde activiteiten
                  zoals verenigingsfeesten, kleine festivals en vlooienmarkten.
                  Een week van tevoren annuleren is vereist.
                </p>
                <table className="pricing-table">
                  <tbody>
                    <tr>
                      <td className="text-[var(--earth-bark)]">Hele dag</td>
                      <td className="text-[var(--earth-bark)] font-semibold text-right">€250 (excl. btw)</td>
                    </tr>
                    <tr>
                      <td className="text-[var(--earth-bark)]">Halve dag (4 uur) / clinic</td>
                      <td className="text-[var(--earth-bark)] font-semibold text-right">€125 (excl. btw)</td>
                    </tr>
                    <tr>
                      <td className="text-[var(--earth-bark)]">Kantine halve dag (4 uur)</td>
                      <td className="text-[var(--earth-bark)] font-semibold text-right">€90 (excl. btw)</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-[var(--earth-bark)]/60 mt-3">Borg: €100</p>
              </div>

              {/* Rijclubs & Ponyclubs */}
              <div className="pt-6 border-t border-[var(--earth-sand)]">
                <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">
                  Rijclubs & Ponyclubs
                </h3>
                <table className="pricing-table">
                  <tbody>
                    <tr>
                      <td className="text-[var(--earth-bark)]">KNHS-aangesloten club</td>
                      <td className="text-[var(--earth-bark)] font-semibold text-right">€10 / uur</td>
                    </tr>
                    <tr>
                      <td className="text-[var(--earth-bark)]">Andere sportclubs</td>
                      <td className="text-[var(--earth-bark)] font-semibold text-right">€25 / uur</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-[var(--earth-bark)]/60 mt-3">
                  Tarieven excl. btw. Includes verlichting en toegang tot kantine.
                </p>
              </div>

              {/* Z-ring */}
              <div className="pt-6 border-t border-[var(--earth-sand)]">
                <h3 className="organic-title text-2xl mb-3 text-[var(--earth-forest)]">
                  Z-ring (Buitenbak)
                </h3>
                <table className="pricing-table">
                  <tbody>
                    <tr>
                      <td className="text-[var(--earth-bark)]">Per dag</td>
                      <td className="text-[var(--earth-bark)] font-semibold text-right">€75 (excl. btw)</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-[var(--earth-bark)]/60 mt-3">
                  Borg: €50. Huurder is aansprakelijk voor eventuele schade aan apparatuur.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-[var(--earth-sand)]/30 rounded-2xl">
              <p className="text-sm font-semibold text-[var(--earth-forest)] mb-3">
                Contact voor verhuur
              </p>
              <p className="text-sm text-[var(--earth-bark)] mb-2">
                Nicole van Schaik — <ObfuscatedContact parts={['06', '-', '27395416']} type="phone" className="text-[var(--earth-bark)]" /> — <ObfuscatedContact parts={['stichtingderaam', '@', 'live.nl']} type="email" className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)]" />
              </p>
              <p className="text-sm text-[var(--earth-bark)]">
                Annemarie van den Hurk — <ObfuscatedContact parts={['0499', '-', '423689', ' / ', '06', '-', '13208923']} type="phone" className="text-[var(--earth-bark)]" />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Veiligheidsvereisten */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="organic-card">
            <h2 className="organic-title text-4xl mb-4 text-[var(--earth-forest)]">
              Veiligheidsvereisten
            </h2>
            <p className="text-[var(--earth-bark)] mb-6">
              Alle ruiters moeten aan de volgende vereisten voldoen:
            </p>
            <ul className="space-y-3">
              {[
                'Goedgekeurde veiligheidscap (CE, EN-1384) met gesloten kinriem',
                'Rijlaarzen of stevig schoeisel met gladde zolen en hakken (eventueel met chaps)',
                'Geen grote, uitstekende of losse sieraden en kleding'
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--earth-moss)] mt-2 flex-shrink-0" />
                  <span className="text-[var(--earth-bark)]">{req}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[var(--earth-bark)]/70 mt-6 pt-6 border-t border-[var(--earth-sand)]">
              De manege beschikt over een geldig veiligheidscertificaat.
              Paarden en ponies mogen niet los of in de longe worden gelaten in
              de rijbanen.
            </p>
          </div>
        </div>
      </section>

      {/* Wedstrijd Tarieven */}
      <section className="py-24 px-6 bg-[var(--earth-cream)]">
        <div className="max-w-5xl mx-auto">
          <div className="organic-card">
            <h2 className="organic-title text-4xl mb-4 text-[var(--earth-forest)]">
              Wedstrijd Tarieven
            </h2>
            <p className="text-[var(--earth-bark)] leading-relaxed">
              Wedstrijd tarieven zijn afhankelijk van de wedstrijd en worden
              gepubliceerd via{' '}
              <a
                href="https://mijnknhs.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)] transition-colors underline"
              >
                mijnknhs.nl
              </a>
              . Neem voor vragen contact op met Nicole van Schaik via{' '}
              <ObfuscatedContact
                parts={['wedstrijdderaam', '@', 'live.nl']}
                type="email"
                className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)] transition-colors underline"
              />
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
