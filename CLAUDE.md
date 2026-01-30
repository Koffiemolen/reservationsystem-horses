# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database
```bash
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create and run migrations
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Development
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production (includes Prisma generate)
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Test Accounts (after seeding)
- Admin: `admin@stichtingderaam.nl` / `Admin123!@#`
- User: `test@example.nl` / `Test123!@#`

## Architecture Overview

This is a **Next.js 16 App Router** monolithic application for horse stable reservations. The architecture follows a clear layered approach:

### Key Patterns

**Service Layer Architecture**: Business logic lives in `src/services/` as isolated modules, NOT in API routes. API routes are thin controllers that call service functions.

```typescript
// services/reservation.service.ts - Business logic
export async function createReservation(userId, data) { ... }

// app/api/reservations/route.ts - Thin controller
export async function POST(request) {
  const session = await auth()
  const data = await request.json()
  return await createReservation(session.user.id, data)
}
```

**Route Groups**: The app uses Next.js route groups for logical separation:
- `(public)/` - Public pages (home, contact, events)
- `(auth)/` - Authentication pages (login, register, password reset)
- `(dashboard)/` - User pages (agenda, reservations, profile)
- `(admin)/` - Admin pages (dashboard, user management, blocks, events)

**Database**: SQLite with Prisma ORM. Note: The schema uses STRING enums (not Prisma enums) for SQLite compatibility.

### Critical Business Logic

**Overlap System**: Reservations allow overlaps with warnings, NOT blocking. This is the core booking model.

```typescript
// Two types of time conflicts:
// 1. Blocks (maintenance/closures) - HARD BLOCK, prevent booking
// 2. Overlapping reservations - SOFT WARNING, allow with acknowledgement

if (overlapResult.hasBlock) {
  throw new Error(`TIME_BLOCKED:${JSON.stringify(block)}`)
}
if (overlapResult.hasOverlaps && !data.acknowledgeOverlap) {
  throw new Error(`OVERLAP_EXISTS:${JSON.stringify(overlaps)}`)
}
```

**Privacy**: Calendar shows other users' reservations as "Reserved" without names/details. Only show full details for the current user's own reservations.

```typescript
// src/services/reservation.service.ts:getReservationsForCalendar
return reservations.map((r) => ({
  id: r.id,
  startTime: r.startTime,
  endTime: r.endTime,
  purpose: r.purpose,
  isOwn: r.userId === currentUserId,
  userName: r.userId === currentUserId ? r.user.name : undefined,  // Hidden for others
  notes: r.userId === currentUserId ? r.notes : undefined,        // Hidden for others
}))
```

**Audit Logging**: All CREATE, UPDATE, DELETE, CANCEL actions are logged to AuditLog with JSON changes.

**Authentication**: Uses Auth.js v5 (NextAuth) with credentials provider. JWT session strategy with role-based access control.

### Role-Based Access

Three roles defined: `USER`, `ORGANIZER`, `ADMIN`
- USER: Create/edit/cancel own reservations
- ORGANIZER: Not actively used in V1 (placeholder for future)
- ADMIN: Full system access (user management, blocks, events, all reservations)

Middleware (`src/middleware.ts`) handles route protection:
- `/agenda`, `/profiel`, `/reserveringen` - Require authentication
- `/admin/*` - Require ADMIN role

### Time Handling

Store all times as ISO 8601 strings in database. Display in `Europe/Amsterdam` timezone using `date-fns` and `date-fns-tz`.

### Email System

Emails sent via Resend service (`src/services/email.service.ts`):
- Reservation confirmation
- Reservation cancellation
- Password reset
- Account disabled notification

In development, emails are logged to console if `RESEND_API_KEY` is not set.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages
│   ├── (auth)/              # Auth pages
│   ├── (dashboard)/         # User dashboard
│   ├── (admin)/             # Admin panel
│   ├── api/                 # API routes (thin controllers)
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── calendar/            # Calendar views
│   ├── reservations/        # Reservation forms
│   ├── admin/               # Admin components
│   └── layout/              # Header, Footer
├── lib/                     # Utilities, auth, DB client
│   ├── auth.ts              # Auth.js configuration
│   ├── db.ts                # Prisma client singleton
│   └── validators.ts        # Zod schemas
├── services/                # Business logic (IMPORTANT)
│   ├── reservation.service.ts
│   ├── block.service.ts
│   ├── event.service.ts
│   ├── user.service.ts
│   ├── email.service.ts
│   └── audit.service.ts
└── types/                   # TypeScript types
```

## Key Technical Details

**Validation**: All input validation uses Zod schemas defined in `src/lib/validators.ts`. Strong password requirements: 12+ chars, uppercase, lowercase, number, symbol.

**Security Headers**: Middleware adds security headers (X-Frame-Options, X-Content-Type-Options, CSP, etc.)

**Honeypot Protection**: Contact form includes honeypot field for spam prevention

**Status Values**:
- User status: `ACTIVE`, `DISABLED`
- Reservation status: `CONFIRMED`, `CANCELLED`, `IMPACTED`
- Reservation purpose: `TRAINING`, `LESSON`, `OTHER`
- Event visibility: `PUBLIC`, `MEMBERS`, `ADMIN`

**Soft Deletes**: Users and reservations use status fields instead of hard deletes:
- Users: `status = 'DISABLED'`
- Reservations: `status = 'CANCELLED'` with `cancelledAt` timestamp

## Important Constraints

- V1 supports single resource: "Rijhal binnen" (Indoor Arena)
- 24/7 booking allowed, no time restrictions
- Free-form time selection (any minute, no fixed slots)
- No booking horizon limit
- No minimum notice for booking
- Overlaps are allowed with user acknowledgement
- Cancellations track history but don't restrict future bookings
- All text and messages are in Dutch
