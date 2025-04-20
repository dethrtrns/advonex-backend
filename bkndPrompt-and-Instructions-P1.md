# Advonex Backend Phase 1 Implementation Guide

This guide provides detailed instructions for implementing Phase 1 of the Advonex backend, which focuses on setting up the database with lawyer data and creating basic lawyer endpoints.

## Prerequisites

- Node.js (v16+) installed
- PostgreSQL installed and running
- Database 'advonex' created in PostgreSQL
- NestJS CLI installed globally (`npm i -g @nestjs/cli`)

## Phase 1: Lawyer Data Management

### 1. Database Setup

#### 1.1. Setup and initialize Prisma

1. Install Prisma dependencies:

```bash
npm install -D prisma
npm install @prisma/client
```

2. Initialize Prisma:

```bash
npx prisma init
```

3. Configure the database connection in `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/advonex?schema=public"
```

(Replace with your actual PostgreSQL credentials)

#### 1.2. Create Lawyer model in Prisma schema

1. Update the `prisma/schema.prisma` file with the Lawyer model:

```prisma
model Lawyer {
  id            String   @id @default(uuid())
  name          String
  photo         String?
  practiceAreas String[]
  location      String
  experience    Int
  email         String?
  phone         String?
  bio           String?
  consultFee    Int
  barId         String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  education     Education?
  practiceCourt PracticeCourt?
}

model Education {
  id          String @id @default(uuid())
  degree      String
  institution String
  year        String

  lawyer      Lawyer @relation(fields: [lawyerId], references: [id], onDelete: Cascade)
  lawyerId    String  @unique
}

model PracticeCourt {
  id          String  @id @default(uuid())
  primary     String
  secondary   String?

  lawyer      Lawyer  @relation(fields: [lawyerId], references: [id], onDelete: Cascade)
  lawyerId    String  @unique
}
```

#### 1.3. Create User model with authentication fields

1. Add the User model to the schema:

```prisma
model User {
  id          String   @id @default(uuid())
  phoneNumber String   @unique
  name        String?
  email       String?  @unique
  role        Role     @default(CLIENT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  CLIENT
  LAWYER
  ADMIN
}
```

#### 1.4. Add relations between User and Lawyer models

1. Update the schema to add relations:

```prisma
model User {
  id          String   @id @default(uuid())
  phoneNumber String   @unique
  name        String?
  email       String?  @unique
  role        Role     @default(CLIENT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lawyer      Lawyer?
}

model Lawyer {
  id            String   @id @default(uuid())
  name          String
  photo         String?
  practiceAreas String[]
  location      String
  experience    Int
  email         String?
  phone         String?
  bio           String?
  consultFee    Int
  barId         String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
  userId        String   @unique
  education     Education[]
}
```

#### 1.5. Migrate schema to PostgreSQL database

1. Create the migration:

```bash
npx prisma migrate dev --name init
```

2. Generate Prisma client:

```bash
npx prisma generate
```

### 2. Seed Data

#### 2.1. Create seed script to populate lawyer data

1. Create a new file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { mockLawyers } from '../src/data/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.education.deleteMany();
  await prisma.lawyer.deleteMany();
  await prisma.user.deleteMany();

  // Seed lawyers
  for (const lawyerData of Object.values(mockLawyers)) {
    // Create user first
    const user = await prisma.user.create({
      data: {
        phoneNumber: lawyerData.phone,
        name: lawyerData.name,
        email: lawyerData.email,
        role: 'LAWYER',
      },
    });

    // Create lawyer with reference to user
    const lawyer = await prisma.lawyer.create({
      data: {
        name: lawyerData.name,
        photo: lawyerData.photo,
        practiceAreas: lawyerData.practiceAreas,
        location: lawyerData.location,
        experience: lawyerData.experience,
        email: lawyerData.email,
        phone: lawyerData.phone,
        bio: lawyerData.bio,
        consultFee: lawyerData.consultFee,
        barId: lawyerData.barId,
        userId: user.id,
      },
    });

    // Create education records
    for (const edu of lawyerData.education) {
      await prisma.education.create({
        data: {
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          lawyerId: lawyer.id,
        },
      });
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 2.2. Import mock lawyer data from frontend

This is already done in the seed script by importing `mockLawyers` from the frontend's data folder.

#### 2.3. Run seed script to populate database

1. Update `package.json` to add the prisma seed script:

```json
{
  "scripts": {
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

2. Run the seed:

```bash
npx prisma db seed
```

### 3. Lawyer Endpoints

#### 3.1. Create NestJS module for lawyers

1. Generate a new module for lawyers:

```bash
nest g module lawyers
nest g controller lawyers
nest g service lawyers
```

2. Update `src/lawyers/lawyers.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { LawyersController } from './lawyers.controller';
import { LawyersService } from './lawyers.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LawyersController],
  providers: [LawyersService, PrismaService],
  exports: [LawyersService],
})
export class LawyersModule {}
```

3. Create Prisma service:

```bash
nest g module prisma
nest g service prisma
```

4. Update `src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### 3.2. Create DTO classes for API responses (using Prisma types where possible)

