import { PrismaClient } from '@prisma/client';
import {
  practiceAreas,
  practiceCourts,
  services,
  users,
  clientProfiles,
  lawyerProfiles,
  educations,
  lawyerPracticeAreas,
  lawyerPracticeCourts,
  lawyerServices,
  savedLawyers,
  consultationRequests,
} from '../src/data/seedData'; // Adjusted import path

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Clear existing data (reverse order of dependency) ---
  console.log('Clearing existing data...');
  await prisma.consultationRequest.deleteMany();
  await prisma.savedLawyer.deleteMany();
  await prisma.lawyerService.deleteMany();
  await prisma.lawyerPracticeCourt.deleteMany();
  await prisma.lawyerPracticeArea.deleteMany();
  await prisma.education.deleteMany();
  // Profiles depend on Users, but also have relations pointing *to* them.
  // Delete profiles first, then the user they link to.
  await prisma.lawyerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();
  // Predefined lists can be deleted after profiles/users
  await prisma.service.deleteMany();
  await prisma.practiceCourt.deleteMany();
  await prisma.practiceArea.deleteMany();
  // OTPs are transient, clear them too if needed
  await prisma.otp.deleteMany();
  console.log('Existing data cleared.');

  // --- Seed Predefined Lists ---
  console.log('Seeding predefined lists...');
  await prisma.practiceArea.createMany({ data: practiceAreas });
  await prisma.practiceCourt.createMany({ data: practiceCourts });
  await prisma.service.createMany({ data: services });
  console.log('Predefined lists seeded.');

  // --- Seed Users ---
  console.log('Seeding users...');
  // Need to handle potential DateTime fields if defaults aren't sufficient

  
  const userData = users.map((user) => ({
    ...user,
    // Ensure createdAt/updatedAt are handled if not defaulted by Prisma/DB
  }));
  await prisma.user.createMany({ data: userData });
  console.log('Users seeded.');

  // --- Seed Profiles ---
  console.log('Seeding profiles...');
  await prisma.clientProfile.createMany({ data: clientProfiles });
  // Lawyer profiles might need adjustments if fields aren't nullable or defaulted
  const lawyerProfileData = lawyerProfiles.map((profile) => ({
    ...profile,
    // Ensure optional fields are handled correctly (e.g., consultFee might need default or explicit null)
    consultFee: profile.consultFee ?? null, // Example: handle optional Int
  }));
  await prisma.lawyerProfile.createMany({ data: lawyerProfileData });
  console.log('Profiles seeded.');

  // --- Seed Lawyer Details (Education) ---
  console.log('Seeding education...');
  // Explicitly pick only the fields needed for the Education model
  const educationData = educations.map((edu) => ({
    id: edu.id,
    lawyerProfileId: edu.lawyerProfileId,
    institution: edu.institution,
    degree: edu.degree,
    // Prisma expects Int for year based on schema
    year: edu.graduationYear, // Correctly maps graduationYear to year
  }));
  await prisma.education.createMany({ data: educationData });
  console.log('Education seeded.');

  // --- Seed Join Tables ---
  console.log('Seeding join tables...');
  await prisma.lawyerPracticeArea.createMany({ data: lawyerPracticeAreas });
  await prisma.lawyerPracticeCourt.createMany({ data: lawyerPracticeCourts });
  await prisma.lawyerService.createMany({ data: lawyerServices });
  console.log('Join tables seeded.');

  // --- Seed Interactions ---
  console.log('Seeding interactions...');
  await prisma.savedLawyer.createMany({ data: savedLawyers });
  await prisma.consultationRequest.createMany({ data: consultationRequests });
  console.log('Interactions seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
