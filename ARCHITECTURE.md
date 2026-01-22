# Technical Architecture Document — Stichting Manege de Raam

_Version: 1.0_
_Date: 2026-01-19_
_Based on: REQUIREMENTS.md v1.0_

---

## 1. System Overview

### 1.1 Architecture Style
**Monolithic Next.js Application** with clear module boundaries, designed for future microservices extraction if needed.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Public     │  │   Member     │  │    Admin     │          │
│  │   Pages      │  │   Dashboard  │  │   Dashboard  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Server Components                       │  │
│  │    (SSR for SEO, Server Actions for mutations)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   API Routes (/api)                       │  │
│  │    (REST endpoints for client-side interactions)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │   Auth     │ │ Reservation│ │   Block    │ │   Email    │   │
│  │  Service   │ │  Service   │ │  Service   │ │  Service   │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │   User     │ │   Event    │ │  Resource  │ │   Audit    │   │
│  │  Service   │ │  Service   │ │  Service   │ │  Service   │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Prisma ORM                             │  │
│  │         (Type-safe queries, migrations, relations)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL                             │  │
│  │              (Primary data store)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌────────────┐                                                 │
│  │   Resend   │  (Transactional email)                         │
│  └────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering Strategy | Server Components + Client Islands | SEO for public pages, interactivity where needed |
| State Management | Server state (DB) + React Query | No complex client state needed |
| API Style | Server Actions + REST API routes | Server Actions for forms, REST for calendar data |
| Authentication | Auth.js (NextAuth v5) | Credentials provider, session-based |
| Database Access | Prisma ORM | Type safety, migrations, good DX |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design system |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │    Resource     │       │  Reservation    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email (unique)  │       │ name            │       │ userId (FK)     │──┐
│ passwordHash    │       │ description     │       │ resourceId (FK) │──┼─┐
│ name            │       │ isActive        │       │ startTime       │  │ │
│ phone           │       │ createdAt       │       │ endTime         │  │ │
│ phoneConsent    │       │ updatedAt       │       │ purpose         │  │ │
│ role            │       └─────────────────┘       │ notes           │  │ │
│ status          │               │                 │ status          │  │ │
│ createdAt       │               │                 │ createdAt       │  │ │
│ updatedAt       │               │                 │ updatedAt       │  │ │
└─────────────────┘               │                 │ cancelledAt     │  │ │
        │                         │                 │ cancelReason    │  │ │
        │                         │                 └─────────────────┘  │ │
        │                         │                         │            │ │
        │                         ▼                         │            │ │
        │                 ┌─────────────────┐               │            │ │
        │                 │     Block       │               │            │ │
        │                 ├─────────────────┤               │            │ │
        │                 │ id (PK)         │               │            │ │
        │                 │ resourceId (FK) │◄──────────────┼────────────┘ │
        │                 │ reason          │               │              │
        │                 │ startTime       │               │              │
        │                 │ endTime         │               │              │
        │                 │ isRecurring     │               │              │
        │                 │ recurrenceRule  │               │              │
        │                 │ createdById(FK) │◄──────────────┼──────────────┤
        │                 │ createdAt       │               │              │
        │                 └─────────────────┘               │              │
        │                                                   │              │
        │                 ┌─────────────────┐               │              │
        │                 │     Event       │               │              │
        │                 ├─────────────────┤               │              │
        │                 │ id (PK)         │               │              │
        │                 │ title           │               │              │
        │                 │ description     │               │              │
        │                 │ startTime       │               │              │
        │                 │ endTime         │               │              │
        │                 │ visibility      │               │              │
        │                 │ createdById(FK) │◄──────────────┘              │
        │                 │ createdAt       │                              │
        │                 │ updatedAt       │                              │
        │                 └─────────────────┘                              │
        │                         │                                        │
        │                         ▼                                        │
        │                 ┌─────────────────┐                              │
        │                 │  EventResource  │                              │
        │                 ├─────────────────┤                              │
        │                 │ eventId (FK)    │                              │
        │                 │ resourceId (FK) │◄─────────────────────────────┘
        │                 └─────────────────┘
        │
        │                 ┌─────────────────┐
        │                 │    AuditLog     │
        │                 ├─────────────────┤
        └────────────────►│ id (PK)         │
                          │ userId (FK)     │
                          │ action          │
                          │ entityType      │
                          │ entityId        │
                          │ changes (JSON)  │
                          │ createdAt       │
                          └─────────────────┘
