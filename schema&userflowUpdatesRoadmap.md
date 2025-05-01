# Schema Analysis, User Flow, and Implementation Roadmap

This document outlines the structure defined by the `prisma/schema.prisma` file, the expected user and technical flow of the application, and a roadmap for implementing the necessary features in the application codebase.

## 1. Schema Details and Analysis

This section breaks down the current Prisma schema, explaining the purpose of each model and highlighting key relationships and constraints. It also lists tasks that need explicit handling within the application's code logic.

### 1.1. Core Models

- **`User`**:
  - **Purpose**: Represents the core authenticated entity. Stores the primary identifier (`phoneNumber`), role (`CLIENT` or `LAWYER`), and registration status.
  - **Key Fields**: `id`, `phoneNumber` (@unique), `role` (Enum), `registrationPending` (Boolean).
  - **Relations**: Has optional one-to-one links to `ClientProfile` and `LawyerProfile`. Only one of these should be active for any given user, determined by the `role`.
  - **Expectation**: Every registered person has a `User` record.
- **`ClientProfile`**:
  - **Purpose**: Stores details specific to users with the `CLIENT` role.
  - **Key Fields**: `id`, `name` (optional), `photo` (optional), `email` (optional, @unique).
  - **Relations**: Linked one-to-one back to `User` (`userId`, @unique, `onDelete: Cascade`). Holds relations for client-specific actions (`SavedLawyer`, `ConsultationRequest`).
  - **Expectation**: Created only when a `User` registers with the `CLIENT` role.
- **`LawyerProfile`**:
  - **Purpose**: Stores details specific to users with the `LAWYER` role.
  - **Key Fields**: `id`, `photo`, `location`, `experience`, `bio`, `consultFee`, `barId`, `isVerified`.
  - **Relations**: Linked one-to-one back to `User` (`userId`, @unique, `onDelete: Cascade`). Holds relations for lawyer-specific details (`Education`, `LawyerPracticeArea`, `LawyerPracticeCourt`, `LawyerService`) and interactions (`SavedLawyer`, `ConsultationRequest`). Also includes direct foreign keys for single selections (`specializationId`, `primaryCourtId`).
  - **Expectation**: Created only when a `User` registers with the `LAWYER` role.

### 1.2. Lawyer Detail & Predefined List Models

- **`Education`**:
  - **Purpose**: Stores educational background for a lawyer.
  - **Relations**: Linked one-to-one to `LawyerProfile` (`lawyerProfileId`, @unique, `onDelete: Cascade`).
  - **Expectation**: A lawyer can have zero or one education records.
- **`PracticeArea`**:
  - **Purpose**: Stores predefined practice areas (e.g., "Family Law", "Corporate Law").
  - **Key Fields**: `id`, `name` (@unique).
  - **Relations**: Linked back to `LawyerProfile` (for specialization) and `LawyerPracticeArea` (for many-to-many).
  - **Expectation**: Managed potentially by an admin or seeded initially. Used for filtering and lawyer profile details.
- **`LawyerPracticeArea`**:
  - **Purpose**: Join table connecting `LawyerProfile` and `PracticeArea` (Many-to-Many).
  - **Expectation**: Records created/deleted when a lawyer updates their list of practice areas.
- **`PracticeCourt`**:
  - **Purpose**: Stores predefined courts (e.g., "Supreme Court", "District Court X").
  - **Key Fields**: `id`, `name` (@unique).
  - **Relations**: Linked back to `LawyerProfile` (for primary court) and `LawyerPracticeCourt` (for many-to-many).
  - **Expectation**: Managed potentially by an admin or seeded initially. Used for filtering and lawyer profile details.
- **`LawyerPracticeCourt`**:
  - **Purpose**: Join table connecting `LawyerProfile` and `PracticeCourt` (Many-to-Many).
  - **Expectation**: Records created/deleted when a lawyer updates their list of practice courts.
- **`Service`**:
  - **Purpose**: Stores predefined or custom services offered by lawyers.
  - **Key Fields**: `id`, `name` (@unique), `isPredefined` (Boolean).
  - **Relations**: Linked to `LawyerService` (Many-to-Many).
  - **Expectation**: Predefined services managed by admin/seed; lawyers can potentially add custom ones (if `isPredefined=false` logic is implemented).
- **`LawyerService`**:
  - **Purpose**: Join table connecting `LawyerProfile` and `Service` (Many-to-Many).
  - **Expectation**: Records created/deleted when a lawyer updates their offered services.

### 1.3. Interaction Models

