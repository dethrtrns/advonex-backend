# Frontend Cheatsheet

## Authentication

### Login

```typescript
POST /auth/login
Body: { phoneNumber: string }
Response: { success: boolean, message: string }
```

### Verify OTP

```typescript
POST /auth/verify-otp
Body: { phoneNumber: string, otp: string }
Response: {
  success: boolean,
  data: {
    accessToken: string,
    refreshToken: string,
    user: {
      id: string,
      phoneNumber: string,
      role: string,
      profileId: string
    }
  }
}
```

### Refresh Token

```typescript
POST /auth/refresh-token
Body: { refreshToken: string }
Response: {
  success: boolean,
  data: {
    accessToken: string,
    refreshToken: string
  }
}
```

## Lawyer Features

### Get Dashboard

```typescript
GET /lawyer/dashboard
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: {
    profile: {
      name: string,
      photo?: string,
      specialization?: string,
      primaryCourt?: string,
      rating: number
    },
    statistics: {
      totalRequests: number,
      pendingRequests: number,
      acceptedRequests: number,
      rejectedRequests: number,
      averageResponseTime: number
    },
    recentActivity: {
      recentRequests: Array<{
        id: string,
        clientProfile: {
          name: string,
          photo?: string
        },
        message: string,
        status: string,
        responseStatus: string,
        createdAt: Date
      }>,
      recentResponses: Array<{
        id: string,
        clientProfile: {
          name: string,
          photo?: string
        },
        message: string,
        response: string,
        responseTimestamp: Date
      }>,
      lastLogin: Date
    },
    quickActions: {
      pendingRequestsCount: number,
      viewAllRequestsUrl: string,
      updateProfileUrl: string
    }
  }
}
```

### Get Consultation Requests

```typescript
GET /lawyer/consultation-requests
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: boolean,
  data: {
    requests: Array<{
      id: string,
      clientProfile: {
        name: string,
        photo?: string
      },
      message: string,
      status: string,
      responseStatus: string,
      response?: string,
      responseReason?: string,
      createdAt: Date,
      updatedAt: Date,
      responseTimestamp?: Date
    }>,
    total: number,
    pending: number,
    accepted: number,
    rejected: number
  }
}
```

## File Upload

### Upload General Image

```typescript
POST /upload/image
Headers: {
  Authorization: 'Bearer <token>',
  'Content-Type': 'multipart/form-data'
}
Body: FormData {
  file: File // jpg, jpeg, png, gif, max 10MB
}
Response: {
  success: boolean,
  data: {
    imageUrl: string,
    publicId: string
  }
}
```

### Upload Client Profile Picture

```typescript
POST /upload/profile-pic/client
Headers: {
  Authorization: 'Bearer <token>',
  'Content-Type': 'multipart/form-data'
}
Body: FormData {
  file: File, // jpg, jpeg, png, gif, max 10MB
  userId: string
}
Response: {
  success: boolean,
  data: {
    imageUrl: string,
    publicId: string
  }
}
```

### Upload Lawyer Profile Picture

```typescript
POST /upload/profile-pic/lawyer
Headers: {
  Authorization: 'Bearer <token>',
  'Content-Type': 'multipart/form-data'
}
Body: FormData {
  file: File, // jpg, jpeg, png, gif, max 10MB
  userId: string
}
Response: {
  success: boolean,
  data: {
    imageUrl: string,
    publicId: string
  }
}
```

## Error Handling

All endpoints follow a consistent error response format:

```typescript
{
  statusCode: number,
  message: string,
  error?: string
}
```

Common error codes:

- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server-side error)

## Notes

1. All endpoints except login require the Authorization header with a valid JWT token
2. File uploads are limited to 10MB and support jpg, jpeg, png, and gif formats
3. Profile picture uploads require the user to exist and have the correct role
4. All timestamps are in ISO 8601 format
5. Image URLs are secure HTTPS URLs from Cloudinary
