### ADVONEX BACKEND IMPLEMENTATION ROADMAP

---

## OVERVIEW

Structured plan to implement all backend functionalities for Advonex legal consultation platform using NestJS, Prisma ORM, and PostgreSQL. Based on the finalized user and tech flows.

---

## STRUCTURE

For each endpoint:

- Purpose
- Access control / Guards
- DTOs
- Prisma models involved
- Services and flow
- Middleware (if needed)
- Additional notes

---

### AUTHENTICATION MODULE

#### 1. POST /auth/request-otp

- Purpose: Initiate login/signup by sending OTP to phone
- Access: Public
- DTO: RequestOtpDto { phone: string; role: 'CLIENT' | 'LAWYER'; }
- Services: OtpService, SmsService
- Flow:
  1. Check if user exists by phone
  2. If exists, allow login flow
  3. If not, create new user with selected role
  4. Generate OTP and store with expiry
  5. Send OTP via SMS provider

#### 2. POST /auth/verify-otp

- Purpose: Verifies OTP, returns tokens
- Access: Public
- DTO: VerifyOtpDto { phone: string; otp: string; role: 'CLIENT' | 'LAWYER'; }
- Services: AuthService, OtpService, TokenService
- Flow:
  1. Match OTP with stored
  2. Issue access + refresh tokens (JWT)
  3. Return user object with role info

#### 3. POST /auth/refresh-token

- Purpose: Return new access token using refresh token
- Access: Public
- DTO: RefreshTokenDto
- Flow:
  1. Validate refresh token
  2. Reissue new access token

#### 4. POST /auth/add-role

- Purpose: Adds client or lawyer role to user
- Access: Protected
- DTO: AddRoleDto { role: 'CLIENT' | 'LAWYER' }
- Services: UserService, ClientProfileService, LawyerProfileService
- Flow:
  1. Create client/lawyer profile if not already present
  2. Return updated user object

#### 5. GET /auth/me

- Purpose: Return current user object with role profile IDs
- Access: Protected
- Guards: JWTAuthGuard

---

### PROFILE MANAGEMENT

#### PATCH /lawyer/profile

- Purpose: Create/update lawyer profile (used in registration + edit)
- Access: Protected (Role = LAWYER)
- DTO: LawyerProfileDto (multi-step capable)
- Prisma: LawyerProfile
- Notes: Frontend marks `registrationPending = false` after last registration step

#### PUT /client/profile

- Purpose: Create/update client profile
- Access: Protected (Role = CLIENT)
- DTO: ClientProfileDto { name, photo }
- Prisma: ClientProfile
- Notes: Frontend marks `registrationPending = false` after registration

#### GET /lawyer/profile

- Purpose: Get current lawyer profile
- Access: Protected (Role = LAWYER)

#### GET /client/profile

- Purpose: Get current client profile
- Access: Protected (Role = CLIENT)

---

### PUBLIC LAWYER BROWSING (CLIENT SIDE)

#### GET /lawyers

- Purpose: List lawyers visible to clients
- Filters: isVerified = true, registrationPending = false
- Public route

#### GET /lawyers/:id

- Purpose: Get full detail of a lawyer
- Public route

---

### CLIENT FEATURES

#### POST /client/save-lawyer

- Purpose: Client saves a lawyer to shortlist
- Access: Protected (CLIENT)
- DTO: SaveLawyerDto { lawyerId: string }

#### GET /client/saved-lawyers

- Purpose: Return all lawyers saved by client
- Access: Protected (CLIENT)

#### POST /client/request-consultation

- Purpose: One-off message sent to lawyer
- Access: Protected (CLIENT)
- DTO: ConsultationRequestDto { lawyerId, message }

#### GET /client/consultation-requests

- Purpose: Return all consultation requests made by client
- Access: Protected (CLIENT)

---

### LAWYER FEATURES

#### GET /lawyer/dashboard

- Purpose: Get self profile + pending consultation requests
- Access: Protected (LAWYER)

#### GET /lawyer/consultation-requests

- Purpose: View incoming client consultation requests
- Access: Protected (LAWYER)

---

### FILE UPLOAD (ADVANCED - END OF PHASE 1)

#### POST /upload/image

- Purpose: Upload general image
- Access: Protected
- DTO: UploadImageDto { file }
- Returns: URL

#### POST /upload/profile-pic/client

- Purpose: Upload client profile pic
- Requires: userId
- Saves URL in DB

#### POST /upload/profile-pic/lawyer

- Purpose: Upload lawyer profile pic
- Requires: userId
- Saves URL in DB

---

### NOTIFICATION SYSTEM (ADVANCED - END OF PHASE 1)

- Triggers for consultation request submission
- SMS or email notification (abstracted service layer)

---

This document acts as the definitive backend scope for MVP 1.
Next: I'll build endpoint-by-endpoint NestJS + Prisma implementation plan from this list.
