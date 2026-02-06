import Link from 'next/link'
import { Calendar, Users, Clock, ArrowRight, Trophy, MapPin, Mail, Instagram, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section - Simple Welcome */}
      <section className="bg-[#e8d8b7] py-16 md:py-24">
        <div className="container max-w-4xl text-center">
          <h1 className="text-5xl md:text-7xl font-serif text-[#3a3019] mb-6">
            Welkom
          </h1>
          <p className="text-xl md:text-2xl text-[#485237] leading-relaxed mb-8">
            Welkom op de site van <strong>Stichting Manege De Raam</strong>, beheerder van{' '}
            <strong>Manege D'n Perdenbak</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-base px-8 bg-[#8d974e] hover:bg-[#7a8544] text-white">
                Inloggen om te reserveren
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-base px-8 border-[#8d974e] text-[#8d974e] hover:bg-[#8d974e] hover:text-white">
                Account aanmaken
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-lg text-[#3a3019] leading-relaxed mb-6">
              Aan de rand van Lieshout (Gemeente Laarbeek) ligt onze manege met royale rijhal voor
              training, wedstrijden en evenementen.
            </p>
            <p className="text-base text-[#485237] leading-relaxed">
              Onze manege ligt landelijk en idyllisch nabij Lieshout en biedt een veilige en prettige
              omgeving voor paarden en ruiters. De rijhal is beschikbaar voor verhuur en reserveren
              kan eenvoudig online.
            </p>
          </div>
          <div className="text-center">
            <Link href="/over-ons">
              <Button variant="outline" className="border-[#8d974e] text-[#8d974e] hover:bg-[#8d974e] hover:text-white">
                Lees meer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-[#e8d8b7]">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-12 text-[#3a3019]">
            Hoe het werkt
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#8d974e] flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-serif text-[#3a3019] mb-3">Maak een account</h3>
              <p className="text-[#485237]">
                Registreer gratis om toegang te krijgen tot ons reserveringssysteem
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#8d974e] flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-serif text-[#3a3019] mb-3">Bekijk beschikbaarheid</h3>
              <p className="text-[#485237]">
                Zie direct welke tijden beschikbaar zijn in onze rijhal
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#8d974e] flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-serif text-[#3a3019] mb-3">Reserveer online</h3>
              <p className="text-[#485237]">
                Boek je tijd met enkele klikken en ontvang direct een bevestiging
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facility Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 text-[#3a3019]">
            Onze faciliteiten
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-video bg-[#d4c49a] flex items-center justify-center border border-[#caa981]">
              <span className="text-[#4a4228] text-sm text-center px-4">
                Foto: Binnenrijhal Manege D'n Perdenbak
              </span>
            </div>
            <div>
              <p className="text-base text-[#485237] mb-6 leading-relaxed">
                Onze binnenrijhal is 25 × 50 meter met een professionele
                Equisport zandboden. In 2014 werd de vloer volledig gerenoveerd
                en in 2018 ontving de rijhal een nieuw geïsoleerd dak met
                ventilatie en LED-verlichting.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-[#8d974e] mt-1">•</span>
                  <span className="text-[#485237]">
                    Binnenrijhal — 25 × 50 m, professionele zandboden
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8d974e] mt-1">•</span>
                  <span className="text-[#485237]">
                    Buitenbak (Z-ring) — beschikbaar voor zomer
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8d974e] mt-1">•</span>
                  <span className="text-[#485237]">
                    Kantine — gezellige ruimte voor ruiters
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Competitions Section */}
      <section className="py-16 md:py-20 bg-[#e8d8b7]">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 text-[#3a3019]">Wedstrijden</h2>
              <p className="text-base text-[#485237] mb-4 leading-relaxed">
                Bij Stichting Manege de Raam vinden vaak maandelijks (KNHS)
                wedstrijden plaats. Bijna iedere maand worden door de Stichting
                dressuurwedstrijden georganiseerd voor pony's en paarden.
              </p>
              <p className="text-base text-[#485237] mb-6 leading-relaxed">
                Beschikbare klassen: BB, B, L1, L2, M1 en M2. Klasse Z wordt
                alleen aangeboden tijdens zomerwedstrijden. Inschrijving via
                mijnknhs.nl.
              </p>
              <p className="text-lg italic text-[#3a3019] mb-6">
                "Paarden liefhebbers weten hoe geluk ruikt"
              </p>
              <Link href="/evenementen">
                <Button variant="outline" className="border-[#8d974e] text-[#8d974e] hover:bg-[#8d974e] hover:text-white">
                  Alle evenementen
                </Button>
              </Link>
            </div>
            <div className="aspect-video bg-[#d4c49a] flex items-center justify-center border border-[#caa981]">
              <span className="text-[#4a4228] text-sm text-center px-4">
                Foto: Wedstrijd bij Manege D'n Perdenbak
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-8 text-[#3a3019]">
            Volg ons
          </h2>
          <div className="text-center mb-8">
            <p className="text-base text-[#485237] mb-6">
              Blijf op de hoogte van onze activiteiten, wedstrijden en nieuws via social media
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="https://www.facebook.com/stichtingderaam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#8d974e] flex items-center justify-center hover:bg-[#7a8544] transition-colors"
              >
                <Facebook className="h-6 w-6 text-white" />
              </a>
              <a
                href="https://www.instagram.com/stichtingderaam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-[#8d974e] flex items-center justify-center hover:bg-[#7a8544] transition-colors"
              >
                <Instagram className="h-6 w-6 text-white" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-[#d4c49a] flex items-center justify-center border border-[#caa981]"
              >
                <span className="text-[#4a4228] text-xs text-center px-2">
                  Instagram foto {i}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[#e8d8b7]">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-[#3a3019]">
            Klaar om te beginnen?
          </h2>
          <p className="text-base text-[#485237] mb-8 leading-relaxed">
            Maak vandaag nog een account aan en begin met het reserveren van
            tijd in onze rijhal. Het is gratis en je kunt direct beginnen.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-8 bg-[#8d974e] hover:bg-[#7a8544] text-white">
              Gratis registreren
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-12 bg-white border-t border-[#caa981]">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6 text-[#8d974e]" />
              <p className="text-[#3a3019] font-medium">Adres</p>
              <p className="text-[#485237] text-sm">
                Provinciale weg 26<br />5737 GH Lieshout
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail className="h-6 w-6 text-[#8d974e]" />
              <p className="text-[#3a3019] font-medium">Contact</p>
              <Link href="/contact" className="text-[#8d974e] hover:text-[#7a8544] text-sm">
                Neem contact op
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