1. Create `src/lawyers/dto/lawyer.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Lawyer, Education } from '@prisma/client';

// Use Prisma-generated types as base types
export class EducationDto implements Partial<Education> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  degree: string;

  @ApiProperty()
  institution: string;

  @ApiProperty()
  year: string;
}

// For lawyers listing, we only need a subset of fields
export class LawyerDto implements Partial<Lawyer> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false, nullable: true })
  photo?: string;

  @ApiProperty({ type: [String] })
  practiceAreas: string[];

  @ApiProperty()
  location: string;

  @ApiProperty()
  experience: number;

  @ApiProperty()
  consultFee: number;
}

// For lawyer details, we extend the base type and add related data
export class LawyerDetailsDto extends LawyerDto {
  @ApiProperty({ required: false, nullable: true })
  email?: string;

  @ApiProperty({ required: false, nullable: true })
  phone?: string;

  @ApiProperty({ required: false, nullable: true })
  bio?: string;

  @ApiProperty()
  barId: string;

  @ApiProperty({ type: [EducationDto] })
  education: EducationDto[];
}

// Query parameters are not from Prisma types, so we define them as needed
export class LawyerQueryDto {
  @ApiProperty({ required: false })
  practiceArea?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  limit?: number;
}

// Response wrapper types
export class PaginationDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class LawyerResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: [LawyerDto] })
  data: LawyerDto[];

  @ApiProperty()
  pagination: PaginationDto;
}

export class LawyerDetailsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: LawyerDetailsDto;
}
```

#### 3.3. Implement GET /api/lawyers endpoint with filtering capability

1. Update `src/lawyers/lawyers.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lawyer } from '@prisma/client'; // Import Prisma-generated types
import { LawyerDto, LawyerDetailsDto, PaginationDto } from './dto/lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceArea?: string,
    location?: string,
    page = 1,
    limit = 10,
  ): Promise<{ lawyers: LawyerDto[]; pagination: PaginationDto }> {
    const where = {};

    if (practiceArea) {
      where['practiceAreas'] = {
        has: practiceArea,
      };
    }

    if (location) {
      where['location'] = {
        contains: location,
        mode: 'insensitive',
      };
    }

    const total = await this.prisma.lawyer.count({ where });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Using Prisma to get lawyer data with specific fields
    const lawyers = await this.prisma.lawyer.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        photo: true,
        practiceAreas: true,
        location: true,
        experience: true,
        consultFee: true,
      },
    });

    return {
      lawyers: lawyers as LawyerDto[], // Cast to DTO type since fields match
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
```

2. Update `src/lawyers/lawyers.controller.ts`:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LawyerResponseDto, LawyerQueryDto } from './dto/lawyer.dto';

