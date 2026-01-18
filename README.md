# Functional Specification Document (FSD) — Stichting Manege de Raam (stichtingderaam.nl)
_Date: 2026-01-18_  
_Version: 0.1 (draft)_

## 1. Context and problem statement
The current website runs on WordPress and operational planning happens outside the site via a WhatsApp group + a shared Google document. This creates:
- No single source of truth for availability and reservations
- Manual conflict handling (“who booked first?”)
- Admin effort to block days for events/competitions and communicate changes
- Limited audit trail and inconsistent reservation data

## 2. Goals and success criteria
### 2.1 Goals
- Provide one website that combines:
  1) public-facing content (current website content)
  2) an online planning/reservation system for facility usage
  3) admin tooling to create events and block days/time slots

### 2.2 Success criteria (measurable)
- Reservations are created/updated in the website (not WhatsApp/Google Doc)
- Availability is always visible in a calendar view
- Double-bookings are prevented by the system
- Admin can block days/slots and create events without manual coordination
- Reservation confirmations and changes trigger automated notifications

## 3. Stakeholders and user roles
### 3.1 Stakeholders
- Board / administrators (beheer)
- Volunteers / event organizers
- Users who rent/use the arena/facilities
- Visitors seeking information (public)

### 3.2 Roles (RBAC)
1. **Visitor (public)**
   - View public pages and read-only calendars (optional)
2. **Registered User (renter/member)**
   - Create, view, edit, cancel own reservations (within rules)
3. **Organizer**
   - Create draft events (optional approval)
   - Manage event-specific reservations (optional)
4. **Administrator**
   - Full control of reservations, events, blocks, users, settings, tariffs
   - Approve/deny reservations if approval workflow is enabled

## 4. Scope
### 4.1 In scope
- Public website pages (migrated from WordPress): about, facilities, rental info, tariffs, news, contact, rules, disclaimer, etc.
- Reservation system:
  - Calendar availability
  - Create/modify/cancel reservations
  - Admin blocks and events
  - Notifications (email; optional WhatsApp link-out)
- Admin dashboard for:
  - Users, reservations, resources, pricing/tariffs
  - Event creation and blocking rules

### 4.2 Out of scope (initial release, unless explicitly added)
- Online payments / iDEAL integration
- Full accounting/invoicing
- Complex membership management (subscriptions)
- KNHS-specific competition enrollment (unless required)

## 5. Assumptions and constraints
- Website language: Dutch (primary).
- GDPR applies (personal data handling, consent, retention).
- Mobile-first usability required.
- Existing WordPress content must be preserved or improved for SEO (URLs/redirects).

## 6. High-level system overview
### 6.1 Main modules
1. **CMS / Content**
   - Pages, news posts, media
2. **Reservations**
   - Resources (e.g., indoor arena, outdoor arena, canteen/meeting space)
   - Time slots, conflicts, cancellations
3. **Events**
   - Public/private events on calendar
   - Blocks (hard blocks prevent booking)
4. **Admin**
   - RBAC, configuration, reporting
5. **Notifications**
   - Email notifications (MVP)
   - Optional ICS calendar invites

### 6.2 Primary user journeys
- Visitor → read info → view calendar (optional) → request account / contact
- Registered user → login → view availability → create reservation → receive confirmation
- Admin → create event → block resources/time → reservations automatically constrained

## 7. Functional requirements
### 7.1 Public website (content)
**FR-CONT-01** Public pages must be accessible without login.  
**FR-CONT-02** News posts must support date, category, featured image.  
**FR-CONT-03** Contact page must include contact details and a contact form (spam-protected).  
**FR-CONT-04** SEO basics: titles, meta descriptions, OpenGraph, sitemap.

### 7.2 Authentication and accounts
**FR-AUTH-01** Users can register (or be invited by admin).  
**FR-AUTH-02** Email verification required for self-registration.  
**FR-AUTH-03** Password reset flow.  
**FR-AUTH-04** Admin can disable accounts.