```

### 2.2 Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================

enum UserRole {
  USER
  ORGANIZER
  ADMIN
}

enum UserStatus {
  ACTIVE
  DISABLED
}

enum ReservationStatus {
  CONFIRMED
  CANCELLED
  IMPACTED  // Affected by a block
}

enum ReservationPurpose {
  TRAINING
  LESSON
  OTHER
}

enum EventVisibility {
  PUBLIC
  MEMBERS
  ADMIN
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  CANCEL
  DISABLE
}

// ============================================================================
// MODELS
// ============================================================================

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String
  name          String
  phone         String?
  phoneConsent  Boolean    @default(false)
  role          UserRole   @default(USER)
  status        UserStatus @default(ACTIVE)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  // Relations
  reservations  Reservation[]
  createdBlocks Block[]       @relation("BlockCreatedBy")
  createdEvents Event[]       @relation("EventCreatedBy")
  auditLogs     AuditLog[]

  // Sessions (for Auth.js)
  sessions      Session[]

  @@index([email])
  @@index([status])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model Resource {
  id          String   @id @default(cuid())
  name        String
  description String?
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  reservations Reservation[]
  blocks       Block[]
  events       EventResource[]
}

model Reservation {
  id           String              @id @default(cuid())
  userId       String
  resourceId   String
  startTime    DateTime
  endTime      DateTime
  purpose      ReservationPurpose
  notes        String?
  status       ReservationStatus   @default(CONFIRMED)

  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
  cancelledAt  DateTime?
  cancelReason String?

  // Relations
  user         User                @relation(fields: [userId], references: [id])
  resource     Resource            @relation(fields: [resourceId], references: [id])

  // Indexes for calendar queries
  @@index([resourceId, startTime, endTime])
  @@index([userId, startTime])
  @@index([status])
}

model Block {
  id             String    @id @default(cuid())
  resourceId     String
  reason         String
  startTime      DateTime
  endTime        DateTime
  isRecurring    Boolean   @default(false)
  recurrenceRule String?   // RRULE format for recurring blocks

  createdById    String
  createdAt      DateTime  @default(now())

  // Relations
  resource       Resource  @relation(fields: [resourceId], references: [id])
  createdBy      User      @relation("BlockCreatedBy", fields: [createdById], references: [id])

  @@index([resourceId, startTime, endTime])
}

model Event {
  id          String           @id @default(cuid())
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  visibility  EventVisibility  @default(PUBLIC)

  createdById String
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  // Relations
  createdBy   User             @relation("EventCreatedBy", fields: [createdById], references: [id])
  resources   EventResource[]

  @@index([startTime, endTime])
  @@index([visibility])
}

model EventResource {
  eventId    String
  resourceId String

  event      Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  resource   Resource @relation(fields: [resourceId], references: [id])

  @@id([eventId, resourceId])
}

model AuditLog {
  id         String      @id @default(cuid())
  userId     String?
  action     AuditAction
  entityType String
  entityId   String
  changes    Json?

  createdAt  DateTime    @default(now())

  // Relations
  user       User?       @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])
  @@index([createdAt])
}

model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  message   String
  createdAt DateTime @default(now())
  isRead    Boolean  @default(false)

  @@index([createdAt])
}
```

### 2.3 Key Database Considerations

| Aspect | Implementation |
|--------|----------------|
| **Timezone** | Store all times as UTC in DB, convert to Europe/Amsterdam in app layer |
| **Overlap Detection** | Query-based overlap check using range operators |
| **Recurring Blocks** | RRULE string stored, expanded at query time |
| **Soft Delete** | `status = CANCELLED` for reservations, `status = DISABLED` for users |
| **Audit Trail** | JSON diff stored in `changes` column |

---

## 3. API Specification

### 3.1 API Routes Overview

```
/api
├── /auth
│   ├── POST /register          # Create new user account
│   ├── POST /login             # Authenticate user (handled by Auth.js)
│   ├── POST /logout            # End session
│   └── POST /reset-password    # Password reset flow
│
├── /reservations
│   ├── GET    /                # List reservations (filtered)
│   ├── POST   /                # Create reservation
│   ├── GET    /:id             # Get single reservation
│   ├── PATCH  /:id             # Update reservation
│   ├── DELETE /:id             # Cancel reservation
│   └── GET    /check-overlaps  # Check for overlapping reservations
│
├── /calendar
│   ├── GET /reservations       # Get calendar data (month/week/day)
│   ├── GET /events             # Get events (public or filtered)
│   └── GET /blocks             # Get blocks (admin only full details)
│
├── /blocks
│   ├── GET    /                # List blocks (admin)
│   ├── POST   /                # Create block (admin)
│   ├── PATCH  /:id             # Update block (admin)
│   └── DELETE /:id             # Delete block (admin)
│
├── /events
│   ├── GET    /                # List events
│   ├── POST   /                # Create event (admin)
│   ├── PATCH  /:id             # Update event (admin)
│   └── DELETE /:id             # Delete event (admin)
│
├── /users (admin only)
│   ├── GET    /                # List users
│   ├── GET    /:id             # Get user details
│   ├── PATCH  /:id             # Update user (role, status)
│   ├── GET    /:id/history     # Get user's cancellation history
│   └── POST   /:id/disable     # Disable user + cancel reservations
│
├── /admin
│   ├── GET /dashboard          # Dashboard stats
│   ├── GET /audit-log          # Audit log entries
│   └── GET /export             # CSV export
│
└── /contact
    └── POST /                  # Submit contact form
```