@ApiTags('lawyers')
@Controller('api/lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of lawyers with filters' })
  @ApiQuery({ name: 'practiceArea', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ type: LawyerResponseDto })
  async findAll(@Query() query: LawyerQueryDto) {
    const { practiceArea, location, page = 1, limit = 10 } = query;
    const { lawyers, pagination } = await this.lawyersService.findAll(
      practiceArea,
      location,
      +page,
      +limit,
    );

    return {
      success: true,
      data: lawyers,
      pagination,
    };
  }
}
```

#### 3.4. Implement GET /api/lawyers/:id endpoint for lawyer details

1. Update `src/lawyers/lawyers.service.ts` to add:

```typescript
import { NotFoundException } from "@nestjs/common";
import { Lawyer, Education } from "@prisma/client"; // Import Prisma-generated types

async findOne(id: string): Promise<LawyerDetailsDto> {
  // Use Prisma to get data with included relationships
  const lawyer = await this.prisma.lawyer.findUnique({
    where: { id },
    include: {
      education: true,
    },
  });

  if (!lawyer) {
    throw new NotFoundException(`Lawyer with ID ${id} not found`);
  }

  // Return the data as LawyerDetailsDto (the types already match)
  return lawyer as unknown as LawyerDetailsDto;
}
```

2. Update `src/lawyers/lawyers.controller.ts` to add:

```typescript
import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { LawyerResponseDto, LawyerQueryDto, LawyerDetailsResponseDto } from './dto/lawyer.dto';

// ... existing code

@Get(':id')
@ApiOperation({ summary: 'Get lawyer details by ID' })
@ApiParam({ name: 'id', description: 'Lawyer ID' })
@ApiResponse({ type: LawyerDetailsResponseDto })
async findOne(@Param('id') id: string) {
  try {
    const lawyer = await this.lawyersService.findOne(id);
    return {
      success: true,
      data: lawyer,
    };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException('Error fetching lawyer details');
  }
}
```

3. Make sure to add the import for InternalServerErrorException:

```typescript
import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
```

#### 3.5. Test endpoints with Swagger

1. Install Swagger dependencies:

```bash
npm install @nestjs/swagger swagger-ui-express
```

2. Configure Swagger in `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Advonex API')
    .setDescription('The Advonex API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3003;
}
bootstrap();
```

3. Start the server and test:

```bash
npm run start:dev
```

4. Visit http://localhost:3000/api-docs to test your API endpoints using Swagger UI

<!--
temp prompt: Remember that right now for this project our single source of truth is the seedData.ts file, any changes here should propagate throughout the project.
I've updates/changed the seed/mock data. According to these changes show me what needs to be changes/update/modified/added to the bkndPrompt-and-Instructions-P1.md file, and in the whole project(current workspace-all files-schema, code file, etc., anything that needs to be updated to reflect the new seeddata changes).
old seed data:
new seed data:



DO NOT IMPLEMENT ANYTHING UNTIL I SAY- "GO DO IT". JUST SHOW ME WHAT NEEDS TO CHANGE. DO NOT SHOW WHOLE FILE/CODE, JUST THE CHANGE NEEDED AND WHERE.

I need to update my Advonex backend project to accommodate changes in the seed data structure. The changes include:

1. The education field changed from an array to a single object
2. A new practiceCourts field with primary and optional secondary properties was added
3. The practiceAreas array now contains only one practice area per lawyer

Please implement the following changes:

1. Update the Prisma schema in prisma/schema.prisma:
   - Change Education model relationship with Lawyer from many-to-one to one-to-one
   - Add a new PracticeCourt model with one-to-one relationship to Lawyer

2. Update the seed script in prisma/seed.ts:
   - Modify education creation to handle a single education object instead of an array
   - Add creation of practice court records

3. Update the DTOs in src/lawyers/dto/lawyer.dto.ts:
   - Update EducationDto to match new structure
   - Add new PracticeCourtDto
   - Update LawyerDetailsDto to include practiceCourt

4. Update the Lawyer service in src/lawyers/lawyers.service.ts:
   - Include practice court data in the findOne method

5. Update the implementation guide in bkndPrompt-and-Instructions-P1.md to reflect these changes

After making these changes, I'll need to:
1. Delete existing migrations or reset the database
2. Create a new migration with "npx prisma migrate dev --name updated_lawyer_schema"
3. Generate the updated Prisma client
4. Run the updated seed script

Please implement these changes one by one, showing me the updated code for each file.
 -->