- **`SavedLawyer`**:
  - **Purpose**: Allows a `ClientProfile` to bookmark or save a `LawyerProfile`.
  - **Relations**: Links `ClientProfile` and `LawyerProfile`.
  - **Constraints**: `@@unique([clientProfileId, lawyerProfileId])` prevents duplicate saves.
  - **Expectation**: Created when a client saves a lawyer, deleted when they unsave.
- **`ConsultationRequest`**:
  - **Purpose**: Represents a request sent from a `ClientProfile` to a `LawyerProfile`.
  - **Key Fields**: `message`, `status` (Enum: PENDING, VIEWED, RESPONDED, CLOSED).
  - **Relations**: Links `ClientProfile` and `LawyerProfile`.
  - **Expectation**: Created by a client, status updated by the lawyer or system.

### 1.4. Authentication Support & Enums

- **`Otp`**:
  - **Purpose**: Stores One-Time Passwords for phone number verification during registration/login.
  - **Key Fields**: `phoneNumber`, `otp`, `expiresAt`, `role` (stores intended role during registration).
  - **Expectation**: Created temporarily during auth flow, cleaned up periodically based on `expiresAt`.
- **`Role` (Enum)**: Defines user types (`CLIENT`, `LAWYER`, `ADMIN`).
- **`RequestStatus` (Enum)**: Defines the states of a `ConsultationRequest`.

### 1.5. Tasks to Handle in Application Code

- **Role-Based Profile Linking**: When a `User` is created, application logic must check the `role` and create the corresponding `ClientProfile` or `LawyerProfile`, linking it back to the `User`.
- **Profile Creation Trigger**: The creation of `ClientProfile` or `LawyerProfile` should likely happen _after_ successful OTP verification during registration.
- **`registrationPending` Flag**: Application logic must manage this flag. Set to `true` on initial `User` creation, set to `false` once the essential profile information is provided (definition of "essential" depends on business rules, e.g., name for client, maybe barId/specialization for lawyer).
- **Specialization/Primary Court Consistency**:
  - The schema uses `onDelete: Restrict` for `specialization` and `primaryCourt`. This prevents deleting a `PracticeArea`/`PracticeCourt` if linked.
  - Application logic (likely on the frontend and backend during profile updates) must ensure that the selected `specializationId` corresponds to a `PracticeArea` that is _also_ linked to the lawyer via the `LawyerPracticeArea` join table.
  - Similarly, the selected `primaryCourtId` must correspond to a `PracticeCourt` linked via the `LawyerPracticeCourt` join table.
