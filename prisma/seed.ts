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