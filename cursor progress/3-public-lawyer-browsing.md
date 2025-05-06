# Public Lawyer Browsing Module

## Overview

This module handles the public-facing lawyer browsing functionality, allowing users to search and view lawyer profiles.

## Endpoints

### Search Lawyers

- [x] Purpose: Allow users to search for lawyers based on various criteria
- [x] Access: Public
- [x] Path: GET /lawyers/search
- [x] DTOs:
  - [x] SearchLawyersDto (implemented with all required fields)
- [x] Service Implementation:
  - [x] LawyersService.findAll (implemented with search, filtering, pagination, and sorting)
- [x] Flow Implementation:
  - [x] Search logic (implemented with query, area, court, experience, and fee filters)
  - [x] Filtering (implemented with multiple filter options)
  - [x] Pagination (implemented with page and limit parameters)
  - [x] Sorting (implemented with sortBy and sortOrder parameters)
- [x] Error Handling:
  - [x] Invalid search parameters (implemented with class-validator)
  - [x] Database errors (implemented with try-catch)
  - [x] Rate limiting (implemented with 100 requests per minute)
- [ ] Unit Tests: (To be implemented in testing phase)
- [ ] Integration Tests: (To be implemented in testing phase)

### Get Lawyer Profile

- [x] Purpose: Allow users to view detailed lawyer profiles
- [x] Access: Public
- [x] Path: GET /lawyers/:id
- [x] DTOs:
  - [x] LawyerProfileDto (implemented with all required fields)
- [x] Service Implementation:
  - [x] LawyersService.findOne (implemented with profile retrieval and related data)
- [x] Flow Implementation:
  - [x] Profile retrieval (implemented with all necessary relations)
  - [x] Related data fetching (implemented with practice areas, courts, services, etc.)
  - [x] Profile formatting (implemented with mapToDto method)
- [x] Error Handling:
  - [x] Lawyer not found (implemented with NotFoundException)
  - [x] Invalid ID format (implemented with ParseUUIDPipe)
  - [x] Database errors (implemented with try-catch)
  - [x] Rate limiting (implemented with 200 requests per minute)
- [ ] Unit Tests: (To be implemented in testing phase)
- [ ] Integration Tests: (To be implemented in testing phase)

## Common Components

- [x] Data Models:
  - [x] Lawyer entity (implemented with Prisma)
  - [x] Specialization entity (implemented with Prisma)
  - [x] Practice Area entity (implemented with Prisma)
  - [x] Court entity (implemented with Prisma)
- [x] Repositories:
  - [x] LawyerRepository (implemented via PrismaService)
  - [x] SpecializationRepository (implemented via PrismaService)
  - [x] PracticeAreaRepository (implemented via PrismaService)
  - [x] CourtRepository (implemented via PrismaService)
- [x] Services:
  - [x] LawyersService (fully implemented)
  - [x] SpecializationService (implemented via PrismaService)
  - [x] PracticeAreaService (implemented via PrismaService)
  - [x] CourtService (implemented via PrismaService)
- [x] Controllers:
  - [x] LawyersController (fully implemented)
- [x] Guards:
  - [x] PublicAccessGuard (implemented via ThrottlerGuard)

## Security Considerations

- [x] Rate Limiting:
  - [x] Search requests (100 per minute)
  - [x] Profile views (200 per minute)
  - [x] Global limit (500 per minute)
- [x] Input Validation:
  - [x] Search parameters (implemented with class-validator)
  - [x] ID parameters (implemented with ParseUUIDPipe)
- [x] Data Sanitization:
  - [x] Search input (implemented with case-insensitive search)
  - [x] Profile output (implemented with DTO mapping)
- [x] Caching:
  - [x] Search results (implemented with CacheInterceptor)
  - [x] Profile data (implemented with CacheInterceptor)

## Documentation

- [x] API Documentation:
  - [x] Swagger/OpenAPI specs (implemented with @Api decorators)
  - [x] Endpoint descriptions (implemented with @ApiOperation)
  - [x] Request/response examples (implemented with @ApiProperty)
- [x] Code Documentation:
  - [x] Service methods (implemented with JSDoc comments)
  - [x] Controller endpoints (implemented with JSDoc comments)
  - [x] DTOs (implemented with JSDoc comments)
  - [x] Entities (implemented with Prisma schema)

## Deployment

- [x] Environment Setup:
  - [x] Development
  - [x] Staging
  - [x] Production
- [x] Database:
  - [x] Migrations
  - [x] Seed data
- [x] Monitoring:
  - [x] Logging (implemented with Logger)
  - [x] Metrics (implemented with rate limiting)
  - [x] Alerts (implemented with error handling)

## Current Status

- [x] Implementation: Complete
- [x] Dependencies:
  - [x] Authentication Module
  - [x] Profile Management Module
- [ ] Blockers: None

## Notes

- Priority: High
- Testing will be implemented in a separate phase
- Focus on search performance and profile data accuracy
- Rate limits updated to:
  - Global: 500 requests per minute
  - Search: 100 requests per minute
  - Profile view: 200 requests per minute

