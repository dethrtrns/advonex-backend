# Endpoints Usage Guide

## Auth Module

This module handles user authentication, authorization, and role management.

### 1. Request OTP via Email

- **Endpoint:** `POST /auth/request-otp-email`
- **Description:** Sends a 6-digit One-Time Password (OTP) to the provided email address. This endpoint is rate-limited to 5 requests per hour per email. The OTP expires in 5 minutes.
- **Request Body:** `application/json`
  ```json
  {
    "email": "user@example.com"
  }
  ```
  - `email` (string, required): The email address to which the OTP will be sent. Must be a valid email format from a supported domain (e.g., gmail.com, yahoo.com, outlook.com, hotmail.com).
- **Responses:**
  - `200 OK`: OTP sent successfully.
    ```json
    {
      "success": true
    }
    ```
  - `400 Bad Request`: Invalid email format or unsupported email domain.
  - `429 Too Many Requests`: OTP request limit exceeded for the email address.

### 2. Verify Email OTP

- **Endpoint:** `POST /auth/verify-otp-email`
- **Description:** Verifies the OTP sent to the specified email address. If the OTP is valid, it returns JWT (JSON Web Token) access and refresh tokens, along with user information. For new users, this endpoint will create a new user account with the `CLIENT` role by default (or the specified role if provided). For existing users, it logs them in.
- **Request Body:** `application/json`
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "role": "CLIENT"
  }
  ```
  - `email` (string, required): The email address for which the OTP is being verified.
  - `otp` (string, required, 6 digits): The 6-digit OTP received via email.
  - `role` (string, optional, enum: `CLIENT`, `LAWYER`, `ADMIN`): The role to assign to the user if they are a new user. Defaults to `CLIENT` if not provided.
- **Responses:**
  - `200 OK`: OTP verified successfully. Tokens and user information returned.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "phoneNumber": null,
        "roles": ["CLIENT"],
        "profileId": "123e4567-e89b-12d3-a456-426614174001",
        "isNewUser": false
      }
    }
    ```
  - `401 Unauthorized`: Invalid or expired OTP.

### 3. Request OTP (Unified)

- **Endpoint:** `POST /auth/request-otp`
- **Description:** A unified endpoint to request an OTP via either email or phone number. It is rate-limited (5 requests per hour per identifier). The OTP expires in 5 minutes.
- **Request Body:** `application/json` (Provide _either_ `email` _or_ `phoneNumber`)
  ```json
  {
    "email": "user@example.com", // Optional
    "phoneNumber": "+1234567890" // Optional
  }
  ```
  - `email` (string, optional): The email address to send the OTP to. If provided, `phoneNumber` should be omitted.
  - `phoneNumber` (string, optional): The phone number to send the OTP to. If provided, `email` should be omitted.
- **Responses:**
  - `200 OK`: OTP sent successfully.
    ```json
    {
      "success": true
    }
    ```
  - `400 Bad Request`: Invalid input data (e.g., both email and phone provided, or neither) or unsupported email domain if email is used.
  - `429 Too Many Requests`: OTP request limit exceeded.

### 4. Verify OTP (Unified)

- **Endpoint:** `POST /auth/verify-otp`
- **Description:** A unified endpoint to verify an OTP received via either email or phone. If successful, it returns JWT access and refresh tokens, along with user information. Creates a new user if one doesn't exist with the provided identifier.
- **Request Body:** `application/json` (Provide _either_ `email` _or_ `phoneNumber` along with `otp` and optionally `role`)
  ```json
  {
    "email": "user@example.com", // Optional
    "phoneNumber": "+1234567890", // Optional
    "otp": "123456",
    "role": "CLIENT" // Optional
  }
  ```
  - `email` (string, optional): The email address used for OTP verification. If provided, `phoneNumber` should be omitted.
  - `phoneNumber` (string, optional): The phone number used for OTP verification. If provided, `email` should be omitted.
  - `otp` (string, required, 6 digits): The 6-digit OTP code.
  - `role` (string, optional, enum: `CLIENT`, `LAWYER`, `ADMIN`): The role to assign if a new user is created. Defaults to `CLIENT`.
