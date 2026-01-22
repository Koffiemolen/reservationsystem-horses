import Link from 'next/link'
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react'
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
            Reserveer eenvoudig je tijd in onze rijhal. Ons online reserveringssysteem
            maakt het makkelijk om beschikbaarheid te bekijken en direct te boeken.
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

      {/* About Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Over onze manege</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Stichting Manege de Raam biedt een prachtige binnenrijhal voor
              paardenliefhebbers. Of je nu wilt trainen, lessen wilt nemen, of
              gewoon wilt rijden - onze faciliteiten staan voor je klaar.
            </p>
            <Link href="/over-ons">
              <Button variant="outline">
                Meer over ons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
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