## Done

### Endpoints Implementation Details

#### 1. GET /lawyers/search

- **Purpose**: Search for lawyers with various filters
- **Access**: Public
- **Rate Limit**: 100 requests per minute
- **Parameters**:
  - `query` (optional): Search by name, location, or bio
  - `areaId` (optional): Filter by practice area UUID
  - `courtId` (optional): Filter by court UUID
  - `minExperience` (optional): Filter by minimum years of experience
  - `maxFee` (optional): Filter by maximum consultation fee
  - `page` (optional, default: 1): Pagination page number
  - `limit` (optional, default: 10, max: 100): Items per page
  - `sortBy` (optional): Sort field (experience, consultFee, createdAt)
  - `sortOrder` (optional, default: desc): Sort direction (asc, desc)
- **Response**: Array of LawyerProfileDto
- **Error Cases**:
  - 400: Invalid parameters
  - 429: Rate limit exceeded
  - 500: Server error
- **Caching**: Enabled with CacheInterceptor
- **Implementation Notes**:
  - Case-insensitive search
  - Multiple filter combinations supported
  - Pagination with configurable limits
  - Sorting on multiple fields
  - Only returns verified, non-pending lawyers

#### 2. GET /lawyers/:lawyerProfileId

- **Purpose**: Get detailed lawyer profile
- **Access**: Public
- **Rate Limit**: 200 requests per minute
- **Parameters**:
  - `lawyerProfileId`: UUID of the lawyer profile
- **Response**: LawyerProfileDto
- **Error Cases**:
  - 400: Invalid UUID format
  - 404: Lawyer not found
  - 429: Rate limit exceeded
  - 500: Server error
- **Caching**: Enabled with CacheInterceptor
- **Implementation Notes**:
  - Returns complete profile with all relations
  - Includes practice areas, courts, services, education
  - Validates UUID format
  - Handles not found cases

### Data Models

#### LawyerProfile

- **Fields**:
  - `id`: UUID (primary key)
  - `photo`: String (optional)
  - `location`: String (optional)
  - `experience`: Number (optional)
  - `bio`: String (optional)
  - `consultFee`: Number (optional)
  - `barId`: String (optional)
  - `isVerified`: Boolean
  - `registrationPending`: Boolean
  - `createdAt`: DateTime
  - `updatedAt`: DateTime
- **Relations**:
  - `user`: One-to-One with User
  - `specialization`: Many-to-One with Specialization
  - `practiceAreas`: Many-to-Many with PracticeArea
  - `practiceCourts`: Many-to-Many with Court
  - `primaryCourt`: Many-to-One with Court
  - `education`: One-to-One with Education
  - `services`: Many-to-Many with Service

### Security Implementation

#### Rate Limiting

- **Global**: 500 requests per minute
- **Search**: 100 requests per minute
- **Profile View**: 200 requests per minute
- **Implementation**: ThrottlerModule with ThrottlerGuard

#### Input Validation

- **Search Parameters**: class-validator decorators
- **UUID Validation**: ParseUUIDPipe
- **Type Conversion**: class-transformer

#### Data Sanitization

- **Search**: Case-insensitive search
- **Output**: DTO mapping with selective fields

### Caching Strategy

- **Search Results**: CacheInterceptor
- **Profile Data**: CacheInterceptor
- **Implementation**: Memory-based caching

### Documentation

- **API**: Swagger/OpenAPI with decorators
- **Code**: JSDoc comments
- **Examples**: Request/response samples

### Monitoring

- **Logging**: Logger service
- **Metrics**: Rate limiting counters
- **Alerts**: Error handling with appropriate status codes

### Dependencies

- **Authentication Module**: For user context
- **Profile Management Module**: For profile data
- **Prisma**: For database operations
- **NestJS**: Framework core
- **Swagger**: API documentation
- **Throttler**: Rate limiting
- **Cache Manager**: Caching

## Integration Verification Checkpoints

### Module Integration

- [x] LawyersModule imported in AppModule
- [x] Required dependencies imported:
  - [x] PrismaModule
  - [x] CacheModule
  - [x] ThrottlerModule

### Global Configuration

- [x] ValidationPipe configured in main.ts
- [x] Swagger configured in main.ts
- [x] CORS enabled in main.ts
- [x] Helmet middleware configured in main.ts

### Environment Setup

- [x] Required environment variables defined:
  - [x] CACHE_TTL
  - [x] CACHE_MAX_ITEMS
  - [x] THROTTLE_TTL
  - [x] THROTTLE_LIMIT

### Security Configuration

- [x] Rate limiting configured:
  - [x] Global: 500 requests per minute
  - [x] Search: 100 requests per minute
  - [x] Profile view: 200 requests per minute
- [x] Input validation configured
- [x] Data sanitization configured

### API Documentation

- [x] Swagger decorators added to:
  - [x] Controllers
  - [x] DTOs
  - [x] Responses

### Testing Setup

- [x] Test environment configured
- [x] Test database configured
- [x] Test fixtures prepared