### 7.3 Resources (what can be booked)
**FR-RES-01** Admin can define one or more bookable resources, e.g.:
- Rijhal (binnen)
- Buitenbak
- Kantine/ruimte (optional)
**FR-RES-02** Each resource has:
- Name, description
- Bookable hours (weekly schedule)
- Slot granularity (e.g., 30/60 minutes)
- Buffer time (optional) between bookings
- Capacity rules (optional: allow multiple simultaneous riders)

### 7.4 Availability and calendar
**FR-CAL-01** System shows availability per resource in calendar views:
- Month (overview)
- Week (planning)
- Day (detailed slots)
**FR-CAL-02** Users see:
- Own reservations with details
- Other users’ reservations as “Reserved” (privacy-safe) unless admin
**FR-CAL-03** Events and blocks are visible (with configurable visibility).

### 7.5 Create reservation
**FR-BOOK-01** Registered users can create a reservation for a resource and time slot.  
**FR-BOOK-02** Required fields:
- Resource
- Date
- Start time, end time (or duration)
- Purpose/type (training / lesson / other) (configurable list)
- Notes (optional)
**FR-BOOK-03** Conflict prevention:
- System must prevent overlapping reservations on same resource (unless capacity rules allow).
**FR-BOOK-04** Reservation status:
- Confirmed (default) OR Pending (if approval workflow enabled)
**FR-BOOK-05** Confirmation notification is sent.

### 7.6 Modify/cancel reservation
**FR-BOOK-06** Users can edit/cancel their own reservations up to a configurable cutoff (e.g., 24h).  
**FR-BOOK-07** Admin can edit/cancel any reservation.  
**FR-BOOK-08** Changes trigger notifications to user and optionally admins.

### 7.7 Events and blocks
**Definitions**
- **Event**: a scheduled item that may be public-facing (e.g., wedstrijd) and may block resources.
- **Block**: a hard constraint preventing reservations (maintenance, private rental, closed days).

**FR-EVT-01** Admin can create events with:
- Title, description
- Start/end datetime
- Affected resources (one or many)
- Visibility: public / members-only / admin-only
**FR-EVT-02** Admin can create blocks with:
- Reason
- Start/end datetime
- Affected resources
- Visibility level
**FR-EVT-03** When an event or block overlaps existing reservations:
- System must prevent creation unless admin explicitly resolves:
  - Option A: reject creation
  - Option B: create and mark conflicting reservations as “Needs action”
  - Option C: create and auto-cancel conflicting reservations (not recommended by default)
**FR-EVT-04** Recurring blocks supported (e.g., every Wednesday 13:00–14:00 maintenance).

### 7.8 Admin dashboard
**FR-ADM-01** Admin overview includes:
- Upcoming reservations
- Conflicts / “Needs action”
- Quick create event/block
**FR-ADM-02** Admin can manage:
- Users + roles
- Resources and schedules
- Tariffs/pricing text (even if no online payments)
- Notification templates (basic)
**FR-ADM-03** Audit log:
- Create/update/cancel reservation
- Create/update event/block
- Role changes

### 7.9 Notifications
**FR-NOTIF-01** Email notifications for:
- Reservation created
- Reservation changed
- Reservation canceled
- Reservation approved/denied (if approvals enabled)
**FR-NOTIF-02** Admin notifications (configurable):
- New reservation
- Conflicts created by blocks/events
**FR-NOTIF-03** Optional: ICS calendar invite attached.

### 7.10 Reporting (MVP-light)
**FR-REP-01** Admin can export reservations to CSV for a date range.  
**FR-REP-02** Basic usage stats per resource (count + total hours).

## 8. Business rules
- **BR-01 Slot granularity**: default 60 minutes (configurable).
- **BR-02 Opening hours**: per resource, per weekday.
- **BR-03 Cutoff times**: editing/canceling allowed until configured threshold.
- **BR-04 Max booking length**: configurable (e.g., max 2 hours).
- **BR-05 Max future booking window**: configurable (e.g., up to 60 days ahead).
- **BR-06 Privacy**: non-admin users never see other users’ names/details.

## 9. Data model (conceptual)
### 9.1 Entities
- **User**
  - id, name, email, phone (optional), role, status, created_at
