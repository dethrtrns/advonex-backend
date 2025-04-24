import { PrismaClient } from '@prisma/client';
import { mockLawyers } from '../src/data/seedData';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking if seeding is needed...');
  
  // Check if data already exists
  const userCount = await prisma.user.count();
  
  if (userCount > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }
  
  console.log('Seeding database...');
  
  // Clear existing data (only needed for fresh databases)
  await prisma.practiceCourt.deleteMany();
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

    // Create education record (now a single object instead of an array)
    await prisma.education.create({
      data: {
        degree: lawyerData.education.degree,
        institution: lawyerData.education.institution,
        year: lawyerData.education.year,
        lawyerId: lawyer.id,
      },
    });

    // Create practice court record
    await prisma.practiceCourt.create({
      data: {
        primary: lawyerData.practiceCourts.primary,
        secondary: lawyerData.practiceCourts.secondary,
        lawyerId: lawyer.id,
      },
    });
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
