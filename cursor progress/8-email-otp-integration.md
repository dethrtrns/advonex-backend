# Email OTP Integration Progress Tracking

## Overview

This document tracks the progress of integrating email-based OTP authentication using Resend.com while maintaining existing SMS functionality.

## Environment Setup

- [x] Add Resend environment variables
  - [x] `RESEND_API_KEY`
  - [x] `RESEND_FROM_EMAIL` = `auth@advonex.ai-fied.com`
- [x] Update environment validation
- [x] Update documentation

## Dependencies

- [x] Install Resend SDK
  ```bash
  pnpm install resend
  ```
- [x] Install date-fns
  ```bash
  pnpm install date-fns
  ```
- [x] Install @nestjs/schedule
  ```bash
  pnpm install @nestjs/schedule
  ```

## Data Models

### Email OTP Model

- [x] Create new model or extend existing OTP model
  - [x] email: string
  - [x] otp: string
  - [x] expiresAt: DateTime
  - [x] isUsed: boolean
  - [x] createdAt: DateTime
  - [x] updatedAt: DateTime
- [x] Add Prisma schema
- [x] Generate migration
- [x] Update seed data if needed

## DTOs

### Request OTP DTOs

- [x] Create EmailOtpRequestDto
  ```typescript
  {
    email: string;
  }
  ```
- [x] Create UnifiedOtpRequestDto
  ```typescript
  {
    email?: string;
    phoneNumber?: string;
  }
  ```

### Verify OTP DTOs

- [x] Create EmailOtpVerifyDto
  ```typescript
  {
    email: string;
    otp: string;
  }
  ```
- [x] Create UnifiedOtpVerifyDto
  ```typescript
  {
    email?: string;
    phoneNumber?: string;
    otp: string;
  }
  ```

## Services

### Resend Service

- [x] Create ResendService
  - [x] Initialize Resend client
  - [x] Send OTP email method
  - [x] Error handling
  - [x] Logging

### Auth Service Updates

- [x] Add email OTP generation
- [x] Add email OTP verification
- [x] Add unified OTP request handler
- [x] Add unified OTP verify handler
- [x] Maintain SMS OTP functionality
- [x] Add OTP expiration (5 minutes)
- [x] Add cleanup for expired OTPs
- [x] Add rate limiting (5 requests/hour)
- [x] Add email domain validation
- [x] Add monitoring metrics

## Controllers

### Auth Controller Updates

- [x] Add email OTP request endpoint
  ```typescript
  POST / auth / request - otp - email;
  ```
- [x] Add email OTP verify endpoint
  ```typescript
  POST / auth / verify - otp - email;
  ```
- [x] Add unified OTP request endpoint
  ```typescript
  POST / auth / request - otp;
  ```
- [x] Add unified OTP verify endpoint
  ```typescript
  POST / auth / verify - otp;
  ```

## Email Templates

- [x] Create OTP email template
  - [x] HTML version
  - [x] Plain text version
  - [x] Branding
  - [x] OTP display
  - [x] Expiration notice
  - [x] Security notice

## Testing

### Unit Tests

- [ ] ResendService tests
- [ ] AuthService email OTP tests
- [ ] Unified OTP handler tests
- [ ] DTO validation tests

### Integration Tests

- [ ] Email OTP request flow
- [ ] Email OTP verification flow
- [ ] Unified OTP flow
- [ ] Expiration tests

### E2E Tests

- [ ] Complete email authentication flow
- [ ] Unified authentication flow

## Documentation

- [x] Update API documentation
- [x] Update environment setup guide
- [x] Update authentication flow documentation
- [x] Add email OTP troubleshooting guide

## Security Considerations

- [x] Rate limiting for email OTP requests
- [ ] IP-based throttling
- [x] Email domain validation
- [x] OTP reuse prevention
- [x] Brute force protection

## Monitoring

- [x] Add email delivery tracking
- [x] Add OTP usage metrics
- [x] Add error rate monitoring
- [x] Add performance monitoring

## Notes

- Current Status: In Progress
- Priority: High
- Dependencies:
  - Resend.com API
  - Existing Auth Service
  - Prisma
- Blockers: None
- Important: Maintain backward compatibility with SMS OTP

## Authentication Flow

### Email OTP Flow

1. User enters email address
2. System validates email domain
3. System checks rate limit
4. System generates 6-digit OTP
5. System stores OTP with 5-minute expiration
6. System sends OTP via email
7. User enters OTP
8. System verifies OTP
9. System generates JWT tokens
10. User is authenticated

### Unified OTP Flow

1. User enters email or phone number
2. System determines authentication method
3. System follows respective OTP flow
4. System generates JWT tokens
5. User is authenticated

## Testing Instructions

### Testing Email OTP in Swagger

1. Open Swagger UI at `/api`
2. Navigate to Authentication section
3. Test Email OTP Flow:

   - Use `POST /auth/request-otp-email` with:
     ```json
     {
       "email": "your.email@example.com"
     }
     ```
   - Check email for OTP
   - Use `POST /auth/verify-otp-email` with:
     ```json
     {
       "email": "your.email@example.com",
       "otp": "123456"
     }
     ```
   - Verify JWT tokens are returned

4. Test Unified OTP Flow:

   - Use `POST /auth/request-otp` with:
     ```json
     {
       "email": "your.email@example.com"
     }
     ```
   - Check email for OTP
   - Use `POST /auth/verify-otp` with:
     ```json
     {
       "email": "your.email@example.com",
       "otp": "123456"
     }
     ```
   - Verify JWT tokens are returned

5. Test Rate Limiting:

   - Make 5 requests within an hour
   - Verify 6th request returns 429 status

6. Test Domain Validation:

   - Try with unsupported email domain
   - Verify 400 status with error message

7. Test OTP Expiration:
   - Request OTP
   - Wait 5 minutes
   - Try to verify
   - Verify 401 status