- **Resource**
  - id, name, description, slot_size_minutes, buffer_minutes, capacity_mode
- **ResourceSchedule**
  - resource_id, weekday, start_time, end_time
- **Reservation**
  - id, user_id, resource_id, start_dt, end_dt, status, type, notes, created_at, updated_at
- **Event**
  - id, title, description, start_dt, end_dt, visibility, created_by
- **EventResource**
  - event_id, resource_id (many-to-many)
- **Block**
  - id, reason, start_dt, end_dt, visibility, created_by
- **BlockResource**
  - block_id, resource_id
- **AuditLog**
  - id, actor_user_id, action, entity_type, entity_id, diff, created_at

### 9.2 Key constraints
- No overlapping reservations on same resource when capacity_mode = exclusive.
- Blocks always override user reservations unless admin chooses resolution.

## 10. Permissions matrix (summary)
| Action | Visitor | User | Organizer | Admin |
|---|---:|---:|---:|---:|
| View public pages | ✅ | ✅ | ✅ | ✅ |
| View availability calendar | (opt) ✅ | ✅ | ✅ | ✅ |
| Create reservation | ❌ | ✅ | ✅ | ✅ |
| Edit/cancel own reservation | ❌ | ✅ | ✅ | ✅ |
| Edit/cancel others’ reservations | ❌ | ❌ | ❌ | ✅ |
| Create event/block | ❌ | ❌ | ✅ (limited) | ✅ |
| Manage users/resources/settings | ❌ | ❌ | ❌ | ✅ |
| Export/reporting | ❌ | ❌ | ❌ | ✅ |

## 11. UX requirements (screens/pages)
### 11.1 Public
- Home
- Over ons / stichting
- Service & verhuur (resources + tariffs)
- Wedstrijden (calendar/events)
- Nieuws
- Contact (+ form)
- Rules/Disclaimer pages

### 11.2 Authenticated
- Dashboard (next bookings + quick actions)
- Calendar (resource selector + month/week/day)
- Create reservation flow (modal or dedicated page)
- My reservations (list + filters)

### 11.3 Admin
- Admin dashboard
- Resources management
- Reservations management (filters by date/resource/status)
- Events/blocks management
- Users/roles management
- Exports + audit log

## 12. Non-functional requirements
- **NFR-01 Security**: OWASP basics, rate limiting, secure session management.
- **NFR-02 GDPR**: privacy policy, data minimization, retention policy, delete/deactivate users, consent for media/forms.
- **NFR-03 Performance**: calendar loads under 2s for typical month view.
- **NFR-04 Reliability**: conflict-safe booking (transaction/locking).
- **NFR-05 Responsiveness**: usable on mobile for booking.
- **NFR-06 Accessibility**: WCAG AA target (practical level).

## 13. Integrations
- Email provider (SMTP or transactional email service)
- Optional:
  - Google Calendar export (ICS feed per resource)
  - Admin-only webhook/notification to WhatsApp (usually link-out, not true WhatsApp automation)

## 14. Migration and cutover
### 14.1 Content migration
- Export WordPress pages/posts/media.
- Maintain URLs where possible; otherwise add 301 redirects.

### 14.2 Operational migration
- Freeze date: stop using Google Doc.
- Import existing forward-looking reservations from the Google Doc (manual CSV import tool optional).

## 15. Open decisions (track and close before implementation)
1. Do reservations require admin approval or are they instantly confirmed?
2. Do you need multiple resources (binnen/buiten/kantine) in V1?
3. Required user identity: name + email only, or also phone and membership validation?
4. Do you need pricing logic or just informational tariffs?
5. Visibility: should public visitors see an availability calendar at all?
6. Cancellation rules: strict cutoff, and are no-shows tracked?

## 16. Acceptance criteria (MVP)
- Users can register/login and book a time slot without double-booking.
- Admin can create blocks/events that prevent new bookings.
- Users can see their bookings and cancel within configured rules.
- Email notifications work for create/change/cancel.
- Public content pages exist and are editable in the new system.

