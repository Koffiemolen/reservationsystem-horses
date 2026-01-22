# Requirements Specification — Stichting Manege de Raam Reservation System

_Generated: 2026-01-19_
_Updated: 2026-01-19 (Edge Cases Clarified)_
_Based on: FSD v0.1 + Brainstorming Sessions_

---

## 1. Resolved Decisions Summary

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Approval workflow | **Instant confirmation** — no admin approval queue |
| 2 | V1 Resources | **Indoor arena only** (Rijhal binnen) |
| 3 | User identity | **Name + Email + Phone** (phone should have consent) |
| 4 | Pricing logic | **No pricing in system** — handled externally |
| 5 | Public calendar | **Partial** — public sees events only, availability requires login |
| 6 | Cancellation | **Track cancellations only** — users can cancel anytime, no-show tracking deferred to V2 (ML camera) |
| 7 | Overlap model | **Awareness system** — overlaps allowed with warning, not prevented |
| 8 | Time selection | **Free-form** — any minute, no fixed slots |
| 9 | Operating hours | **24/7 booking** — no time restrictions enforced |

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+ (App Router) | SSR for SEO, React ecosystem, TypeScript |
| **Backend** | Next.js API Routes / Server Actions | Unified codebase, serverless-ready |
| **Database** | PostgreSQL | Robust, relational, good for reservations |
| **ORM** | Prisma | Type-safe, migrations, good DX |
| **Auth** | NextAuth.js (Auth.js) | Flexible, supports credentials + OAuth |
| **Email** | Transactional service (Resend/SendGrid) | Reliable delivery, templates, analytics |
| **Hosting** | Vercel / Railway / Self-hosted | TBD based on budget and requirements |
| **Language** | TypeScript | Type safety, better maintainability |

---

## 3. Functional Requirements (V1)

### 3.1 Authentication & Users

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-AUTH-01** | Users can self-register with name, email, phone | Must |
| **REQ-AUTH-02** | Email verification NOT required (open registration) | Must |
| **REQ-AUTH-03** | Password reset via email link | Must |
| **REQ-AUTH-04** | Admin can disable/delete user accounts | Must |
| **REQ-AUTH-05** | Session-based authentication with secure cookies | Must |
| **REQ-AUTH-06** | Phone number stored with GDPR consent checkbox | Should |
| **REQ-AUTH-07** | Strong password: 12+ chars, uppercase, lowercase, number, symbol | Must |
| **REQ-AUTH-08** | Disabling user auto-cancels all their future reservations | Must |

### 3.2 Resources

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-RES-01** | V1 supports single resource: Rijhal (binnen) | Must |
| **REQ-RES-02** | No operating hour restrictions (24/7 booking allowed) | Must |
| **REQ-RES-03** | Free-form time selection (any minute, no fixed slots) | Must |
| **REQ-RES-04** | System architecture supports multiple resources for future | Should |
| **REQ-RES-05** | Admin can manually block holidays/closure days | Must |

### 3.3 Reservations

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-BOOK-01** | Registered users can create reservations | Must |
| **REQ-BOOK-02** | Reservations are instantly confirmed (no approval) | Must |
| **REQ-BOOK-03** | Required fields: date, start time, end time, purpose | Must |
| **REQ-BOOK-04** | Purpose field is a configurable dropdown (training/lesson/other) | Should |
| **REQ-BOOK-05** | Optional notes field for additional information | Should |
| **REQ-BOOK-06** | Overlapping reservations ALLOWED with warning (awareness system) | Must |
| **REQ-BOOK-07** | Users can view their own reservations | Must |
| **REQ-BOOK-08** | Users can cancel their own reservations (no time cutoff) | Must |
| **REQ-BOOK-09** | Users can edit their own reservations (no time cutoff) | Must |
| **REQ-BOOK-10** | Admin can view/edit/cancel any reservation | Must |
| **REQ-BOOK-11** | Cancellation history tracked per user (no-show tracking in V2) | Must |
| **REQ-BOOK-12** | Admin can view user's cancellation history | Should |
| **REQ-BOOK-13** | No booking horizon limit (any future date allowed) | Must |
| **REQ-BOOK-14** | No minimum notice for booking (can book last minute) | Must |
| **REQ-BOOK-15** | Cancelled slots immediately available for others | Must |

