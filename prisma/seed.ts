import {
  PrismaClient,
  PracticeArea,
  PracticeCourt,
  Service,
  User,
  ClientProfile,
  LawyerProfile,
} from '@prisma/client';
import {
  practiceAreas,
  practiceCourts,
  services,
  users,
  userRoles,
  clientProfiles,
  lawyerProfiles,
  educations,
  lawyerPracticeAreas,
  lawyerPracticeCourts,
  lawyerServices,
  savedLawyers,
  consultationRequests,
} from '../src/data/seedData';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Main seeding function.
 */
async function main() {
  console.log('Start seeding ...');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.consultationRequest.deleteMany();
  await prisma.savedLawyer.deleteMany();
  await prisma.lawyerService.deleteMany();
  await prisma.lawyerPracticeCourt.deleteMany();
  await prisma.lawyerPracticeArea.deleteMany();
  await prisma.education.deleteMany();
  await prisma.lawyerProfile.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.practiceCourt.deleteMany();
  await prisma.practiceArea.deleteMany();
  console.log('Cleanup completed.');

  // Seed Practice Areas
  const seededAreas: PracticeArea[] = [];
  for (const area of practiceAreas) {
    const seededArea = await prisma.practiceArea.create({
      data: area,
    });
    seededAreas.push(seededArea);
    console.log(`Created practice area: ${area.name}`);
  }

  // Seed Practice Courts
  const seededCourts: PracticeCourt[] = [];
  for (const court of practiceCourts) {
    const seededCourt = await prisma.practiceCourt.create({
      data: court,
    });
    seededCourts.push(seededCourt);
    console.log(`Created practice court: ${court.name}`);
  }

  // Seed Services
  const seededServices: Service[] = [];
  for (const service of services) {
    const seededService = await prisma.service.create({
      data: service,
    });
    seededServices.push(seededService);
    console.log(`Created service: ${service.name}`);
  }

  // Seed Users
  const seededUsers: User[] = [];
  for (const user of users) {
    const seededUser = await prisma.user.create({
      data: user,
    });
    seededUsers.push(seededUser);
    console.log(`Created user: ${user.phoneNumber}`);
  }

  // Seed User Roles
  for (const role of userRoles) {
    await prisma.userRole.create({
      data: role,
    });
    console.log(`Created user role for user: ${role.userId}`);
  }

  // Seed Client Profiles
  const seededClientProfiles: ClientProfile[] = [];
  for (const profile of clientProfiles) {
    const seededProfile = await prisma.clientProfile.create({
      data: profile,
    });
    seededClientProfiles.push(seededProfile);
    console.log(`Created client profile: ${profile.name}`);
  }

  // Seed Lawyer Profiles
  const seededLawyerProfiles: LawyerProfile[] = [];
  for (const profile of lawyerProfiles) {
    const specialization = seededAreas.find(
      (a) => a.name === profile.specializationName,
    );
    const primaryCourt = seededCourts.find(
      (c) => c.name === profile.primaryCourtName,
    );

    if (!specialization || !primaryCourt) {
      console.error(
        `Could not find specialization or primary court for lawyer profile ${profile.id}`,
      );
      continue;
    }

    const { specializationName, primaryCourtName, ...profileData } = profile;
    const seededProfile = await prisma.lawyerProfile.create({
      data: {
        ...profileData,
        specializationId: specialization.id,
        primaryCourtId: primaryCourt.id,
      },
    });
    seededLawyerProfiles.push(seededProfile);
    console.log(`Created lawyer profile: ${profile.id}`);
  }

  // Seed Education
  for (const education of educations) {
    await prisma.education.create({
      data: education,
    });
    console.log(
      `Created education record for lawyer: ${education.lawyerProfileId}`,
    );
  }

  // Seed Lawyer Practice Areas
  for (const lpa of lawyerPracticeAreas) {
    const lawyerProfile = seededLawyerProfiles.find(
      (p) => p.id === lpa.lawyerProfileId,
    );
    const practiceArea = seededAreas.find((a) => a.id === lpa.practiceAreaId);

    if (lawyerProfile && practiceArea) {
      await prisma.lawyerPracticeArea.create({
        data: {
          lawyerProfileId: lawyerProfile.id,
          practiceAreaId: practiceArea.id,
        },
    });
      console.log(`Created lawyer practice area relation`);
    }
  }

  // Seed Lawyer Practice Courts
  for (const lpc of lawyerPracticeCourts) {
    const lawyerProfile = seededLawyerProfiles.find(
      (p) => p.id === lpc.lawyerProfileId,
    );
    const practiceCourt = seededCourts.find(
      (c) => c.id === lpc.practiceCourtId,
    );

    if (lawyerProfile && practiceCourt) {
      await prisma.lawyerPracticeCourt.create({
        data: {
          lawyerProfileId: lawyerProfile.id,
          practiceCourtId: practiceCourt.id,
        },
      });
      console.log(`Created lawyer practice court relation`);
  }
  }

  // Seed Lawyer Services
  for (const ls of lawyerServices) {
    const lawyerProfile = seededLawyerProfiles.find(
      (p) => p.id === ls.lawyerProfileId,
    );
    const service = seededServices.find((s) => s.id === ls.serviceId);

    if (lawyerProfile && service) {
      await prisma.lawyerService.create({
        data: {
          lawyerProfileId: lawyerProfile.id,
          serviceId: service.id,
        },
      });
      console.log(`Created lawyer service relation`);
    }
  }

  // Seed Saved Lawyers
  for (const saved of savedLawyers) {
    const clientProfile = seededClientProfiles.find(
      (p) => p.id === saved.clientProfileId,
    );
    const lawyerProfile = seededLawyerProfiles.find(
      (p) => p.id === saved.lawyerProfileId,
    );

    if (clientProfile && lawyerProfile) {
      await prisma.savedLawyer.create({
        data: {
          clientProfileId: clientProfile.id,
          lawyerProfileId: lawyerProfile.id,
        },
      });
      console.log(`Created saved lawyer relation`);
    }
  }

  // Seed Consultation Requests
  for (const request of consultationRequests) {
    const clientProfile = seededClientProfiles.find(
      (p) => p.id === request.clientProfileId,
    );
    const lawyerProfile = seededLawyerProfiles.find(
      (p) => p.id === request.lawyerProfileId,
    );

    if (clientProfile && lawyerProfile) {
      await prisma.consultationRequest.create({
        data: {
          ...request,
          clientProfileId: clientProfile.id,
          lawyerProfileId: lawyerProfile.id,
        },
      });
      console.log(`Created consultation request: ${request.id}`);
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
