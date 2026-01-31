import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerhuurPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Service & Verhuur</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Overzicht van alle huurmogelijkheden en tarieven bij Manege
            D'n Perdenbak.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Rijhal Verhuur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Rijhal Verhuur</CardTitle>
              <CardDescription>
                Binnenrijhal en buitenbak beschikbaar voor individuele huur en
                passes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold text-gray-900">
                        Optie
                      </th>
                      <th className="text-left py-3 font-semibold text-gray-900">
                        Prijs
                      </th>
                      <th className="text-left py-3 font-semibold text-gray-900">
                        Borg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700">
                        Binnenrijhal — per persoon/uur
                      </td>
                      <td className="py-3 text-gray-700">€12</td>
                      <td className="py-3 text-gray-500">—</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700">
                        Buitenbak — per persoon/uur
                      </td>
                      <td className="py-3 text-gray-700">€10</td>
                      <td className="py-3 text-gray-500">—</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700">
                        Winterpass (1 okt – 1 apr)
                      </td>
                      <td className="py-3 text-gray-700">€250</td>
                      <td className="py-3 text-gray-700">€25</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700 pl-4">
                        ↳ Extra huisgenoot
                      </td>
                      <td className="py-3 text-gray-700">€75</td>
                      <td className="py-3 text-gray-500">—</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700">
                        Zomerpass (1 apr – 1 okt)
                      </td>
                      <td className="py-3 text-gray-700">€150</td>
                      <td className="py-3 text-gray-700">€25</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700 pl-4">
                        ↳ Extra huisgenoot
                      </td>
                      <td className="py-3 text-gray-700">€50</td>
                      <td className="py-3 text-gray-500">—</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 text-gray-700">Maandpass</td>
                      <td className="py-3 text-gray-700">€60</td>
                      <td className="py-3 text-gray-700">€25</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-700 pl-4">
                        ↳ Extra huisgenoot
                      </td>
                      <td className="py-3 text-gray-700">€40</td>
                      <td className="py-3 text-gray-500">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Contactpersonen
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Losse huur:</strong> Annemarie van den Hurk —
                  0499-423689 / 06-13208923
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Passes:</strong> Nicole van Schaik — 06-27395416
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Overige Verhuur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Overige Verhuur</CardTitle>
              <CardDescription>
                Terrein, kantine en Z-ring beschikbaar voor evenementen en clubs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Manege / Foyer & Terrein
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Beschikbaar voor paard- en niet-paard-gerelateerde activiteiten
                  zoals verenigingsfeesten, kleine festivals en vlooienmarkten.
                  Een week van tevoren annuleren is vereist.
                </p>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Hele dag</td>
                      <td className="py-2 text-gray-700 text-right">
                        €250 (excl. btw)
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">
                        Halve dag (4 uur) / clinic
                      </td>
                      <td className="py-2 text-gray-700 text-right">
                        €125 (excl. btw)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700">
                        Kantine halve dag (4 uur)
                      </td>
                      <td className="py-2 text-gray-700 text-right">
                        €90 (excl. btw)
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">Borg: €100</p>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Rijclubs & Ponyclubs
                </h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">
                        KNHS-aangesloten club
                      </td>
                      <td className="py-2 text-gray-700 text-right">
                        €10 / uur
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700">
                        Andere sportclubs
                      </td>
                      <td className="py-2 text-gray-700 text-right">
                        €25 / uur
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">
                  Tarieven excl. btw. Includes verlichting en toegang tot kantine.
                </p>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Z-ring (Buitenbak)
                </h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-700">Per dag</td>
                      <td className="py-2 text-gray-700 text-right">
                        €75 (excl. btw)
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">
                  Borg: €50. Huurder is aansprakelijk voor eventuele schade aan
                  apparatuur.
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Contact voor verhuur
                </p>
                <p className="text-sm text-gray-600">
                  Nicole van Schaik — 06-27395416 — stichtingderaam@live.nl
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Annemarie van den Hurk — 0499-423689 / 06-13208923
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Veiligheidsvereisten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Veiligheidsvereisten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Alle ruiters moeten aan de volgende vereisten voldoen:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  Goedgekeurde veiligheidscap (CE, EN-1384) met gesloten kinriem
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  Rijlaarzen of stevig schoeisel met gladde zolen en hakken
                  (eventueel met chaps)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  Geen grote, uitstekende of losse sieraden en kleding
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                De manege beschikt over een geldig veiligheidscertificaat.
                Paarden en ponies mogen niet los of in de longe worden gelaten in
                de rijbanen.
              </p>
            </CardContent>
          </Card>

          {/* Wedstrijd Tarieven */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Wedstrijd Tarieven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Wedstrijd tarieven zijn afhankelijk van de wedstrijd en worden
                gepubliceerd via{' '}
                <a
                  href="https://mijnknhs.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  mijnknhs.nl
                </a>
                . Neem voor vragen contact op met Nicole van Schaik via{' '}
                <a
                  href="mailto:wedstrijdderaam@live.nl"
                  className="text-green-600 hover:underline"
                >
                  wedstrijdderaam@live.nl
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
