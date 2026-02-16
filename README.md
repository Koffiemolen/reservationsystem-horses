# Reserveringssysteem - Stichting Manege de Raam

Een modern reserveringssysteem voor Stichting Manege de Raam, gebouwd met Next.js 16, TypeScript, Prisma en shadcn/ui.

## Functionaliteiten

### Gebruikers
- Account registratie met sterke wachtwoordeisen (12+ tekens, hoofdletter, kleine letter, cijfer, speciaal teken)
- Inloggen en uitloggen
- Wachtwoord vergeten / resetten
- Persoonlijke agenda met reserveringen

### Reserveringen
- Kalenderweergave (week/maand/dag)
- Reserveringen maken met overlap-waarschuwingen (niet blokkering)
- Reserveringen bewerken en annuleren
- Vrije tijdsselectie (24/7 beschikbaar)

### Admin Functies
- Dashboard met statistieken
- Gebruikersbeheer (rollen wijzigen, accounts deactiveren)
- Blokkeringen aanmaken (onderhoud, evenementen)
- Evenementen beheren

### Publieke Pagina's
- Homepage
- Over ons pagina
- Evenementen kalender
- Contactformulier

## Technische Stack

- **Framework**: Next.js 16 (App Router)
- **Taal**: TypeScript
- **Database**: SQLite (Prisma ORM)
- **Authenticatie**: Auth.js (NextAuth v5)
- **UI Componenten**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Formulieren**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)

## Installatie

### Vereisten
- Node.js 18+
- npm of yarn

### Stappen

1. **Installeer dependencies**
   ```bash
   npm install
   ```

2. **Configureer environment variabelen**

   Maak een `.env` bestand aan (of pas het bestaande aan):
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   AUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Optioneel: Email (Bird)
   EMAIL_API_KEY="your-bird-api-key"
   EMAIL_FROM="reserveringenderaam@stijvehark.nl"
   ```

3. **Initialiseer de database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Start de development server**
   ```bash
   npm run dev
   ```

5. **Open de applicatie**

   Ga naar [http://localhost:3000](http://localhost:3000)

## Test Accounts

Na het seeden van de database zijn de volgende accounts beschikbaar:

| Rol   | Email                      | Wachtwoord    |
|-------|----------------------------|---------------|
| Admin | admin@stichtingderaam.nl   | Admin123!@#   |
| User  | test@example.nl            | Test123!@#    |

## Project Structuur

```
src/
├── app/                    # Next.js App Router pagina's
│   ├── (admin)/           # Admin pagina's (dashboard, gebruikers)
│   ├── (auth)/            # Authenticatie pagina's (login, register)
│   ├── (dashboard)/       # Gebruiker pagina's (agenda, reserveringen)
│   ├── (public)/          # Publieke pagina's (home, contact, over-ons)
│   └── api/               # API routes
├── components/
│   ├── calendar/          # Kalender componenten
│   ├── layout/            # Header, Footer
│   ├── reservations/      # Reservering formulieren
│   └── ui/                # shadcn/ui componenten
├── lib/                   # Utilities, auth config, validators
├── services/              # Business logic (reservations, blocks, email)
└── types/                 # TypeScript type definities
```

## API Routes

### Authenticatie
- `POST /api/auth/register` - Registreren
- `POST /api/auth/forgot-password` - Wachtwoord reset aanvragen
- `POST /api/auth/reset-password` - Wachtwoord resetten

### Reserveringen
- `GET /api/reservations` - Eigen reserveringen ophalen
- `POST /api/reservations` - Nieuwe reservering maken
- `PUT /api/reservations/[id]` - Reservering bewerken
- `DELETE /api/reservations/[id]` - Reservering annuleren
- `POST /api/reservations/check-overlaps` - Overlappingen controleren

### Kalender
- `GET /api/calendar/reservations` - Reserveringen voor kalender

### Admin
- `GET /api/admin/dashboard` - Dashboard statistieken
- `GET /api/users` - Alle gebruikers
- `PUT /api/users/[id]` - Gebruiker bewerken
- `GET /api/blocks` - Alle blokkeringen
- `POST /api/blocks` - Blokkering aanmaken
- `GET /api/events` - Alle evenementen
- `POST /api/events` - Evenement aanmaken

### Publiek
- `GET /api/events/public` - Publieke evenementen
- `POST /api/contact` - Contactformulier versturen

## Database Schema

### Modellen
- **User** - Gebruikers met rollen (USER, ORGANIZER, ADMIN)
- **Session** - Sessie management
- **PasswordReset** - Wachtwoord reset tokens
- **Resource** - Beschikbare faciliteiten (bijv. Rijhal)
- **Reservation** - Reserveringen
- **Block** - Blokkeringen door beheerders
- **Event** - Evenementen
- **EventResource** - Koppeltabel event-resource
- **AuditLog** - Audit logging
- **ContactSubmission** - Contactformulier inzendingen

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Bouw voor productie
npm run start        # Start productie server
npm run lint         # Lint code
npx prisma studio    # Open Prisma database browser
npx prisma db seed   # Seed database met testdata
```

## Email Notificaties

In development worden emails gelogd naar de console. Voor productie:

1. Maak een account aan bij [Bird](https://bird.com)
2. Voeg je API key toe aan `.env`:
   ```env
   EMAIL_API_KEY="your-bird-api-key"
   EMAIL_FROM="reserveringenderaam@stijvehark.nl"
   ```
3. Verifieer je sender email domein in Bird Dashboard

Email templates:
- Welkom email bij registratie
- Reservering bevestiging
- Reservering annulering
- Wachtwoord reset link
- Blokkering notificatie

## Beveiliging

- Sterke wachtwoordeisen (12+ tekens, complexiteit)
- CSRF bescherming met HMAC-SHA256 signatures (double-submit cookie pattern)
- Rate limiting op alle endpoints (sliding window algoritme)
- Security headers (X-Frame-Options, X-Content-Type-Options, CSP, etc.)
- Honeypot spam bescherming op contactformulier
- Audit logging van alle belangrijke acties

**CSRF Cookie Namen:**
- Development: `csrf-token-signature` (HTTP-compatible)
- Production: `__Host-csrf-token` (requires HTTPS)

## Licentie

Dit project is eigendom van Stichting Manege de Raam.