### 3.4 Calendar & Availability

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-CAL-01** | Authenticated users see availability calendar | Must |
| **REQ-CAL-02** | Calendar views: month overview, week detail, day detail | Must |
| **REQ-CAL-03** | Own reservations shown with full details | Must |
| **REQ-CAL-04** | Others' reservations shown as "Reserved" (privacy) | Must |
| **REQ-CAL-05** | Public visitors see events calendar only (no availability) | Must |
| **REQ-CAL-06** | Events and blocks clearly distinguished visually | Should |

### 3.5 Events & Blocks

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-EVT-01** | Admin can create events (title, description, datetime, visibility) | Must |
| **REQ-EVT-02** | Events can be: public, members-only, or admin-only | Must |
| **REQ-EVT-03** | Public events visible on public events calendar | Must |
| **REQ-EVT-04** | Admin can create blocks (reason, datetime, affected resource) | Must |
| **REQ-EVT-05** | Blocks prevent new reservations in that timeslot | Must |
| **REQ-EVT-06** | Block over existing reservation: warn admin, require confirmation, notify users | Must |
| **REQ-EVT-07** | Recurring blocks supported (e.g., weekly maintenance) | Should |
| **REQ-EVT-08** | Block reason visible to all users (transparency) | Must |

### 3.6 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-NOTIF-01** | Email sent on reservation created | Must |
| **REQ-NOTIF-02** | Email sent on reservation changed | Must |
| **REQ-NOTIF-03** | Email sent on reservation canceled | Must |
| **REQ-NOTIF-04** | Admin notified of new reservations (configurable) | Should |
| **REQ-NOTIF-05** | Email templates customizable by admin | Could |
| **REQ-NOTIF-06** | ICS calendar attachment in confirmation emails | Could |

### 3.7 Admin Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-ADM-01** | Admin dashboard with upcoming reservations | Must |
| **REQ-ADM-02** | Admin can manage users (view, disable, change role) | Must |
| **REQ-ADM-03** | Admin can manage resource settings | Must |
| **REQ-ADM-04** | Admin can manage events and blocks | Must |
| **REQ-ADM-05** | Audit log of reservation changes | Should |
| **REQ-ADM-06** | Export reservations to CSV | Should |

### 3.8 Public Website (Content)

| ID | Requirement | Priority |
|----|-------------|----------|
| **REQ-CMS-01** | Public pages accessible without login | Must |
| **REQ-CMS-02** | Required pages: Home, About, Contact, Events | Must |
| **REQ-CMS-03** | Contact page with contact form (spam protected) | Must |
| **REQ-CMS-04** | SEO basics: meta tags, OpenGraph, sitemap | Should |
| **REQ-CMS-05** | Mobile-responsive design | Must |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| **NFR-01** | Page load time | < 2 seconds for calendar views |
| **NFR-02** | Mobile usability | Touch-friendly, responsive down to 320px |
| **NFR-03** | Accessibility | WCAG 2.1 AA (practical level) |
| **NFR-04** | Security | OWASP Top 10 compliance |
| **NFR-05** | GDPR | Privacy policy, data minimization, retention policy |
| **NFR-06** | Availability | 99.5% uptime target |
| **NFR-07** | Data integrity | Transaction-safe booking (no race conditions) |
| **NFR-08** | Language | Dutch (primary), English (optional future) |

---

## 5. User Stories

### Visitor (Public)
- **US-V01**: As a visitor, I can view public pages to learn about the facility
- **US-V02**: As a visitor, I can see public events/competitions on a calendar
- **US-V03**: As a visitor, I can submit a contact form inquiry
- **US-V04**: As a visitor, I can register for an account

### Registered User
- **US-U01**: As a user, I can log in with email and password
- **US-U02**: As a user, I can view the availability calendar for the indoor arena
- **US-U03**: As a user, I can create a reservation for an available time slot
- **US-U04**: As a user, I receive email confirmation when I make a booking
- **US-U05**: As a user, I can view my upcoming and past reservations
- **US-U06**: As a user, I can cancel my reservation at any time
- **US-U07**: As a user, I can edit my reservation details
- **US-U08**: As a user, I cannot see other users' personal details on the calendar