### 3.2 Key Endpoint Specifications

#### Create Reservation
```typescript
POST /api/reservations

Request:
{
  "resourceId": "string",
  "startTime": "2026-01-20T14:37:00+01:00",  // ISO 8601 with timezone
  "endTime": "2026-01-20T15:52:00+01:00",
  "purpose": "TRAINING" | "LESSON" | "OTHER",
  "notes": "string?",
  "acknowledgeOverlap": boolean  // Required if overlaps exist
}

Response (201 Created):
{
  "id": "string",
  "userId": "string",
  "resourceId": "string",
  "startTime": "2026-01-20T14:37:00+01:00",
  "endTime": "2026-01-20T15:52:00+01:00",
  "purpose": "TRAINING",
  "status": "CONFIRMED",
  "createdAt": "2026-01-20T12:00:00Z"
}

Response (409 Conflict - Block exists):
{
  "error": "TIME_BLOCKED",
  "message": "This time slot is blocked",
  "block": {
    "reason": "Maintenance",
    "startTime": "...",
    "endTime": "..."
  }
}

Response (200 OK - Overlap warning):
{
  "warning": "OVERLAP_EXISTS",
  "message": "There are existing reservations at this time",
  "overlaps": [
    {
      "startTime": "...",
      "endTime": "...",
      "purpose": "TRAINING"
      // No user details for privacy
    }
  ],
  "requiresAcknowledge": true
}
```

#### Check Overlaps
```typescript
GET /api/reservations/check-overlaps?resourceId=x&start=ISO&end=ISO

Response:
{
  "hasOverlaps": boolean,
  "hasBlock": boolean,
  "overlappingReservations": [
    {
      "startTime": "...",
      "endTime": "...",
      "purpose": "TRAINING"
    }
  ],
  "block": {
    "reason": "...",
    "startTime": "...",
    "endTime": "..."
  } | null
}
```

#### Get Calendar Data
```typescript
GET /api/calendar/reservations?resourceId=x&start=ISO&end=ISO&view=month|week|day

Response:
{
  "reservations": [
    {
      "id": "string",
      "startTime": "...",
      "endTime": "...",
      "purpose": "TRAINING",
      "isOwn": true,           // If current user's reservation
      "userName": "John Doe",  // Only if isOwn=true
      "notes": "..."           // Only if isOwn=true
    }
  ],
  "blocks": [
    {
      "id": "string",
      "reason": "Maintenance",
      "startTime": "...",
      "endTime": "..."
    }
  ]
}
```

### 3.3 Authentication Flow

```typescript
// Auth.js configuration (auth.config.ts)
{
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      authorize: async (credentials) => {
        // 1. Find user by email
        // 2. Verify password with bcrypt
        // 3. Check user status is ACTIVE
        // 4. Return user object or null
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      // Add role and userId to session
      session.user.id = token.sub
      session.user.role = token.role
      return session
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}
```

---

## 4. Component Architecture

