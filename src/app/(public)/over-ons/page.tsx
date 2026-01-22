'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Over Stichting Manege de Raam</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Een plek waar paardrijliefhebbers samenkomen om hun passie te delen
            en hun vaardigheden te ontwikkelen.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Story */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Onze Geschiedenis</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-green max-w-none">
                <p className="text-gray-600">
                  Stichting Manege de Raam is opgericht met één doel: het bieden van
                  een toegankelijke en gastvrije plek voor iedereen die van paarden houdt.
                  Onze accommodatie beschikt over moderne faciliteiten die geschikt zijn
                  voor zowel beginnende als ervaren ruiters.
                </p>
                <p className="text-gray-600 mt-4">
                  Wij geloven in het belang van een goede relatie tussen mens en paard.
                  Daarom stellen we onze faciliteiten beschikbaar voor individuele trainingen,
                  lessen en speciale evenementen. Of je nu wilt trainen voor wedstrijden of
                  gewoon wilt genieten van een rustige rit - bij ons ben je welkom.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Onze Missie</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Toegankelijkheid</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het paardrijden toegankelijk maken voor iedereen, ongeacht ervaring of achtergrond.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Kwaliteit</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het bieden van hoogwaardige faciliteiten en een veilige omgeving.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Gemeenschap</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het creëren van een warme gemeenschap van paardrijliefhebbers.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Dierenwelzijn</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het waarborgen van het welzijn van de paarden staat altijd voorop.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Onze Faciliteiten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Rijhal (binnen)</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Onze overdekte rijhal biedt het hele jaar door de mogelijkheid
                      om te rijden, ongeacht de weersomstandigheden.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Buitenbak</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Bij mooi weer kunt u gebruik maken van onze ruime buitenbak
                      met professionele bodem.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Stalling</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Ruime stalboxen met alle voorzieningen voor het comfort
                      van uw paard.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Kantine</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Een gezellige kantine waar ruiters kunnen bijkomen
                      en ervaringen kunnen delen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Reserveren</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Wilt u onze faciliteiten gebruiken? Maak eenvoudig een account
                  aan en reserveer direct via ons online reserveringssysteem.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                    <Link href="/registreren">Account aanmaken</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Inloggen</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Adres</p>
                  <p className="text-gray-900">Raamweg 123</p>
                  <p className="text-gray-900">1234 AB Plaatsnaam</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefoon</p>
                  <p className="text-gray-900">012-3456789</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">E-mail</p>
                  <p className="text-gray-900">info@stichtingderaam.nl</p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact opnemen</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Openingstijden</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maandag - Vrijdag</span>
                    <span className="font-medium">08:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zaterdag</span>
                    <span className="font-medium">08:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zondag</span>
                    <span className="font-medium">10:00 - 18:00</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  * Reserveringen zijn 24/7 mogelijk via het online systeem.
                  Toegang tot de faciliteiten is afhankelijk van openingstijden.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
