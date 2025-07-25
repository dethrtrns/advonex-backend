# Advonex Backend API Usage Guide (v1)

This guide provides detailed information for frontend developers on how to interact with the Advonex backend API. It covers authentication, profile management, and other key features.

## Authentication

### 1. `POST /auth/request-otp-email`

**Description:** Sends a 6-digit One-Time Password (OTP) to the user's email address for authentication.

**Usage:**
This is the first step for a user to log in or register. The user provides their email, and the backend sends an OTP to that address.

**Behavior:**
- The OTP is valid for 5 minutes.
- Rate limiting is applied: 5 requests per hour per email address.
- Only specific email domains are allowed (e.g., gmail.com, yahoo.com, outlook.com, hotmail.com).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**
- **200 OK:** OTP sent successfully.
  ```json
  {
    "success": true
  }
  ```
- **400 Bad Request:** Invalid email format or unsupported domain.
- **429 Too Many Requests:** The user has exceeded the rate limit.

### 2. `POST /auth/verify-otp-email`

**Description:** Verifies the OTP sent to the user's email. On successful verification, it returns JWT tokens and user information.

**Usage:**
After the user receives the OTP, they submit it along with their email to this endpoint.

**Behavior:**
- If the user is new, a new user account is created with the `CLIENT` role by default. A corresponding client profile is also created.
- If the user exists, they are logged in, and their `lastLogin` timestamp is updated.
- If an existing user logs in with a role they don't have, the new role is added and activated, and a corresponding profile is created. Other roles are deactivated.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "role": "LAWYER" // Optional: Specify 'LAWYER' to create/login as a lawyer. Defaults to 'CLIENT'.
}
```

**Responses:**
- **200 OK:** OTP verified successfully.
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "phoneNumber": null,
      "roles": ["CLIENT"], // or ["LAWYER"]
      "profileId": "profile-uuid",
      "isNewUser": true // or false
    }
  }
  ```
- **401 Unauthorized:** Invalid or expired OTP.

### 3. `POST /auth/refresh`

**Description:** Generates a new pair of access and refresh tokens using a valid refresh token.

**Usage:**
When the `accessToken` expires, the frontend should use the `refreshToken` to get a new `accessToken` without requiring the user to log in again.

**Behavior:**
- The provided `refreshToken` is invalidated after use.
- A new `refreshToken` is issued along with the new `accessToken`.

**Request Headers:**
```
Authorization: Bearer <your_refresh_token>
```

**Responses:**
- **200 OK:** Tokens refreshed successfully.
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **401 Unauthorized:** The refresh token is invalid, expired, or has been revoked.

### 4. `POST /auth/logout`

**Description:** Logs out the authenticated user by invalidating all of their refresh tokens.

**Usage:**
Call this endpoint when the user clicks the "Logout" button.

**Behavior:**
- Requires a valid `accessToken` in the `Authorization` header.
- All `refreshToken`s associated with the user are deleted from the database, effectively logging them out from all devices.

**Request Headers:**
```
Authorization: Bearer <your_access_token>
```

**Responses:**
- **200 OK:** User logged out successfully.
- **401 Unauthorized:** No valid `accessToken` was provided.

### 5. `POST /auth/add-role`

**Description:** Adds a new role (`CLIENT` or `LAWYER`) to the authenticated user or activates an inactive one.

**Usage:**
This is for scenarios where an existing user wants to switch their role, for example, a client becoming a lawyer.

**Behavior:**
- Requires a valid `accessToken`.
- When a role is added or activated, all other roles for that user are set to inactive.
- If a profile for the new role doesn't exist, it will be created.
- The `ADMIN` role cannot be added via this endpoint.
- Returns a new set of tokens with the updated role information.

**Request Body:**
```json
{
  "role": "LAWYER" // or "CLIENT"
}
```

**Responses:**
- **200 OK:** Role added/activated successfully.
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **400 Bad Request:** The provided role is invalid.
- **401 Unauthorized:** User not authenticated.
- **403 Forbidden:** Attempted to add the `ADMIN` role.
- **409 Conflict:** The user already has the specified role and it is active.

### 6. `GET /auth/me`

**Description:** Retrieves the profile information of the currently authenticated user.

**Usage:**
Call this endpoint after login or on page refresh to get the user's current data.

**Behavior:**
- Requires a valid `accessToken`.
- Returns the full user object from the database, including all associated profiles and roles.

**Request Headers:**
```
Authorization: Bearer <your_access_token>
```

**Responses:**
- **200 OK:** User information retrieved successfully.
  ```json
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "phoneNumber": null,
    "accountStatus": "ACTIVE",
    "createdAt": "2025-07-25T10:00:00.000Z",
    "updatedAt": "2025-07-25T10:00:00.000Z",
    "lastLogin": "2025-07-25T10:00:00.000Z",
    "clientProfile": { /* ...client profile data... */ },
    "lawyerProfile": null,
    "userRoles": [
      {
        "id": "role-uuid",
        "role": "CLIENT",
        "isActive": true,
        "createdAt": "2025-07-25T10:00:00.000Z",
        "updatedAt": "2025-07-25T10:00:00.000Z",
        "userId": "user-uuid"
      }
    ]
  }
  ```
- **401 Unauthorized:** Invalid or missing `accessToken`.
- **404 Not Found:** The user associated with the token could not be found.

---

## Profiles

### 1. `GET /profiles/client`

**Description:** Retrieves the profile of the authenticated client.

**Usage:**
Fetch the detailed profile for a user who is currently acting as a `CLIENT`.

**Behavior:**
- Requires a valid `accessToken` for a user with an active `CLIENT` role.

**Request Headers:**
```
Authorization: Bearer <your_access_token>
```

