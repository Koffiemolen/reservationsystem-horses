'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { contactSchema, type ContactInput } from '@/lib/validators'
import { fetchWithCsrf } from '@/lib/utils'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactInput) => {
    setIsLoading(true)

    try {
      const response = await fetchWithCsrf('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      // Handle CSRF and rate limit errors
      if (response.status === 403) {
        toast.error('Beveiligingstoken verlopen. Herlaad de pagina en probeer opnieuw.')
        return
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        toast.error(
          retryAfter
            ? `Te veel verzoeken. Probeer over ${retryAfter} seconden opnieuw.`
            : 'Te veel verzoeken. Probeer het later opnieuw.'
        )
        return
      }

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Er is een fout opgetreden')
      }

      setSuccess(true)
      reset()
      toast.success('Bericht verzonden!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Contact</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Heeft u vragen? Neem gerust contact met ons op.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contactgegevens</CardTitle>
                <CardDescription>
                  U kunt ons bereiken via de volgende kanalen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">E-mail</p>
                    <a
                      href="mailto:stichtingderaam@live.nl"
                      className="text-muted-foreground hover:text-primary"
                    >
                      stichtingderaam@live.nl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Telefoon</p>
                    <a
                      href="tel:+31627395416"
                      className="text-muted-foreground hover:text-primary"
                    >
                      06 – 27 39 54 16
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Adres</p>
                    <p className="text-muted-foreground">
                      Provinciale weg 26
                      <br />
                      5737 GH Lieshout
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contactpersonen</CardTitle>
                <CardDescription>
                  Neem contact op met de juiste persoon voor uw vraag
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm">Algemeen & Verhuur</p>
                  <p className="text-sm text-muted-foreground">
                    Nicole van Schaik
                  </p>
                  <p className="text-sm text-muted-foreground">
                    06 – 27 39 54 16
                  </p>
                  <a
                    href="mailto:stichtingderaam@live.nl"
                    className="text-sm text-primary hover:underline"
                  >
                    stichtingderaam@live.nl
                  </a>
                </div>
                <div className="border-t pt-3">
                  <p className="font-medium text-sm">Losse Rijhal Verhuur</p>
                  <p className="text-sm text-muted-foreground">
                    Annemarie van den Hurk
                  </p>
                  <p className="text-sm text-muted-foreground">
                    0499-423689 / 06-13208923
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="font-medium text-sm">Wedstrijden</p>
                  <p className="text-sm text-muted-foreground">
                    Nicole van Schaik
                  </p>
                  <p className="text-sm text-muted-foreground">
                    06 – 27 39 54 16
                  </p>
                  <a
                    href="mailto:wedstrijdderaam@live.nl"
                    className="text-sm text-primary hover:underline"
                  >
                    wedstrijdderaam@live.nl
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Klachten</CardTitle>
                <CardDescription>
                  Procedure voor het indienen van een klacht
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span>
                      Dien uw klacht mondeling in bij de veiligheidscoördinator,
                      de heer Peter van de Sande (06 – 36 15 36 40).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span>
                      Indien de afhandeling niet naar tevredenheid is, dien dan
                      binnen twee weken een geschreven klacht in bij Stichting
                      Manege de Raam. De klacht moet duidelijk beschreven en niet
                      anoniem zijn.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span>
                      De Stichting geeft binnen twee weken een geschreven
                      antwoord op uw klacht.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <span>
                      Bij onvoldoende oplossing kan u een klacht over veiligheid
                      of certificering in schrijven bij het Keurmerkinstituut,
                      Postbus 45, 2700 AA Zoetermeer.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">5.</span>
                    <span>
                      Het Keurmerkinstituut antwoordt binnen twee weken over de
                      afhandeling van uw klacht.
                    </span>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Stuur ons een bericht</CardTitle>
              <CardDescription>
                Vul het formulier in en wij nemen zo snel mogelijk contact met u op
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Bericht verzonden!</h3>
                  <p className="text-muted-foreground mb-4">
                    Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.
                  </p>
                  <Button onClick={() => setSuccess(false)} variant="outline">
                    Nieuw bericht sturen
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="name">Naam</Label>
                    <Input
                      id="name"
                      placeholder="Uw naam"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="uw@email.nl"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer (optioneel)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0612345678"
                      {...register('phone')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Bericht</Label>
                    <Textarea
                      id="message"
                      placeholder="Uw bericht..."
                      rows={5}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Bezig met verzenden...' : 'Versturen'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
