# Seed Data Changes Propagation Instructions

This document outlines the changes needed across the project to accommodate the updated seed data structure.

## 1. Database Schema Changes

### 1.1. Update Prisma Schema

The `prisma/schema.prisma` file needs to be updated to:

1. Change the `Education` model relationship with `Lawyer` from many-to-one to one-to-one
2. Add the new `PracticeCourt` model with one-to-one relationship to `Lawyer`

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

  user          User     @relation(fields: [userId], references: [id])
  userId        String   @unique
  education     Education?
  practiceCourt PracticeCourt?
}

model Education {
  id          String @id @default(uuid())
  degree      String
  institution String
  year        String

  lawyer      Lawyer @relation(fields: [lawyerId], references: [id], onDelete: Cascade)
  lawyerId    String @unique
}

model PracticeCourt {
  id          String  @id @default(uuid())
  primary     String
  secondary   String?

  lawyer      Lawyer  @relation(fields: [lawyerId], references: [id], onDelete: Cascade)
  lawyerId    String  @unique
}

## 2. Seed Script Changes
### 2.1. Update prisma/seed.ts
The seed script needs to be updated to handle the new data structure:

```typescript
// Update the education creation part
// Instead of looping through an array of education records:
const education = await prisma.education.create({
  data: {
    degree: lawyerData.education.degree,
    institution: lawyerData.education.institution,
    year: lawyerData.education.year,
    lawyerId: lawyer.id,
  },
});

// Add creation of practice court records
await prisma.practiceCourt.create({
  data: {
    primary: lawyerData.practiceCourts.primary,
    secondary: lawyerData.practiceCourts.secondary,
    lawyerId: lawyer.id,
  },
});
 ```
```

## 3. API DTOs and Service Changes
### 3.1. Update Lawyer DTOs
The DTOs in src/lawyers/dto/lawyer.dto.ts need to be updated:

```typescript
// Update EducationDto to match new structure
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

// Add new PracticeCourtDto
export class PracticeCourtDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  primary: string;

  @ApiProperty({ required: false, nullable: true })
  secondary?: string;
}

// Update LawyerDetailsDto to include practiceCourt
export class LawyerDetailsDto extends LawyerDto {
  // ... existing fields
  
  @ApiProperty()
  education: EducationDto;

  @ApiProperty()
  practiceCourt: PracticeCourtDto;
}
 ```
```

### 3.2. Update Lawyer Service
The src/lawyers/lawyers.service.ts file needs to be updated to include the practice court data:

```typescript
async findOne(id: string): Promise<LawyerDetailsDto> {
  const lawyer = await this.prisma.lawyer.findUnique({
    where: { id },
    include: {
      education: true,
      practiceCourt: true,
    },
  });

  if (!lawyer) {
    throw new NotFoundException(`Lawyer with ID ${id} not found`);
  }

  return lawyer as unknown as LawyerDetailsDto;
}
 ```
```

## 4. Update Implementation Guide
The bkndPrompt-and-Instructions-P1.md file needs to be updated to reflect these changes::

1. Update the Lawyer model in Prisma schema section
2. Add the PracticeCourt model
3. Update the Education model relationship
4. Update the seed script example
5. Update the DTO examples
## 5. Migration Steps
After implementing these changes:

1. Delete existing migrations or reset the database
2. Create a new migration:
   ```bash
   npx prisma migrate dev --name updated_lawyer_schema
    ```
   ```
3. Generate the updated Prisma client:
   ```bash
   npx prisma generate
    ```
4. Run the updated seed script:
   ```bash
   npx prisma db seed
    ```
```plaintext

This file outlines all the necessary changes to adapt the project to the updated seed data structure. Let me know if you'd like me to provide more specific code changes for any particular file.
 ```
```