- **Data Validation**: Implement input validation for all user-provided data (lengths, formats, required fields not covered by schema defaults).
- **Authorization**: Ensure users can only access/modify data they own or are permitted to see (e.g., a client cannot modify another client's profile; a lawyer only sees requests sent to them).
- **Predefined List Management**: Logic/endpoints are needed (likely admin-only) to manage `PracticeArea`, `PracticeCourt`, and predefined `Service` records.
- **Search/Filter Logic**: Implement backend logic to query lawyers based on criteria like location, `PracticeArea` (via join table), `specializationId`, `PracticeCourt` (via join table), `primaryCourtId`, etc.
- **OTP Cleanup**: A background job or scheduled task might be needed to delete expired `Otp` records.

## 2. Application Flow Details

This section describes the intended user experience (UX) and underlying technical flow.

### 2.1. User Registration & Login

1.  **UX**: User enters phone number. Role is selected by frontend according to route(Client/Lawyer). Receives OTP. Enters OTP.
2.  **Tech Flow**:
    - Frontend sends phone number + role to `/auth/request-otp` endpoint.
    - Backend generates OTP, stores it in `Otp` table with phone number, expiry, and role. Sends OTP via SMS (external service).
    - Frontend displays OTP input. User submits OTP.
    - Frontend sends phone number + OTP to `/auth/verify-otp` endpoint.
    - Backend finds matching `Otp` record (valid, not expired).
    - **If User Exists (Login)**: Backend finds `User` by phone number. Generates session/JWT token. Returns token to frontend.
    - **If User Doesn't Exist (Registration)**:
      - Backend creates a new `User` record with `phoneNumber`, the `role` from the `Otp` record, and `registrationPending = true`.
      - Backend creates the corresponding `ClientProfile` or `LawyerProfile` record, linking it to the new `User` via `userId`.
      - Backend generates session/JWT token. Returns token to frontend.
      - Backend deletes the used `Otp` record.
    - Frontend stores token, redirects to dashboard/profile completion.

### 2.2. Profile Completion

1.  **UX (Client)**: After registration, prompted to optionally add name, email, photo. Can update later.
2.  **UX (Lawyer)**: After registration, guided through multiple steps to add required/optional info: photo, location, bio, experience, bar ID, education, practice areas, specialization, practice courts, primary court, services, consultation fee. `isVerified` is admin-controlled.
3.  **Tech Flow**:
    - Frontend checks `User.registrationPending`. If true, guides user through completion forms.
    - Frontend makes API calls to PATCH `/profiles/client/me` or `/profiles/lawyer/me` with updated data.
    - these patch endpoint only authorize the user to update their own profile, e.i. token must be valid and match the user id in the token.
    - Backend receives updates, validates data.
    - For lawyer areas/courts/services:
      - Backend receives lists of IDs (e.g., `practiceAreaIds`, `practiceCourtIds`, `serviceIds`).
      - Backend uses Prisma's connect/disconnect or set operations on the join tables (`LawyerPracticeArea`, `LawyerPracticeCourt`, `LawyerService`) to update the many-to-many relationships.
      - Backend receives `specializationId` and `primaryCourtId`. Validates these IDs exist and are consistent with the chosen areas/courts (as per section 1.5). Updates the foreign key fields on `LawyerProfile`.
    - For `Education`: Backend creates/updates the related `Education` record.
    - Frontend updates `User.registrationPending` to `false` once criteria are met.

### 2.3. Lawyer Discovery (Client)

1.  **UX**: Client uses search bar and filters (location, practice area, specialization, court) to find lawyers. Sees list/map of results. Clicks profile for details. No Auth is required for getting all lawyers or lawyer profiles.
2.  **Tech Flow**:
    - Frontend sends search/filter criteria to `/lawyers/search` endpoint (e.g., GET with query parameters). default request without query params(filters/search) returns all lawyers.
    - Backend parses criteria. Constructs Prisma query using `where` clauses, including filtering on related models (`PracticeArea` via `LawyerPracticeArea` and `specializationId`, `PracticeCourt` via `LawyerPracticeCourt` and `primaryCourtId`, `location`, etc.). Uses pagination or returns all by default(`skip`, `take`).
    - Backend returns paginated list of `LawyerProfile` data (including related info like specialization, name, etc.).
    - For Lawyer Profile:
      - Frontend sends GET request to `/lawyers/{lawyerProfileId}`.
      - Backend fetches `LawyerProfile` by ID, and inculdes all related data related to the lawyer.
      - Frontend displays lawyer profile details.

### 2.3. Dashboard & Profile Viewing (Client/Lawyer)

1.  **UX (Client)**: Client views their profile. Can update profile.
2.  **UX (Lawyer)**: Lawyer views their profile. Can update profile.
3.  **Tech Flow**:
    - Frontend sends GET request to `/profiles/client/me` or `/profiles/lawyer/me`.
    - Backend gets `clientProfileId` or `lawyerProfileId` from authenticated user. Fetches corresponding `ClientProfile` or `LawyerProfile` data.
    - Frontend displays profile details.
    - For Update same patch endpoints are used as in the profile completion.

### 2.5. Saving/Bookmarking Lawyers (Client)

1.  **UX**: Client clicks a "Save" icon/button on a lawyer's profile or listing. Sees saved lawyers in a dedicated list. Clicks "Unsave".
2.  **Tech Flow**:
    - **Save**: Frontend sends POST request to `/saved-lawyers` with `lawyerProfileId`. Backend gets `clientProfileId` from authenticated user. Creates `SavedLawyer` record.
    - **Unsave**: Frontend sends DELETE request to `/saved-lawyers/{lawyerProfileId}`. Backend gets `clientProfileId`. Deletes `SavedLawyer` record matching both IDs.
    - **List**: Frontend sends GET request to `/saved-lawyers`. Backend gets `clientProfileId`. Fetches associated `SavedLawyer` records, potentially including `LawyerProfile` details.

### 2.6. Consultation Requests

1.  **UX (Client)**: Client views lawyer profile, clicks "Request Consultation", fills message, submits. Sees request status in their dashboard.
2.  **UX (Lawyer)**: Lawyer sees incoming requests in their dashboard. Views message. Updates status (Viewed, Responded, Closed).
3.  **Tech Flow**:
    - **Client Sends**: Frontend sends POST request to `/consultation-requests` with `lawyerProfileId` and `message`. Backend gets `clientProfileId`. Creates `ConsultationRequest` record with `status = PENDING`.
    - **Lawyer Lists**: Frontend sends GET request to `/consultation-requests` (potentially with filters like `status=PENDING`). Backend gets `lawyerProfileId`. Fetches relevant requests.
    - **Lawyer Updates Status**: Frontend sends PATCH request to `/consultation-requests/{requestId}` with the new `status`. Backend gets `lawyerProfileId`, verifies the request belongs to them, updates the `status` field.

## 3. endpoints to be implemented and their purpose, behaviour, expected inputs and outputs

### 3.1. Auth

- `/auth/request-otp`:

  - **Purpose**: Generate and send an OTP to the provided phone number.
  - **Inputs**: `phoneNumber` (string), `role` (enum).
  - **Outputs**: `otp` (string), `expiresAt` (datetime).
  - **Behaviour**:
    - Generates a new OTP.
    - Stores the OTP in the database with the phone number, expiry time, and role.
    - Sends the OTP via SMS (external service).
    - Returns the OTP and expiry time.

- `/auth/verify-otp`:
  - **Purpose**: Verify the provided OTP.
  - **Inputs**: `phoneNumber` (string), `otp` (string).
  - **Outputs**: `token` (string).
  - **Behaviour**:
    - Finds the matching OTP record (valid, not expired).
    - If the user exists (login): Generates a session token and returns it.
    - If the user doesn't exist (registration): Creates a new user, generates a session token, and returns it.
    - Deletes the used OTP record.

### 3.2. Profiles

- `/profiles/client/me`:

  - **Purpose**: Update a client's profile. type: auth required, id from token required.
  - **Inputs**: `name` (string), `email` (string), `photo` (string).
  - **Outputs**: `ClientProfile` (object).
  - **Behaviour**:
    - Updates the client's profile with the provided data.
    - Returns the updated profile.

- `/profiles/lawyer/me`:
  - **Purpose**: Update a lawyer's profile(any data related to lawyer profile can be updated via this route, except phone number). type: auth required, id from token required.
  - **Inputs**: `photo` (string), `location` (string), `bio` (string), `experience` (string), `barId` (string), `education` (object), `practiceAreaIds` (array), `specializationId` (string), `practiceCourtIds` (array), `primaryCourtId` (string), `serviceIds` (array), `consultFee` (number).
  - **Outputs**: `LawyerProfile` (object).
  - **Behaviour**:
    - extract lawyer id from token.
    - Updates the lawyer's profile with the provided data.
    - Updates the many-to-many relationships for `PracticeArea`, `PracticeCourt`, and `Service`.
    - Updates the foreign key fields for `specializationId` and `primaryCourtId`.
    - Returns the updated profile.

### 3.3. Lawyers

- `/lawyers/search`:

  - **Purpose**: Search for lawyers based on criteria.
  - **Inputs**: `location` (string), `practiceAreaIds` (array), `specializationId` (string), `practiceCourtIds` (array), `primaryCourtId` (string).
  - **Outputs**: `LawyerProfile` (array).
  - **Behaviour**:
    - Constructs a Prisma query using `where` clauses based on the provided criteria.
    - Returns a paginated list of lawyer profiles.
    - Default request without query params(filters/search) returns all lawyers without pagination.

- `/lawyers/{lawyerProfileId}`:
  - **Purpose**: Get a lawyer's profile by ID.
  - **Inputs**: `lawyerProfileId` (string).
  - **Outputs**: `LawyerProfile` (object).
  - **Behaviour**:
    - Fetches the lawyer's profile by ID, including related data.
    - Returns the profile.

### 3.4. Saved Lawyers

- `/saved-lawyers`:

  - **Purpose**: List saved lawyers for a client.
  - **Inputs**: None.
  - **Outputs**: `SavedLawyer` (array).
  - **Behaviour**:
    - Fetches the client's saved lawyers.
    - Returns a list of saved lawyer profiles.

- `/saved-lawyers/{lawyerProfileId}`:
  - **Purpose**: Save or unsave a lawyer.
  - **Inputs**: `lawyerProfileId` (string).
  - **Outputs**: `SavedLawyer` (object).
  - **Behaviour**:
    - Toggles the saved status for the lawyer.
    - Returns the updated saved lawyer record.

### 3.5. Consultation Requests

- `/consultation-requests`:

  - **Purpose**: List consultation requests for a lawyer.
  - **Inputs**: `status` (enum).
  - **Outputs**: `ConsultationRequest` (array).
  - **Behaviour**:
    - Fetches the lawyer's consultation requests.
    - Returns a list of consultation requests.

- `/consultation-requests/{requestId}`:
  - **Purpose**: Update a consultation request status.
  - **Inputs**: `status` (enum).
  - **Outputs**: `ConsultationRequest` (object).
  - **Behaviour**:
    - Updates the consultation request status.
    - Returns the updated consultation request.

## 4. Implementation Roadmap
