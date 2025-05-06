## Adnovex Platform Overview

Adnovex is a legal consultation platform tailored for India, designed to connect clients with lawyers. It supports OTP-based authentication with a refresh token system to persist logins. Users can hold multiple roles (client and lawyer) but start with only one. The frontend (NestJS) and backend (NestJS + Prisma + PostgreSQL) are clearly separated. Client and lawyer flows are segregated via routing (`/client`, `/lawyer`).

---

## Platform Flow (User + System)

### A. Authentication Flow

- **Entry Points**: Via modals triggered from either `/client` or `/lawyer` route.
- **Steps**:

  1. User selects role (pre-selected based on route).
  2. Inputs phone number → OTP sent.
  3. Inputs OTP → Backend verifies.
  4. If existing user: logs in, frontend redirects accordingly.
  5. If new user:
     - User record is created (phone number, default status).
     - `UserRole` record is created linking the user and the requested role (e.g., CLIENT or LAWYER), marked as active.
     - Minimal profile (`ClientProfile` or `LawyerProfile`) is created, linked to the user, with `registrationPending: true`.
     - Frontend redirects to the role-specific registration flow (simple for client, stepper for lawyer).
  6. **Refresh Token** used to persist login without OTP re-verification.

### B. Role Switching Flow

- Via navbar toggle ("I'm a Lawyer" ↔ "I'm a Client").
- **If user already has the other role**:

  - Frontend redirects to corresponding dashboard.

- **If not**:

  - Frontend calls `POST /auth/add-role` → backend adds new role + creates profile → redirects to role-specific register form.

---

## Client Side UX Flow

### 1. Visiting as Guest:

- Landing Page (`/client`) → CTA: "Find a Lawyer"
- Navigate to `/client/lawyers` → Search + Filters → Click a card → `/client/lawyers/:id`

  - If not signed in: shows profile + CTA to consult → triggers auth flow.

### 2. After Sign In (Client):

- Can save lawyers → `POST /client/save-lawyer`
- Can view saved lawyers → `GET /client/saved-lawyers`
- Can send one-off consultation request → `POST /client/request-consultation`
- Can view their consultations → `GET /client/consultation-requests`

### 3. Client Registration

- After OTP login (new user):

  - Shown simple form modal (name, email, profile pic)
  - Submits to `PUT /client/profile`

---

## Lawyer Side UX Flow

### 1. Visiting `/lawyer` (Guest):

- Landing page CTA: "Join as a Lawyer with Adnovex" → `/lawyer/register`

  - Triggers auth if not logged in
  - Stepper form to submit lawyer profile
  - After each step, frontend calls `PATCH /lawyer/profile`
  - On last step, frontend sets `registrationPending = false`
  - Redirects to dashboard → `/lawyer/dashboard`

### 2. After Sign In (Lawyer):

- Dashboard Tabs (Planned):

  - My Profile (default) → view/edit via `GET /lawyer/profile`, `PATCH /lawyer/profile`
  - Consultation Requests → `GET /lawyer/consultation-requests`

---

## Endpoint Definitions (UX Expectation)

### AUTH & SESSION

- `POST /auth/request-otp`

  - Takes: phone, role
  - Sends OTP to phone

- `POST /auth/verify-otp`

  - Takes: phone, otp, role
  - Verifies OTP
  - Returns: user info + access/refresh tokens

- `POST /auth/add-role`

  - Takes: userId, newRole
  - Adds new role + creates profile

- `GET /me`

  - Protected
  - Returns: user, activeRole, clientProfileId/lawyerProfileId

### CLIENT

- `PUT /client/profile`

  - Updates client profile

- `GET /lawyers`

  - Returns list of lawyers
  - Only returns: `registrationPending = false`

- `GET /lawyers/:id`

  - Returns full lawyer profile

- `POST /client/save-lawyer`

  - Adds lawyer to client's saved list

- `GET /client/saved-lawyers`

  - Returns list of saved lawyers

- `POST /client/request-consultation`

  - Creates one-off consultation request

- `GET /client/consultation-requests`

  - Returns list of consultations by client

### LAWYER

- `PATCH /lawyer/profile`

  - Can be called stepwise or once
  - Updates profile fields
  - Frontend marks `registrationPending = false` on final step

- `GET /lawyer/profile`

  - Returns lawyer profile

- `GET /lawyer/dashboard`

  - Returns profile + consultation requests

- `GET /lawyer/consultation-requests`

  - Returns requests from clients

---

## Advanced (Planned / Deferred)

### FILE UPLOADS

- `POST /upload/profile-pic`

  - Uploads image to Cloudinary → returns URL

- `POST /client/upload-profile-pic`
- `POST /lawyer/upload-profile-pic`

  - Takes image + userId
  - Saves to profile folder with userId as filename
  - Updates DB, returns success

### NOTIFICATIONS

- SMS/Email via Fast2SMS (abstracted layer)

  - On consult request, verification, etc.

---

This document provides the UX-derived platform and endpoint expectations. Next step will focus on backend implementation plans per endpoint.