### 4.1 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes group
│   │   ├── page.tsx              # Home page
│   │   ├── over-ons/             # About page
│   │   ├── contact/              # Contact page
│   │   ├── evenementen/          # Public events calendar
│   │   └── layout.tsx            # Public layout (header/footer)
│   │
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── wachtwoord-vergeten/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── agenda/               # Calendar/booking
│   │   │   ├── page.tsx          # Main calendar view
│   │   │   └── [date]/page.tsx   # Day detail view
│   │   ├── reserveringen/        # My reservations
│   │   │   ├── page.tsx          # List view
│   │   │   ├── nieuw/page.tsx    # New reservation
│   │   │   └── [id]/page.tsx     # Edit reservation
│   │   ├── profiel/page.tsx      # User profile
│   │   └── layout.tsx            # Dashboard layout
│   │
│   ├── (admin)/                  # Admin routes
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── gebruikers/       # User management
│   │   │   ├── reserveringen/    # All reservations
│   │   │   ├── blokkades/        # Block management
│   │   │   ├── evenementen/      # Event management
│   │   │   ├── instellingen/     # Settings
│   │   │   └── export/           # CSV export
│   │   └── layout.tsx            # Admin layout
│   │
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── reservations/
│   │   ├── calendar/
│   │   ├── blocks/
│   │   ├── events/
│   │   ├── users/
│   │   ├── admin/
│   │   └── contact/
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── ...
│   │
│   ├── calendar/                 # Calendar components
│   │   ├── CalendarView.tsx      # Main calendar container
│   │   ├── MonthView.tsx
│   │   ├── WeekView.tsx
│   │   ├── DayView.tsx
│   │   ├── TimeSlot.tsx
│   │   ├── ReservationCard.tsx
│   │   └── BlockIndicator.tsx
│   │
│   ├── reservations/
│   │   ├── ReservationForm.tsx
│   │   ├── ReservationList.tsx
│   │   ├── OverlapWarning.tsx
│   │   └── CancelDialog.tsx
│   │
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── BlockForm.tsx
│   │   ├── EventForm.tsx
│   │   └── DashboardStats.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Sidebar.tsx
│       └── MobileNav.tsx
│
├── lib/
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # Auth.js config
│   ├── email.ts                  # Email service
│   ├── validators.ts             # Zod schemas
│   └── utils.ts                  # Utility functions
│
├── services/                     # Business logic
│   ├── reservation.service.ts
│   ├── block.service.ts
│   ├── event.service.ts
│   ├── user.service.ts
│   ├── email.service.ts
│   └── audit.service.ts
│
├── hooks/                        # Custom React hooks
│   ├── useCalendar.ts
│   ├── useReservations.ts
│   └── useOverlapCheck.ts
│
└── types/                        # TypeScript types
    ├── api.ts
    ├── calendar.ts
    └── index.ts
```

### 4.2 Key Component Specifications

#### CalendarView Component
```typescript
// components/calendar/CalendarView.tsx

interface CalendarViewProps {
  resourceId: string;
  initialView: 'month' | 'week' | 'day';
  initialDate?: Date;
}

// Features:
// - View switching (month/week/day)
// - Click on time to start reservation
// - Visual distinction: own reservations, others', blocks, events
// - Responsive: stack to day view on mobile
// - Real-time overlap checking when creating
```

#### ReservationForm Component
```typescript
// components/reservations/ReservationForm.tsx

interface ReservationFormProps {
  resourceId: string;
  initialDate?: Date;
  initialStartTime?: Date;
  existingReservation?: Reservation;  // For editing
  onSuccess: () => void;
}

// Features:
// - Date picker
// - Free-form time selection (any minute)
// - Purpose dropdown
// - Notes textarea
// - Real-time overlap checking with warning display
// - Acknowledge checkbox for overlaps
// - Block time validation (prevent if blocked)
```

#### OverlapWarning Component
```typescript
// components/reservations/OverlapWarning.tsx

interface OverlapWarningProps {
  overlaps: {
    startTime: Date;
    endTime: Date;
    purpose: string;
  }[];
  onAcknowledge: (acknowledged: boolean) => void;
}

// Shows: "Er zijn al X reserveringen in deze periode"
// Lists times (no user info for privacy)
// Checkbox: "Ik begrijp dit en wil toch doorgaan"
```

---

## 5. Security Architecture

### 5.1 Authentication & Authorization

| Layer | Implementation |
|-------|----------------|
| **Password Storage** | bcrypt with cost factor 12 |
| **Session Management** | Auth.js with secure, httpOnly cookies |
| **CSRF Protection** | Built-in with Auth.js |
| **Route Protection** | Middleware + Server Component checks |

### 5.2 Authorization Matrix

```typescript
// middleware.ts - Route protection

const publicRoutes = ['/', '/over-ons', '/contact', '/evenementen', '/login', '/register'];
const authRoutes = ['/agenda', '/reserveringen', '/profiel'];
const adminRoutes = ['/admin'];

// Middleware checks:
// 1. Public routes: allow all
// 2. Auth routes: require authenticated user with status=ACTIVE
// 3. Admin routes: require role=ADMIN
```

### 5.3 Input Validation

```typescript
// lib/validators.ts (Zod schemas)

export const reservationSchema = z.object({
  resourceId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  purpose: z.enum(['TRAINING', 'LESSON', 'OTHER']),
  notes: z.string().max(500).optional(),
  acknowledgeOverlap: z.boolean().optional()
}).refine(data => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time"
});

export const passwordSchema = z.string()
  .min(12, "Minimum 12 characters")
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain symbol");
```

### 5.4 Security Headers

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];
```