**Responses:**
- **200 OK:** Client profile retrieved successfully.
  ```json
  {
    "id": "client-profile-uuid",
    "name": "John Doe",
    "photo": "url-to-photo.jpg",
    "registrationPending": false,
    "createdAt": "2025-07-25T10:00:00.000Z",
    "updatedAt": "2025-07-25T10:00:00.000Z",
    "userId": "user-uuid"
  }
  ```
- **401 Unauthorized:** Invalid or missing `accessToken`.
- **403 Forbidden:** User does not have the `CLIENT` role.
- **404 Not Found:** Client profile does not exist for this user.

### 2. `PUT /profiles/client`

**Description:** Updates the profile of the authenticated client.

**Usage:**
Modify the details of the client's profile.

**Behavior:**
- Requires a valid `accessToken` for a user with an active `CLIENT` role.
- All fields in the request body are optional.
- On the first successful update, `registrationPending` is set to `false`.

**Request Body:**
```json
{
  "name": "Johnathan Doe",
  "photo": "new-url-to-photo.jpg"
}
```

**Responses:**
- **200 OK:** Client profile updated successfully. Returns the updated profile.
- **401 Unauthorized:** Invalid or missing `accessToken`.
- **403 Forbidden:** User does not have the `CLIENT` role.
- **404 Not Found:** Client profile does not exist for this user.

### 3. `GET /profiles/lawyer`

**Description:** Retrieves the profile of the authenticated lawyer.

**Usage:**
Fetch the detailed profile for a user who is currently acting as a `LAWYER`.

**Behavior:**
- Requires a valid `accessToken` for a user with an active `LAWYER` role.
- The response includes all related data like practice areas, courts, services, and education.

**Request Headers:**
```
Authorization: Bearer <your_access_token>
```

**Responses:**
- **200 OK:** Lawyer profile retrieved successfully.
  ```json
  {
    "id": "lawyer-profile-uuid",
    "name": "Jane Smith",
    "photo": "url-to-photo.jpg",
    "location": "New York, NY",
    "experience": 10,
    "bio": "Experienced corporate lawyer...",
    "consultFee": 250,
    "barId": "1234567",
    "isVerified": false,
    "registrationPending": false,
    // ... other fields and relations
  }
  ```
- **401 Unauthorized:** Invalid or missing `accessToken`.
- **403 Forbidden:** User does not have the `LAWYER` role.
- **404 Not Found:** Lawyer profile does not exist for this user.

### 4. `PUT /profiles/lawyer`

**Description:** Updates the profile of the authenticated lawyer.

**Usage:**
Modify the details of the lawyer's profile.

**Behavior:**
- Requires a valid `accessToken` for a user with an active `LAWYER` role.
- All fields in the request body are optional.
- On the first successful update, `registrationPending` is set to `false`.
- For relational fields (e.g., `specialization`, `primaryCourt`), providing a string name will either link to an existing record or create a new one.

**Request Body:**
```json
{
  "name": "Jane A. Smith",
  "location": "San Francisco, CA",
  "specialization": "Technology Law",
  "education": {
    "degree": "Juris Doctor",
    "institution": "Harvard Law School",
    "year": 2014
  }
}
```

**Responses:**
- **200 OK:** Lawyer profile updated successfully. Returns the updated profile.
- **401 Unauthorized:** Invalid or missing `accessToken`.
- **403 Forbidden:** User does not have the `LAWYER` role.
- **404 Not Found:** Lawyer profile does not exist for this user.

---

## Frontend Queries

### 1. Authentication Token Details

- **Token Type:** The backend uses **JSON Web Tokens (JWT)**. You will receive an `accessToken` and a `refreshToken`.

- **Storage:**
  - The `accessToken` should be stored in memory (e.g., a JavaScript variable in your application's state management). It is short-lived and will be sent with every authenticated API request.
  - The `refreshToken` is longer-lived and should be stored securely. The recommended approach is to store it in an **`httpOnly` cookie** to prevent access from client-side JavaScript, which mitigates XSS attacks. If `httpOnly` cookies are not feasible, `localStorage` can be used, but it is less secure.

- **Payload (JWT):** The `accessToken` payload contains the following information:
  ```json
  {
    "sub": "user-uuid", // User ID
    "email": "user@example.com", // User's email
    "roles": ["CLIENT"], // An array of the user's active roles
    "profileId": "profile-uuid", // The ID of the user's active profile (client or lawyer)
    "profileIds": {
      "clientId": "client-profile-uuid",
      "lawyerId": "lawyer-profile-uuid" // Can be null
    },
    "iat": 1678886400, // Issued at timestamp
    "exp": 1678887300  // Expiration timestamp
  }
  ```
  Yes, the payload includes the user's active `roles`, so you can use this for client-side role-based UI rendering.

### 2. User Information Endpoint

- **Endpoint URL:** Yes, the endpoint `GET /auth/me` is available to get information about the currently authenticated user.

- **Response Data:** As shown in the documentation for `GET /auth/me`, this endpoint returns the complete `User` object from the database, which includes their `id`, `email`, `accountStatus`, and a list of all their `userRoles` (both active and inactive), along with their `clientProfile` and `lawyerProfile` objects if they exist. This provides a comprehensive view of the user's state.

### 3. User Roles

- **List of Roles:** The available roles in the system are:
  - `CLIENT`: A standard user seeking legal services.
  - `LAWYER`: A legal professional providing services.
  - `ADMIN`: A system administrator with elevated privileges.
- There are no other roles like `guest` or `unverified` at the moment. User status is handled by the `accountStatus` field on the `User` model (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`) and the `registrationPending` flag on the profile models.
