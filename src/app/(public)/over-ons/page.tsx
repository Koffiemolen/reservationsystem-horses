import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">
            Over Stichting Manege de Raam
          </h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Aan de rand van Lieshout ligt onze manege met royale rijhal voor
            training, wedstrijden en evenementen — gerund door een bestuur en
            vrijwilligers sinds 1983.
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
                  Stichting Manege de Raam is opgericht op 26 september 1983 en
                  beheert Manege D'n Perdenbak in Lieshout. In de loop van de
                  jaren heeft de manege door middel van vrijwilligers en een
                  toegewijd bestuur een unieke plek weten te bewaren voor
                  paardenliefhebbers in de regio.
                </p>
                <p className="text-gray-600 mt-4">
                  Op 25 augustus 2014 startte een grote renovatie: een nieuwe
                  eb-en-vloed vloer in de binnenrijhal, veiligheidsglas tussen
                  rijhal en kantine, en een nieuwe keerwand. De manege heropende
                  op 3 oktober 2014. In de zomer van 2018 volgde de vervanging
                  van het asbestdak, in samenwerking met de gemeente Laarbeek.
                  De feestelijke heropening door burgemeester Frank van der
                  Meijden vond plaats op 6 oktober 2018.
                </p>
                <p className="text-gray-600 mt-4">
                  In 2024 vierde de manege haar 40e verjaardag — een mijlpaal die
                  onderstreept hoe Manege D'n Perdenbak een vaste waarde is
                  geworden in de lokale paardwereld.
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
                        Het paardrijden toegankelijk maken voor iedereen,
                        ongeacht ervaring of achtergrond.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Kwaliteit</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het bieden van hoogwaardige faciliteiten en een veilige
                        omgeving, ondersteund door een geldig
                        veiligheidscertificaat.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Gemeenschap</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het creëren van een warme gemeenschap van
                        paardrijliefhebbers, ondersteund door vrijwilligers die
                        de manege draaiende houden.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong className="text-gray-900">Dierenwelzijn</strong>
                      <p className="text-gray-600 text-sm mt-1">
                        Het waarborgen van het welzijn van de paarden staat
                        altijd voorop.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Het Bestuur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                      AvH
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Annemarie van den Hurk
                      </h4>
                      <p className="text-sm text-green-600 font-medium">
                        Voorzitter & Veiligheidsbegeleider
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Verantwoordelijk voor losse verhuur (rijhal en overig) en
                        het beheer van de faciliteiten.
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        06 – 13 20 89 23
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                      NvS
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Nicole van Schaik
                      </h4>
                      <p className="text-sm text-green-600 font-medium">
                        Secretaris & Penningmesteres
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Coördineert wedstrijden en behandelt verzoeken voor
                        passe-partouts.
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        06 – 27 39 54 16
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-6 pt-4 border-t">
                  Wij bedanken alle vrijwilligers die de manege netjes houden, de
                  wedstrijden organiseren en ervoor zorgen dat het gezellig is in
                  de kantine. Elke woensdagmiddag (13:00 – 14:00) is er een vast
                  moment voor onderhoud door het vrijwilligersteam.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Onze Faciliteiten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Binnenrijhal</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      25 × 50 meter met professionele Equisport zandboden.
                      Gerenoveerd in 2014 met een nieuw geïsoleerd dak (2018),
                      voorzien van ventilatie en LED-verlichting.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">
                      Buitenbak (Z-ring)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Beschikbaar voor zomerwedstrijden en privé gebruik.
                      Verhuur mogelijk voor €75 per dag.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Kantine</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Een gezellige kantine waar ruiters kunnen bijkomen,
                      bemand door vrijwilligers tijdens evenementen en
                      wedstrijden.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">Terrein</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Het terrein is beschikbaar voor verhuur voor paard- en
                      niet-paard-gerelateerde activiteiten zoals
                      verenigingsfeesten.
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
                  Wilt u onze rijhal gebruiken? Maak eenvoudig een account aan en
                  reserveer direct via ons online reserveringssysteem. De rijhal
                  is 24/7 beschikbaar voor reserveringen.
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
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Adres</p>
                    <p className="text-gray-900 text-sm">Provinciale weg 26</p>
                    <p className="text-gray-900 text-sm">5737 GH Lieshout</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Telefoon</p>
                    <p className="text-gray-900 text-sm">06 – 27 39 54 16</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-mail</p>
                    <p className="text-gray-900 text-sm">
                      stichtingderaam@live.nl
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact opnemen</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarieven</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Binnenrijhal</span>
                    <span className="font-medium">€12 / uur</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buitenbak</span>
                    <span className="font-medium">€10 / uur</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Winterpass</span>
                    <span className="font-medium">€250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zomerpass</span>
                    <span className="font-medium">€150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maandpass</span>
                    <span className="font-medium">€60</span>
                  </div>
                </div>
                <Link href="/verhuur" className="mt-4 inline-block w-full">
                  <Button variant="outline" className="w-full text-sm">
                    Alle tarieven bekijken
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
