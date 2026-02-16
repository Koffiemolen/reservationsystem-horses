'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { toast } from 'sonner'

import { ObfuscatedContact } from '@/components/ui/ObfuscatedContact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

        .organic-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--earth-sand);
          border-radius: 16px;
          background: white;
          font-family: 'Lora', serif;
          color: var(--earth-bark);
          transition: all 0.2s;
        }

        .organic-input:focus {
          outline: none;
          border-color: var(--earth-moss);
        }

        .organic-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid var(--earth-sand);
          border-radius: 16px;
          background: white;
          font-family: 'Lora', serif;
          color: var(--earth-bark);
          resize: vertical;
          min-height: 120px;
          transition: all 0.2s;
        }

        .organic-textarea:focus {
          outline: none;
          border-color: var(--earth-moss);
        }

        .organic-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 50px;
          background: var(--earth-forest);
          color: var(--earth-cream);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 2px solid var(--earth-forest);
          cursor: pointer;
          width: 100%;
        }

        .organic-btn:hover:not(:disabled) {
          background: var(--earth-moss);
          border-color: var(--earth-moss);
          transform: scale(1.02);
        }

        .organic-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
            Contact
          </h1>
          <p className="text-xl md:text-2xl text-[var(--earth-bark)] leading-relaxed">
            Heeft u vragen? Neem gerust contact met ons op
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

      {/* Content */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="organic-card">
                <h2 className="organic-title text-3xl mb-6 text-[var(--earth-forest)]">
                  Contactgegevens
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail size={24} className="text-[var(--earth-moss)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[var(--earth-forest)] mb-1">E-mail</p>
                      <ObfuscatedContact
                        parts={['stichtingderaam', '@', 'live.nl']}
                        type="email"
                        className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone size={24} className="text-[var(--earth-moss)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[var(--earth-forest)] mb-1">Telefoon</p>
                      <ObfuscatedContact
                        parts={['06', ' – ', '27 39 54 16']}
                        type="phone"
                        className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin size={24} className="text-[var(--earth-moss)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[var(--earth-forest)] mb-1">Adres</p>
                      <p className="text-[var(--earth-bark)]">
                        Provinciale weg 26<br />
                        5737 GH Lieshout
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="organic-card">
                <h2 className="organic-title text-2xl mb-4 text-[var(--earth-forest)]">
                  Contactpersonen
                </h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-semibold text-[var(--earth-forest)]">Algemeen & Verhuur</p>
                    <p className="text-[var(--earth-bark)]">Nicole van Schaik</p>
                    <ObfuscatedContact parts={['06', ' – ', '27 39 54 16']} type="phone" className="text-[var(--earth-bark)] block" />
                    <ObfuscatedContact parts={['stichtingderaam', '@', 'live.nl']} type="email" className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)]" />
                  </div>
                  <div className="pt-4 border-t border-[var(--earth-sand)]">
                    <p className="font-semibold text-[var(--earth-forest)]">Losse Rijhal Verhuur</p>
                    <p className="text-[var(--earth-bark)]">Annemarie van den Hurk</p>
                    <ObfuscatedContact parts={['0499', '-', '423689', ' / ', '06', '-', '13208923']} type="phone" className="text-[var(--earth-bark)] block" />
                  </div>
                  <div className="pt-4 border-t border-[var(--earth-sand)]">
                    <p className="font-semibold text-[var(--earth-forest)]">Wedstrijden</p>
                    <p className="text-[var(--earth-bark)]">Nicole van Schaik</p>
                    <ObfuscatedContact parts={['06', ' – ', '27 39 54 16']} type="phone" className="text-[var(--earth-bark)] block" />
                    <ObfuscatedContact parts={['wedstrijdderaam', '@', 'live.nl']} type="email" className="text-[var(--earth-moss)] hover:text-[var(--earth-forest)]" />
                  </div>
                </div>
              </div>

              <div className="organic-card bg-[var(--earth-sand)]/30">
                <h2 className="organic-title text-2xl mb-4 text-[var(--earth-forest)]">
                  Klachten
                </h2>
                <ol className="space-y-3 text-sm text-[var(--earth-bark)]">
                  <li className="flex gap-3">
                    <span className="font-bold text-[var(--earth-moss)] flex-shrink-0">1.</span>
                    <span>
                      Dien uw klacht mondeling in bij de veiligheidscoördinator,
                      de heer Peter van de Sande (<ObfuscatedContact parts={['06', ' – ', '36 15 36 40']} type="phone" className="text-[var(--earth-bark)]" />).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-[var(--earth-moss)] flex-shrink-0">2.</span>
                    <span>
                      Indien de afhandeling niet naar tevredenheid is, dien dan
                      binnen twee weken een geschreven klacht in bij Stichting
                      Manege de Raam.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-[var(--earth-moss)] flex-shrink-0">3.</span>
                    <span>
                      De Stichting geeft binnen twee weken een geschreven
                      antwoord op uw klacht.
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Contact Form */}
            <div className="organic-card">
              <h2 className="organic-title text-3xl mb-4 text-[var(--earth-forest)]">
                Stuur ons een bericht
              </h2>
              <p className="text-[var(--earth-bark)] mb-8">
                Vul het formulier in en wij nemen zo snel mogelijk contact met u op
              </p>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[var(--earth-moss)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} className="text-[var(--earth-moss)]" />
                  </div>
                  <h3 className="organic-title text-2xl mb-2 text-[var(--earth-forest)]">Bericht verzonden!</h3>
                  <p className="text-[var(--earth-bark)] mb-6">
                    Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op.
                  </p>
                  <button onClick={() => setSuccess(false)} className="organic-btn" style={{ background: 'transparent', color: 'var(--earth-forest)', maxWidth: '200px' }}>
                    Nieuw bericht sturen
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot field - hidden from users */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <Label htmlFor="name" className="block mb-2 text-[var(--earth-forest)] font-semibold">
                      Naam
                    </Label>
                    <Input
                      id="name"
                      placeholder="Uw naam"
                      className="organic-input"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="block mb-2 text-[var(--earth-forest)] font-semibold">
                      E-mailadres
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="uw@email.nl"
                      className="organic-input"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="block mb-2 text-[var(--earth-forest)] font-semibold">
                      Telefoonnummer (optioneel)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0612345678"
                      className="organic-input"
                      {...register('phone')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="block mb-2 text-[var(--earth-forest)] font-semibold">
                      Bericht
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Uw bericht..."
                      rows={5}
                      className="organic-textarea"
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="organic-btn" disabled={isLoading}>
                    {isLoading ? 'Bezig met verzenden...' : 'Versturen'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