### Administrator
- **US-A01**: As an admin, I can view all reservations across all users
- **US-A02**: As an admin, I can cancel or modify any reservation
- **US-A03**: As an admin, I can create blocks to prevent bookings
- **US-A04**: As an admin, I can create public events
- **US-A05**: As an admin, I can manage user accounts
- **US-A06**: As an admin, I can configure resource settings (hours, slot size)
- **US-A07**: As an admin, I can view cancellation/no-show history for users
- **US-A08**: As an admin, I can export reservation data to CSV

---

## 6. Edge Cases & Business Rules

### 6.1 Reservation Edge Cases

| Scenario | Behavior |
|----------|----------|
| User books overlapping time with another user | **Allowed with warning** — system shows existing reservations, user confirms |
| User books for 5 minutes from now | **Allowed** — no minimum booking notice |
| User books 2 years in the future | **Allowed** — no booking horizon limit |
| User selects time 14:37 to 15:52 | **Allowed** — free-form minute selection |
| User cancels 1 minute before start time | **Allowed** — no cancellation cutoff |
| User cancels reservation | Slot immediately available for others |

### 6.2 Block & Event Edge Cases

| Scenario | Behavior |
|----------|----------|
| Admin creates block overlapping existing reservations | Warn admin, show affected reservations, require confirmation |
| Block confirmed with overlapping reservations | Affected users notified via email that their reservation is impacted |
| User views blocked time slot | Shows block reason (e.g., "Maintenance", "Private event") — full transparency |

### 6.3 User Account Edge Cases

| Scenario | Behavior |
|----------|----------|
| Admin disables user account | All future reservations auto-cancelled, user notified |
| Disabled user tries to log in | Access denied with clear message |
| User forgets password | Password reset via email link |
| Password doesn't meet requirements | Clear error message listing requirements |

### 6.4 Time & Calendar Edge Cases

| Scenario | Behavior |
|----------|----------|
| DST transition (clocks change) | Local time preserved — booking at 10:00 stays at 10:00 local time |
| Booking at 3:00 AM | **Allowed** — no operating hour restrictions (24/7) |
| Christmas Day booking | Allowed unless admin has created a block for that day |
| Timezone display | All times shown in Europe/Amsterdam timezone |

### 6.5 Future Features (V2+)

| Feature | Notes |
|---------|-------|
| No-show detection | ML camera at entrance will detect attendance (not in V1) |
| Automated no-show penalties | Depends on camera detection system |
| Capacity limits | May add max concurrent users per resource in future |

---

## 7. Acceptance Criteria (MVP)

The system is considered complete when:

- [ ] Users can register and log in with strong passwords
- [ ] Users can view availability calendar (authenticated)
- [ ] Users can create reservations with free-form time selection
- [ ] Users see warning when booking overlaps with others (but can proceed)
- [ ] Users can cancel their own reservations anytime
- [ ] Email notifications sent for booking lifecycle
- [ ] Admin can create blocks that prevent new bookings
- [ ] Admin warned when block conflicts with existing reservations
- [ ] Admin can create public events visible to visitors
- [ ] Public visitors can see events calendar
- [ ] Mobile-responsive and usable on smartphones
- [ ] Cancellation history tracked per user
- [ ] Disabling user auto-cancels their future reservations

---

## 8. Out of Scope (V1)

The following are explicitly **not included** in V1:

- Online payments / iDEAL integration
- Pricing calculation in booking flow
- Multiple resources (outdoor arena, canteen)
- Email verification during registration
- Membership ID validation
- No-show detection (planned for V2 with ML camera)
- Automated no-show penalties
- Capacity limits per time slot
- Complex recurring reservations (user-side)
- WhatsApp integration (beyond link-out)
- Competition/KNHS enrollment features
- Operating hour restrictions
- Automatic holiday blocking

---

## 9. Open Questions (Lower Priority)

These can be resolved during implementation:

1. **Hosting provider**: Vercel vs Railway vs self-hosted VPS?
2. **Specific transactional email service**: Resend vs SendGrid vs Postmark?
3. **ICS calendar integration**: Priority for V1 or defer?
4. **Audit log retention**: How long to keep logs?
5. **Future resource expansion**: Timeline for adding buitenbak?
6. **ML camera integration**: Technical approach for no-show detection in V2?

---

## 10. Next Steps

1. **Architecture Design**: Use `/sc:design` to create technical architecture
2. **Implementation Planning**: Use `/sc:workflow` to generate phased implementation plan
3. **Development**: Begin with authentication and core booking functionality

---

_Document Status: Ready for Architecture Design Phase_