- **Responses:**
  - `200 OK`: OTP verified successfully. Tokens and user information returned.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "phoneNumber": "+1234567890",
        "roles": ["CLIENT"],
        "profileId": "123e4567-e89b-12d3-a456-426614174001",
        "isNewUser": false
      }
    }
    ```
  - `401 Unauthorized`: Invalid or expired OTP.

### 5. Refresh Access Token

- **Endpoint:** `POST /auth/refresh`
- **Description:** Generates a new pair of access and refresh tokens using a valid, non-expired refresh token. The previously used refresh token will be invalidated.
- **Headers:**
  - `Authorization` (string, required): `Bearer <your_refresh_token>`
- **Security:** This endpoint is protected and requires a valid refresh token.
- **Responses:**
  - `200 OK`: Tokens refreshed successfully.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - `401 Unauthorized`: Invalid, expired, or missing refresh token.

### 6. Logout User

- **Endpoint:** `POST /auth/logout`
- **Description:** Invalidates all active refresh tokens for the currently authenticated user, effectively logging them out from all sessions that rely on those refresh tokens.
- **Headers:**
  - `Authorization` (string, required): `Bearer <your_access_token>`
- **Security:** This endpoint is protected and requires a valid access token.
- **Responses:**
  - `200 OK`: User logged out successfully (no content in response body).
  - `401 Unauthorized`: User not authenticated (invalid or missing access token).

### 7. Update User Roles (Admin Only)

- **Endpoint:** `PATCH /auth/users/:userId/roles`
- **Description:** Updates the roles assigned to a specific user. This action can only be performed by an administrator.
- **Path Parameters:**
  - `userId` (string, UUID, required): The ID of the user whose roles are to be updated.
- **Headers:**
  - `Authorization` (string, required): `Bearer <admin_access_token>`
- **Security:** Requires `ADMIN` role.
- **Request Body:** `application/json`
  ```json
  {
    "roles": ["CLIENT", "LAWYER"]
  }
  ```
  - `roles` (array of strings, required, enum values: `CLIENT`, `LAWYER`, `ADMIN`): An array of roles to assign to the user. Existing roles not included will be removed.
- **Responses:**
  - `200 OK`: User roles updated successfully (no content in response body).
  - `400 Bad Request`: Invalid input data (e.g., invalid role values).
  - `403 Forbidden`: Authenticated user does not have `ADMIN` privileges.
  - `404 Not Found`: User with the specified `userId` not found.

### 8. Add Role to User (Admin Only)

- **Endpoint:** `POST /auth/add-role`
- **Description:** Adds a new role to the currently authenticated administrator's user record. _Note: Based on the controller, this endpoint seems to add a role to the admin user performing the request, not to an arbitrary user. It also returns new tokens for the admin._ This might be an area for review in API design if the intent was to add roles to other users.
- **Headers:**
  - `Authorization` (string, required): `Bearer <admin_access_token>`
- **Security:** Requires `ADMIN` role.
- **Request Body:** `application/json`
  ```json
  {
    "role": "LAWYER"
  }
  ```
  - `role` (string, required, enum: `CLIENT`, `LAWYER`): The role to add to the admin user. Cannot be `ADMIN` itself via this DTO.
- **Responses:**
  - `200 OK`: Role added successfully. Returns new tokens for the admin user.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  - `401 Unauthorized`: Admin not authenticated.
  - `403 Forbidden`: Authenticated user does not have `ADMIN` privileges or trying to add an invalid role.
  - `404 Not Found`: (Potentially if the admin user somehow doesn't exist, though unlikely if authenticated).

### 9. Get Current User Info

## Client Module

This module provides functionality for clients to manage their interactions with lawyers, such as saving lawyers to a shortlist and requesting consultations.
All endpoints in this module require the user to be authenticated and have the `CLIENT` role.

### 1. Save a Lawyer to Shortlist

- **Endpoint:** `POST /client/save-lawyer`
- **Description:** Allows a client to save a lawyer's profile to their personal shortlist for easy access later.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Request Body:** `application/json`
  ```json
  {
    "lawyerId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
  - `lawyerId` (string, UUID, required): The unique identifier (UUID) of the lawyer's profile to be saved.
- **Responses:**
  - `201 Created`: Lawyer successfully saved to the client's shortlist. (No content in response body).
  - `401 Unauthorized`: Client not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.
  - `404 Not Found`: The lawyer profile with the specified `lawyerId` was not found.
  - `409 Conflict`: The lawyer is already saved in the client's shortlist.

### 2. Get Saved Lawyers

- **Endpoint:** `GET /client/saved-lawyers`
- **Description:** Retrieves a list of all lawyers that the authenticated client has saved to their shortlist.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Responses:**
  - `200 OK`: Successfully retrieved the list of saved lawyers.
    ```json
    [
      {
        "id": "unique-saved-lawyer-record-id",
        "lawyer": {
          "id": "lawyer-profile-uuid",
          "name": "John Doe",
          "photo": "url/to/photo.jpg",
          "location": "City, Country",
          "experience": 5,
          "bio": "Experienced lawyer specializing in...",
          "consultFee": 150,
          "isVerified": true,
          "specialization": {
            "id": "specialization-uuid",
            "name": "Corporate Law"
          },
          "primaryCourt": {
            "id": "court-uuid",
            "name": "High Court of City"
          }
        },
        "savedAt": "2024-03-21T10:00:00Z"
      }
    ]
    ```
    Each object in the array represents a `SavedLawyerDto` containing:
    - `id` (string): Unique ID of the saved lawyer entry.
    - `lawyer` (object): Details of the lawyer's profile (see example for fields).
    - `savedAt` (Date): Timestamp of when the lawyer was saved.
  - `401 Unauthorized`: Client not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.

### 3. Request a Consultation

- **Endpoint:** `POST /client/request-consultation`
- **Description:** Allows a client to send a consultation request to a specific lawyer.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Request Body:** `application/json`
  ```json
  {
    "lawyerId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "I need help with a contract review for my startup."
  }
  ```
  - `lawyerId` (string, UUID, required): The UUID of the lawyer's profile to whom the consultation request is being sent.
  - `message` (string, required, max 1000 characters): The message from the client to the lawyer regarding the consultation.
- **Responses:**
  - `201 Created`: Consultation request successfully created. (No content in response body, or could return the created request details).
  - `401 Unauthorized`: Client not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.
  - `404 Not Found`: The lawyer profile with the specified `lawyerId` was not found.

### 4. Get All Consultation Requests by Client

- **Endpoint:** `GET /client/consultation-requests`
- **Description:** Retrieves all consultation requests made by the authenticated client.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Responses:**
  - `200 OK`: Successfully retrieved the list of consultation requests.
    ```json
    [
      {
        "id": "request-uuid-1",
        "lawyer": {
          "id": "lawyer-profile-uuid-A",
          "name": "Jane Smith",
          "photo": "url/to/photo.jpg",
          "location": "City, Country",
          "experience": 10,
          "bio": "Specialist in family law.",
          "consultFee": 200,
          "isVerified": true,
          "specialization": {
            "id": "specialization-uuid-fam",
            "name": "Family Law"
          },
          "primaryCourt": {
            "id": "court-uuid-fam",
            "name": "Family Court"
          }
        },
        "message": "Need advice on a divorce case.",
        "status": "PENDING",
        "createdAt": "2024-03-20T12:00:00Z",
        "updatedAt": "2024-03-20T12:00:00Z"
      }
    ]
    ```
    Each object in the array is a `ConsultationRequestResponseDto` containing:
    - `id` (string): Unique ID of the consultation request.
    - `lawyer` (object): Details of the lawyer to whom the request was sent.
    - `message` (string): The client's message.
    - `status` (string, enum: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`): Current status of the request.
    - `createdAt` (Date): Timestamp of request creation.
    - `updatedAt` (Date): Timestamp of last update.
  - `401 Unauthorized`: Client not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.

### 5. Get Specific Consultation Request by ID

- **Endpoint:** `GET /client/consultation-requests/:requestId`
- **Description:** Retrieves a specific consultation request made by the authenticated client, identified by its ID.
- **Path Parameters:**
  - `requestId` (string, UUID, required): The ID of the consultation request to retrieve.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Responses:**

  - `200 OK`: Successfully retrieved the consultation request.
    ```json
    {
      "id": "specific-request-uuid",
      "lawyer": {
        "id": "lawyer-profile-uuid-B",
        "name": "Robert Brown"
        // ... other lawyer details
      },
      "message": "Inquiry about intellectual property.",
      "status": "ACCEPTED",
      "createdAt": "2024-03-19T15:30:00Z",
      "updatedAt": "2024-03-20T09:00:00Z"
    }
    ```
    The response body is a single `ConsultationRequestResponseDto` object.
  - `401 Unauthorized`: Client not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role, or the request does not belong to this client.
  - `404 Not Found`: Consultation request with the specified `requestId` not found for this client.

- **Endpoint:** `GET /auth/me`
- **Description:** Retrieves detailed information about the currently authenticated user.
- **Headers:**
  - `Authorization` (string, required): `Bearer <your_access_token>`
- **Security:** This endpoint is protected and requires a valid access token.
- **Responses:**
  - `200 OK`: User information retrieved successfully.
    ```json
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "roles": ["CLIENT"],
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z",
      "lastLogin": "2024-03-20T10:00:00Z",
      "accountStatus": "ACTIVE"
    }
    ```
  - `401 Unauthorized`: User not authenticated (invalid or missing access token).

## Lawyers Module

This module provides endpoints for searching and retrieving lawyer profiles. These are generally public-facing or accessible to authenticated users looking for legal professionals.

### 1. Search for Lawyers

- **Endpoint:** `GET /lawyers/search`
- **Description:** Searches for lawyer profiles based on various criteria such as search term, practice area, location, experience, etc. Supports pagination.
- **Query Parameters:**
  - `searchTerm` (string, optional): A general search term to filter lawyers by name, bio, etc.
  - `practiceArea` (string, optional): Filter by a specific practice area name (e.g., "Corporate Law").
  - `court` (string, optional): Filter by a specific practice court name.
  - `service` (string, optional): Filter by a specific service offered by lawyers.
  - `minHourlyRate` (number, optional, min: 0): Minimum hourly rate.
  - `maxHourlyRate` (number, optional, min: 0): Maximum hourly rate.
  - `minRating` (number, optional, min: 0, max: 5): Minimum average rating.
  - `page` (number, optional, default: 1): Page number for pagination.
  - `limit` (number, optional, default: 10): Number of results per page.
  - `sortBy` (string, optional, enum: `name`, `experience`, `consultFee`, `rating`, `createdAt`): Field to sort by.
  - `sortOrder` (string, optional, enum: `asc`, `desc`, default: `asc`): Sort order.
- **Responses:**
  - `200 OK`: Returns a paginated list of lawyer profiles matching the search criteria.
    ```json
    {
      "data": [
        {
          "id": "lawyer-profile-uuid-1",
          "name": "Alice Wonderland",
          "email": "alice@example.com",
          "photo": "url/to/alice.jpg",
          "location": "New York, USA",
          "experience": 10,
          "bio": "Expert in intellectual property and tech law.",
          "consultFee": 250,
          "barId": "NY12345",
          "isVerified": true,
          "registrationPending": false,
          "specialization": {
            "id": "practice-area-uuid-ip",
            "name": "INTELLECTUAL_PROPERTY",
            "description": "Covers patents, trademarks, copyrights.",
            "createdAt": "2023-01-01T00:00:00Z",
            "updatedAt": "2023-01-01T00:00:00Z"
          },
          "primaryCourt": {
            "id": "court-uuid-ny-federal",
            "name": "Federal Court - NY",
            "location": "New York",
            "createdAt": "2023-01-01T00:00:00Z",
            "updatedAt": "2023-01-01T00:00:00Z"
          },
          "practiceAreas": [
            {
              "practiceArea": {
                "id": "practice-area-uuid-ip",
                "name": "INTELLECTUAL_PROPERTY"
              }
            }
          ],
          "practiceCourts": [
            {
              "practiceCourt": {
                "id": "court-uuid-ny-federal",
                "name": "Federal Court - NY"
              }
            }
          ],
          "services": [
            {
              "service": {
                "id": "service-uuid-patent",
                "name": "Patent Filing"
              }
            }
          ],
          "education": [
            {
              "id": "education-uuid-harvard",
              "institution": "Harvard Law School",
              "degree": "Juris Doctor",
              "year": 2010
            }
          ],
          "averageRating": 4.8,
          "totalReviews": 25,
          "createdAt": "2023-02-15T10:00:00Z",
          "updatedAt": "2024-03-10T14:30:00Z"
        }
      ],
      "meta": {
        "totalItems": 100,
        "itemCount": 10,
        "itemsPerPage": 10,
        "totalPages": 10,
        "currentPage": 1
      }
    }
    ```
    The `data` array contains `LawyerProfileDto` objects. The `meta` object contains pagination details.

### 2. Get Lawyer by ID

- **Endpoint:** `GET /lawyers/:id`
- **Description:** Retrieves the complete profile of a specific lawyer by their unique ID (UUID).
- **Path Parameters:**
  - `id` (string, UUID, required): The ID of the lawyer profile to retrieve.
- **Responses:**
  - `200 OK`: Lawyer profile retrieved successfully.
    ```json
    {
      "id": "lawyer-profile-uuid-target",
      "name": "Bob The Builder",
      "email": "bob@example.com",
      "photo": "url/to/bob.jpg",
      "location": "London, UK",
      "experience": 15,
      "bio": "Specializes in construction law and dispute resolution.",
      "consultFee": 300,
      "barId": "UK98765",
      "isVerified": true,
      "registrationPending": false,
      "specialization": {
        "id": "practice-area-uuid-construction",
        "name": "REAL_ESTATE",
        "description": "Focus on construction contracts and litigation.",
        "createdAt": "2023-01-05T00:00:00Z",
        "updatedAt": "2023-01-05T00:00:00Z"
      },
      "primaryCourt": {
        "id": "court-uuid-london-high",
        "name": "High Court - London",
        "location": "London",
        "createdAt": "2023-01-05T00:00:00Z",
        "updatedAt": "2023-01-05T00:00:00Z"
      },
      "practiceAreas": [
        {
          "practiceArea": {
            "id": "practice-area-uuid-construction",
            "name": "REAL_ESTATE"
          }
        },
        {
          "practiceArea": {
            "id": "practice-area-uuid-litigation",
            "name": "CIVIL"
          }
        }
      ],
      "practiceCourts": [
        {
          "practiceCourt": {
            "id": "court-uuid-london-high",
            "name": "High Court - London"
          }
        }
      ],
      "services": [
        {
          "service": {
            "id": "service-uuid-contract-drafting",
            "name": "Contract Drafting"
          }
        },
        {
          "service": {
            "id": "service-uuid-dispute-resolution",
            "name": "Dispute Resolution"
          }
        }
      ],
      "education": [
        {
          "id": "education-uuid-oxford",
          "institution": "Oxford University",
          "degree": "LL.M.",
          "year": 2005
        }
      ],
      "averageRating": 4.9,
      "totalReviews": 42,
      "createdAt": "2023-03-01T09:00:00Z",
      "updatedAt": "2024-02-20T11:00:00Z"
    }
    ```
    The response body is a single `LawyerProfileDto` object.
  - `404 Not Found`: Lawyer with the specified ID not found.

## Profiles Module

This module handles the management of user profiles, for both clients and lawyers. Authenticated users can retrieve and update their own profiles.

### 1. Get Client Profile

- **Endpoint:** `GET /profiles/client`
- **Description:** Retrieves the profile of the authenticated client user.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Responses:**
  - `200 OK`: Client profile retrieved successfully.
    ```json
    {
      "id": "client-profile-uuid",
      "name": "John Doe",
      "photo": "url/to/client_photo.jpg",
      "registrationPending": false,
      "userId": "user-uuid-for-client",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-03-01T12:00:00Z"
    }
    ```
    The response body is a `ClientProfileResponseDto` object.
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.
  - `404 Not Found`: Client profile not found for the authenticated user.

### 2. Update Client Profile

- **Endpoint:** `PUT /profiles/client`
- **Description:** Updates the profile of the authenticated client user. All fields in the request body are optional; only provided fields will be updated.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Request Body:** `application/json`
  ```json
  {
    "name": "Johnathan Doe",
    "photo": "url/to/new_client_photo.jpg",
    "registrationPending": false
  }
  ```
  - `name` (string, optional, max 255 chars): Client's full name.
  - `photo` (string, optional, URL): URL of the client's profile picture. Send an empty string or null to remove.
  - `registrationPending` (boolean, optional): Set to `false` to mark profile completion.
- **Responses:**
  - `200 OK`: Client profile updated successfully. Returns the updated `ClientProfileResponseDto`.
    ```json
    {
      "id": "client-profile-uuid",
      "name": "Johnathan Doe",
      "photo": "url/to/new_client_photo.jpg",
      "registrationPending": false,
      "userId": "user-uuid-for-client",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-03-22T14:00:00Z"
    }
    ```
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.
  - `404 Not Found`: Client profile not found for the authenticated user.

### 3. Get Lawyer Profile

- **Endpoint:** `GET /profiles/lawyer`
- **Description:** Retrieves the profile of the authenticated lawyer user, including all related data like practice areas, courts, services, and education.
- **Headers:**
  - `Authorization` (string, required): `Bearer <lawyer_access_token>`
- **Security:** Requires `LAWYER` role.
- **Responses:**
  - `200 OK`: Lawyer profile retrieved successfully.
    ```json
    {
      "id": "lawyer-profile-uuid",
      "name": "Jane Lawyer",
      "photo": "url/to/jane_lawyer.jpg",
      "location": "San Francisco, CA",
      "experience": 8,
      "bio": "Experienced corporate lawyer with a focus on startups.",
      "consultFee": 350,
      "barId": "CA123456",
      "isVerified": true,
      "registrationPending": false,
      "userId": "user-uuid-for-lawyer",
      "specializationId": "practice-area-uuid-corporate",
      "primaryCourtId": "court-uuid-sf-superior",
      "createdAt": "2023-11-01T00:00:00Z",
      "updatedAt": "2024-03-15T00:00:00Z",
      "specialization": {
        "id": "practice-area-uuid-corporate",
        "name": "Corporate Law",
        "description": "Advising businesses on legal matters."
      },
      "primaryCourt": {
        "id": "court-uuid-sf-superior",
        "name": "San Francisco Superior Court",
        "location": "San Francisco"
      },
      "practiceAreas": [
        { "id": "pa-uuid-1", "name": "Corporate Law", "description": "..." },
        {
          "id": "pa-uuid-2",
          "name": "Intellectual Property",
          "description": "..."
        }
      ],
      "practiceCourts": [
        {
          "id": "pc-uuid-1",
          "name": "San Francisco Superior Court",
          "location": "SF"
        }
      ],
      "services": [
        {
          "id": "serv-uuid-1",
          "name": "Contract Negotiation",
          "description": "..."
        }
      ],
      "education": {
        "id": "edu-uuid-1",
        "degree": "Juris Doctor",
        "institution": "Stanford Law School",
        "year": 2016
      }
    }
    ```
    The response body is a `LawyerProfileResponseDto` object.
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `LAWYER` role.
  - `404 Not Found`: Lawyer profile not found for the authenticated user.

### 4. Update Lawyer Profile

- **Endpoint:** `PUT /profiles/lawyer`
- **Description:** Updates the profile of the authenticated lawyer user. All fields are optional. For relational fields (specialization, primaryCourt, education), providing a string name can create or link to existing records.
- **Headers:**
  - `Authorization` (string, required): `Bearer <lawyer_access_token>`
- **Security:** Requires `LAWYER` role.
- **Request Body:** `application/json`
  ```json
  {
    "name": "Jane A. Lawyer, Esq.",
    "location": "Palo Alto, CA",
    "experience": 9,
    "bio": "Updated bio: Now also focusing on tech M&A.",
    "consultFee": 400,
    "specialization": "Technology Law",
    "primaryCourt": "Federal Court - Northern District of California",
    "education": {
      "degree": "LL.M. in Tech Law",
      "institution": "UC Berkeley School of Law",
      "year": 2017
    }
  }
  ```
  - `name` (string, optional, max 100 chars): Lawyer's name.
  - `photo` (string, optional, URL): Profile photo URL.
  - `location` (string, optional, max 255 chars): Lawyer's location.
  - `experience` (number, optional, min 0): Years of experience.
  - `bio` (string, optional, max 1000 chars): Professional biography.
  - `consultFee` (number, optional, min 0): Consultation fee.
  - `barId` (string, optional, max 50 chars): Bar registration ID.
  - `isVerified` (boolean, optional): Verification status.
  - `registrationPending` (boolean, optional): Registration pending status.
  - `specialization` (string, optional): Name of the primary specialization (e.g., "Technology Law"). If it exists, it's linked; otherwise, a new one might be created (service-dependent logic).
  - `primaryCourt` (string, optional): Name of the primary court. Similar logic to specialization.
  - `education` (object, optional): Education details.
    - `degree` (string, required within object): Degree obtained.
    - `institution` (string, required within object): Name of the institution.
    - `year` (number, required within object): Year of graduation.
- **Responses:**
  - `200 OK`: Lawyer profile updated successfully. Returns the updated `LawyerProfileResponseDto`.
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `LAWYER` role.
  - `404 Not Found`: Lawyer profile not found for the authenticated user.
  - `400 Bad Request`: Invalid input data (e.g., validation errors for fields).

## Upload Module

This module handles file uploads, primarily for images such as profile pictures. It integrates with a cloud storage service (e.g., Cloudinary) for persisting files.

### 1. Upload a General Image

- **Endpoint:** `POST /upload/image`
- **Description:** Uploads a general image file. The backend uploads the file to cloud storage and returns the URL. The application/frontend is responsible for storing or associating this URL as needed.
- **Request Type:** `multipart/form-data`
- **Request Body:**
  - `file` (file, required): The image file to upload (e.g., JPEG, PNG).
- **Responses:**
  - `201 Created`: Image uploaded successfully.
    ```json
    {
      "success": true,
      "message": "Image uploaded successfully. Note: The backend does not store this URL. Please handle URL storage in your application.",
      "data": {
        "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sample.jpg",
        "publicId": "sample_public_id"
      }
    }
    ```
    - `imageUrl` (string): The direct URL to the uploaded image.
    - `publicId` (string): The public ID of the image in the cloud storage, useful for transformations or deletion if supported.
  - `500 Internal Server Error`: Error during the upload process.

### 2. Upload Client Profile Picture

- **Endpoint:** `POST /upload/profile-pic/client`
- **Description:** Uploads a profile picture for the authenticated client user. The uploaded image URL is then associated with the client's profile.
- **Headers:**
  - `Authorization` (string, required): `Bearer <client_access_token>`
- **Security:** Requires `CLIENT` role.
- **Request Type:** `multipart/form-data`
- **Request Body:**
  - `file` (file, required): The image file to upload for the profile picture.
- **Responses:**
  - `201 Created`: Client profile picture updated successfully.
    ```json
    {
      "success": true,
      "message": "Client profile picture updated successfully",
      "data": {
        "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567891/client_profile.jpg",
        "publicId": "client_profile_public_id"
      }
    }
    ```
  - `400 Bad Request`: If the client profile is not found or the user is not a client (though role guard should prevent the latter).
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `CLIENT` role.
  - `500 Internal Server Error`: Error during the upload or profile update process.

### 3. Upload Lawyer Profile Picture

- **Endpoint:** `POST /upload/profile-pic/lawyer`
- **Description:** Uploads a profile picture for the authenticated lawyer user. The uploaded image URL is then associated with the lawyer's profile.
- **Headers:**
  - `Authorization` (string, required): `Bearer <lawyer_access_token>`
- **Security:** Requires `LAWYER` role.
- **Request Type:** `multipart/form-data`
- **Request Body:**
  - `file` (file, required): The image file to upload for the profile picture.
- **Responses:**
  - `201 Created`: Lawyer profile picture updated successfully.
    ```json
    {
      "success": true,
      "message": "Lawyer profile picture updated successfully",
      "data": {
        "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567892/lawyer_profile.jpg",
        "publicId": "lawyer_profile_public_id"
      }
    }
    ```
  - `400 Bad Request`: If the lawyer profile is not found or the user is not a lawyer (though role guard should prevent the latter).
  - `401 Unauthorized`: User not authenticated.
  - `403 Forbidden`: Authenticated user does not have the `LAWYER` role.
  - `500 Internal Server Error`: Error during the upload or profile update process.

This document provides a guide on how to use the various API endpoints exposed by the Advonex backend application.
