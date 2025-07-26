# Plan: Location Schema Update

This plan outlines the necessary changes to align the Advonex backend with the new, structured location schema. The previous `location` string field has been replaced by a relational model including `Country`, `State`, `City`, and `Location` entities.

## 1. DTO Updates

The following Data Transfer Objects (DTOs) need to be updated to remove the deprecated `location` string and, where appropriate, include the new relational location data.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\client\dto\consultation-request-response.dto.ts`**
  - [ ] Remove `location: string | null;` from the `lawyer` object.
  - [ ] Add a `location` object that conforms to the new `Location` model, including nested `City`, `State`, and `Country` data.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\client\dto\saved-lawyer.dto.ts`**
  - [ ] Remove `location: string | null;` from the `lawyer` object.
  - [ ] Add a `location` object that conforms to the new `Location` model.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\lawyers\dto\lawyer-profile.dto.ts`**
  - [ ] Remove `location: string | null;`.
  - [ ] Add a `location` object that conforms to the new `Location` model.
  - [ ] Update the `primaryCourt` object to include the new `location` object.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\profiles\dto\lawyer-profile-response.dto.ts`**
  - [ ] Remove `location: string | null;`.
  - [ ] Add `locationId: string | null;`.
  - [ ] Add a `location` object that conforms to the new `Location` model.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\profiles\dto\practice-court.dto.ts`**
  - [ ] Remove `location: string;`.
  - [ ] Add `locationId: string | null;`.
  - [ ] Add a `location` object that conforms to the new `Location` model.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\profiles\dto\update-lawyer-profile.dto.ts`**
  - [ ] Remove `location?: string | null;`.
  - [ ] Add a `location` object that allows for updating the location details. This should include fields like `cityId`, `address`, etc.

## 2. Service Logic Updates

The service layer needs to be updated to handle the new relational location data.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\client\client.service.ts`**
  - [ ] In `getSavedLawyers` and `getConsultationRequests`, update the `include` statement in the Prisma query to fetch the new `location` relation with its nested `city`, `state`, and `country`.
  - [ ] Update the mapping logic to correctly populate the new `location` object in the response DTOs.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\lawyers\lawyers.service.ts`**
  - [ ] In `findAll` and `findOne`, update the `include` statement to fetch the `location` relation.
  - [ ] Update the `mapToDto` function to correctly handle the new `location` object.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\profiles\profiles.service.ts`**
  - [ ] In `updateLawyerProfile`, remove the direct update of the `location` string.
  - [ ] Implement logic to handle the creation or update of a `Location` record when the lawyer's profile is updated. This may involve creating a new `Location` or updating an existing one.
  - [ ] In `findOrCreatePracticeCourt`, remove the hardcoded `location` string and instead associate the court with a `locationId` if provided.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\static-data\static-data.service.ts`**
  - [ ] In `findAllCourts`, update the `include` statement to fetch the `location` relation.

## 3. Seeding Script Updates

The database seeding script needs to be updated to populate the new location tables and link them correctly.

- **`c:\Users\alexr\Desktop\aified\advonex-backend\prisma\seed.ts`**
  - [ ] Ensure the `locations` data in `seedData.ts` is correctly structured.
  - [ ] Update the seeding logic for `LawyerProfile` and `PracticeCourt` to use `locationId` instead of a `location` string.

## 4. Controller Updates

- **`c:\Users\alexr\Desktop\aified\advonex-backend\src\static-data\static-data.controller.ts`**
  - [ ] No direct changes are needed here, but the response from `findAllCourts` will now include the `location` object. Ensure the Swagger documentation reflects this.

Once you approve this plan, I will proceed with the implementation of these changes.
