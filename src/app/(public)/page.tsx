import Link from 'next/link'
import { Calendar, Users, Clock, ArrowRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welkom bij
            <span className="text-primary block mt-2">Manege de Raam</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Aan de rand van Lieshout ligt onze manege met royale rijhal voor
            training, wedstrijden en evenementen. Reserveer eenvoudig online.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Inloggen om te reserveren
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Account aanmaken
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Hoe het werkt
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Maak een account</CardTitle>
                <CardDescription>
                  Registreer gratis om toegang te krijgen tot ons reserveringssysteem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Bekijk beschikbaarheid</CardTitle>
                <CardDescription>
                  Zie direct welke tijden beschikbaar zijn in onze rijhal
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Reserveer online</CardTitle>
                <CardDescription>
                  Boek je tijd met enkele klikken en ontvang direct een bevestiging
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Facility Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Onze faciliteiten</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Onze binnenrijhal is 25 × 50 meter met een professionele
                Equisport zandboden. In 2014 werd de vloer volledig gerenoveerd
                en in 2018 ontving de rijhal een nieuw geïsoleerd dak met
                ventilatie en LED-verlichting.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">
                    Binnenrijhal — 25 × 50 m, professionele zandboden
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">
                    Buitenbak (Z-ring) — beschikbaar voor zomer
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">
                    Kantine — gezellige ruimte voor ruiters
                  </span>
                </div>
              </div>
              <Link href="/over-ons" className="mt-8 inline-block">
                <Button variant="outline">
                  Meer over ons
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">
                Foto: Binnenrijhal Manege D'n Perdenbak
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Competitions Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-6">Wedstrijden</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Bijna iedere maand worden door de Stichting dressuurwedstrijden
              georganiseerd voor pony's en paarden in Manege D'n Perdenbak.
            </p>
            <p className="text-muted-foreground mb-8">
              Beschikbare klassen: BB, B, L1, L2, M1 en M2. Klasse Z wordt
              alleen aangeboden tijdens zomerwedstrijden. Inschrijving via
              mijnknhs.nl.
            </p>
            <Link href="/evenementen">
              <Button variant="outline">
                Alle evenementen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Klaar om te beginnen?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Maak vandaag nog een account aan en begin met het reserveren van
            tijd in onze rijhal. Het is gratis en je kunt direct beginnen.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Gratis registreren
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
