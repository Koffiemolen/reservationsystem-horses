# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production (runs prisma generate first)
npm run start            # Start production server
npm run lint             # Run ESLint

npm run db:push          # Push schema changes to database (dev, no migration file)
npm run db:migrate       # Create and run migrations (use for schema changes)
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio (database GUI)
```

**No test suite exists.** There is no Jest/Vitest configuration and no test files. Do not look for or rely on tests.

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

**Overlap System**: Reservations allow overlaps with warnings, NOT blocking. This is the core booking model. There are two parallel confirmation flows — one for reservations, one for blocks — that follow the same throw-and-parse pattern:

```typescript
// RESERVATION flow (reservation.service.ts):
// 1. Blocks → HARD BLOCK, prevent booking (HTTP 409)
// 2. Overlapping reservations → SOFT WARNING, allow with acknowledgeOverlap flag
if (overlapResult.hasBlock) {
  throw new Error(`TIME_BLOCKED:${JSON.stringify(block)}`)
}
if (overlapResult.hasOverlaps && !data.acknowledgeOverlap) {
  throw new Error(`OVERLAP_EXISTS:${JSON.stringify(overlaps)}`)
  // NOTE: API route returns this as HTTP 200 with warning field, NOT a 4xx error
}

// BLOCK flow (block.service.ts):
// If a new block would affect existing CONFIRMED reservations, warn first
if (conflicts.length > 0 && !confirmConflicts) {
  throw new Error(`CONFLICTS_EXIST:${JSON.stringify(conflicts)}`)
}
// When confirmed, conflicting reservations are set to IMPACTED status
// and affected users receive email notifications
```

When a block is **deleted**, all IMPACTED reservations overlapping that block are automatically restored to CONFIRMED.

**Privacy**: Calendar shows other users' reservations as "Reserved" without names/details. Only show full details for the current user's own reservations.

```typescript
// src/services/reservation.service.ts — getReservationsForCalendar
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
- `/api/*` routes are **excluded from middleware** (matcher skips them). Each API route handler calls `auth()` itself to check the session.

### Time Handling

Store all times as ISO 8601 strings in database. Display in `Europe/Amsterdam` timezone using `date-fns` and `date-fns-tz`.

### Email System

Emails sent via SendGrid service (`src/services/email.service.ts`):
- Reservation confirmation
- Reservation cancellation
- Password reset
- Welcome (on registration)
- Block notification (when a new block impacts existing reservations — sent per affected user, grouping their affected reservations)

**Configuration**:
- Set `SENDGRID_API_KEY` in `.env` for production email sending
- Set `EMAIL_FROM` to specify the sender address (must be verified in SendGrid)
- In development, emails are logged to console if `SENDGRID_API_KEY` is not set or `NODE_ENV !== 'production'`

**Sender Verification**: Before production use, verify the sender email address in SendGrid Dashboard → Settings → Sender Authentication.

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages (home, contact, events, over-ons)
│   ├── (auth)/              # Auth pages (login, register, password reset)
│   ├── (dashboard)/         # User pages (agenda, reserveringen, profiel)
│   ├── (admin)/             # Admin pages (dashboard, gebruikers)
│   └── api/                 # API route handlers — thin controllers only
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── calendar/            # CalendarView, MonthView, WeekView, DayView, ReservationCard, BlockIndicator
│   ├── reservations/        # ReservationForm, OverlapWarning
│   ├── admin/               # Admin components
│   └── layout/              # Header, PublicHeader, Footer
├── hooks/                   # Custom React hooks (useCalendar)
├── lib/                     # Auth config, DB client, Zod validators, utils, constants, CSRF, rate limiting
├── security/                # Security middleware (CSRF validation, rate limiting)
├── services/                # Business logic — all domain logic lives here
│   ├── reservation.service.ts   # Core booking logic & overlap checks
│   ├── block.service.ts         # Admin blocks & IMPACTED reservation handling
│   ├── event.service.ts         # Event CRUD
│   ├── user.service.ts          # User management (disable cascades cancellations)
│   ├── email.service.ts         # All email templates & sending
│   └── audit.service.ts         # Audit log writes & queries
└── types/                   # TypeScript types
```

## Key Technical Details

**Validation**: All input validation uses Zod schemas defined in `src/lib/validators.ts`. Strong password requirements: 12+ chars, uppercase, lowercase, number, symbol.

**Security Headers**: Middleware adds security headers (X-Frame-Options, X-Content-Type-Options, CSP, etc.)

**Honeypot Protection**: Contact form includes honeypot field for spam prevention

### Security Features

**CSRF Protection**: Double-submit cookie pattern with HMAC-SHA256 signatures protects all state-changing operations:
- Cookies injected on GET requests via `src/middleware.ts`
- Two cookies set: `csrf-token` (readable) and signature cookie (HttpOnly, signed)
  - Production: `__Host-csrf-token` (requires HTTPS, more secure)
  - Development: `csrf-token-signature` (HTTP-compatible)
- Client-side: Use `fetchWithCsrf()` from `@/lib/utils` for all POST/PATCH/DELETE requests
- Server-side: All API routes call `validateSecurityMiddleware()` before business logic
- Returns HTTP 403 for missing/invalid tokens

**Rate Limiting**: In-memory sliding window algorithm prevents brute force attacks:
- AUTH_PUBLIC: 5 requests / 15 min (per IP) - registration, password reset
- CONTACT: 3 requests / hour (per IP) - contact form submissions
- USER_MUTATION: 30 requests / min (per user) - reservations, profile updates
- ADMIN_MUTATION: 60 requests / min (per user) - admin operations
- PUBLIC_READ: 100 requests / min (per IP) - calendar, events
- Returns HTTP 429 with `Retry-After` header when exceeded
- Development mode: 100x higher limits for testing

**Implementation Pattern**:
```typescript
// API Route (server-side)
import { validateSecurityMiddleware } from '@/security'

export async function POST(request: Request) {
  // STEP 1: Security validation (CSRF + rate limiting)
  const securityError = await validateSecurityMiddleware(request)
  if (securityError) return securityError

  // STEP 2: Business logic
  const session = await auth()
  const body = await request.json()
  // ... existing code ...
}

// Client Component (client-side)
import { fetchWithCsrf } from '@/lib/utils'

const response = await fetchWithCsrf('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})

// Handle security errors
if (response.status === 403) {
  // CSRF token expired - reload page
}
if (response.status === 429) {
  // Rate limit exceeded - show retry time
}
```

**Configuration**: Set environment variables to disable features for debugging:
```bash
DISABLE_CSRF=true           # Disable CSRF validation
DISABLE_RATE_LIMIT=true     # Disable rate limiting
```

**Status Values**:
- User status: `ACTIVE`, `DISABLED`
- Reservation status: `CONFIRMED`, `CANCELLED`, `IMPACTED`
- Reservation purpose: `TRAINING`, `LESSON`, `OTHER`
- Event visibility: `PUBLIC`, `MEMBERS`, `ADMIN`

**Soft Deletes**: Users and reservations use status fields instead of hard deletes:
- Users: `status = 'DISABLED'` — disabling a user also cancels all their future CONFIRMED reservations in the same transaction
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