---

## 6. Email Service Architecture

### 6.1 Email Templates

| Template | Trigger | Variables |
|----------|---------|-----------|
| `reservation-confirmed` | New reservation created | userName, date, time, resource, purpose |
| `reservation-updated` | Reservation modified | userName, oldDate, newDate, changes |
| `reservation-cancelled` | Reservation cancelled | userName, date, time, resource |
| `reservation-impacted` | Block affects reservation | userName, date, time, blockReason |
| `password-reset` | Reset requested | userName, resetLink |
| `account-disabled` | Admin disables account | userName, reason |

### 6.2 Email Service Implementation

```typescript
// services/email.service.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReservationConfirmation(
  to: string,
  reservation: {
    userName: string;
    resourceName: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
  }
) {
  const formattedDate = formatDate(reservation.startTime, 'Europe/Amsterdam');
  const formattedTime = `${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}`;

  await resend.emails.send({
    from: 'Manege de Raam <reserveringen@stichtingderaam.nl>',
    to,
    subject: `Reservering bevestigd: ${formattedDate}`,
    react: ReservationConfirmedEmail({
      ...reservation,
      formattedDate,
      formattedTime
    })
  });
}
```

---

## 7. Deployment Architecture

### 7.1 Recommended: Vercel + Neon PostgreSQL

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    Edge Network                        │ │
│  │            (Global CDN, static assets)                │ │
│  └───────────────────────────────────────────────────────┘ │
│                           │                                 │
│                           ▼                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                 Serverless Functions                   │ │
│  │          (Next.js App, API Routes)                    │ │
│  │               Region: eu-west-1                        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEON PostgreSQL                          │
│                  (Serverless Postgres)                      │
│                   Region: eu-central-1                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       RESEND                                │
│               (Transactional Email)                         │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Auth.js
NEXTAUTH_URL="https://stichtingderaam.nl"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="reserveringen@stichtingderaam.nl"

# App
NEXT_PUBLIC_SITE_URL="https://stichtingderaam.nl"
TIMEZONE="Europe/Amsterdam"
```

---

## 8. Performance Considerations

### 8.1 Database Indexes

Already defined in Prisma schema:
- `Reservation(resourceId, startTime, endTime)` — Calendar queries
- `Reservation(userId, startTime)` — User's reservations
- `Block(resourceId, startTime, endTime)` — Block overlap checks
- `Event(startTime, endTime)` — Event calendar queries

### 8.2 Caching Strategy

| Data | Cache Strategy | TTL |
|------|----------------|-----|
| Public pages | ISR (Incremental Static Regeneration) | 60s |
| Public events | ISR | 60s |
| Calendar data | No cache (real-time) | — |
| User session | Auth.js default | 30 days |

### 8.3 Calendar Query Optimization

```typescript
// Efficient range query for calendar
const reservations = await prisma.reservation.findMany({
  where: {
    resourceId,
    status: { not: 'CANCELLED' },
    OR: [
      // Reservation starts in range
      { startTime: { gte: rangeStart, lte: rangeEnd } },
      // Reservation ends in range
      { endTime: { gte: rangeStart, lte: rangeEnd } },
      // Reservation spans entire range
      { startTime: { lte: rangeStart }, endTime: { gte: rangeEnd } }
    ]
  },
  orderBy: { startTime: 'asc' }
});
```

---

## 9. Future Extensibility (V2+)

### 9.1 Multi-Resource Support
- `resourceId` already in all relevant tables
- UI will need resource selector

### 9.2 ML Camera Integration (No-Show Detection)
```typescript
// Future webhook endpoint
POST /api/webhooks/attendance
{
  "timestamp": "ISO8601",
  "personDetected": true,
  "confidence": 0.95
}

// Will update reservation status based on time matching
```

### 9.3 Capacity Limits
```typescript
// Future Resource model addition
model Resource {
  // ... existing fields
  maxConcurrent  Int?  // null = unlimited
}

// Booking logic update:
// Count overlapping confirmed reservations
// Reject if count >= maxConcurrent
```

---

## 10. Summary

| Aspect | Decision |
|--------|----------|
| **Architecture** | Monolithic Next.js with service layer |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | Auth.js with credentials provider |
| **API Style** | Server Actions + REST endpoints |
| **Email** | Resend transactional service |
| **Hosting** | Vercel (recommended) |
| **Overlap Handling** | Warning-based awareness system |
| **Time Handling** | UTC storage, Europe/Amsterdam display |

---

_Document Status: Ready for Implementation_

**Next Step**: Use `/sc:workflow` to generate phased implementation plan.
