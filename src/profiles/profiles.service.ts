import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException, // Added import
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProfile, LawyerProfile, Role, Prisma } from '@prisma/client';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { equals } from 'class-validator';
import { practiceCourts } from 'src/data/seedData';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetches the client profile for the currently authenticated user.
   * Ensures the user has the CLIENT role.
   */
  async getClientProfile(user: JwtPayload): Promise<ClientProfile> {
    this.logger.log(`Fetching client profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.CLIENT)) {
      this.logger.warn(
        `User ${user.sub} attempted to access client profile without CLIENT role.`,
      );
      throw new ForbiddenException('Access denied. User is not a client.');
    }

    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId: user.sub },
    });

    if (!profile) {
      this.logger.warn(`Client profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Client profile not found for user ID: ${user.sub}`,
      );
    }

    this.logger.log(
      `Successfully fetched client profile ID: ${profile.id} for user ID: ${user.sub}`,
    );
    return profile;
  }

  /**
   * Updates the client profile for the currently authenticated user.
   * Sets registrationPending to false upon successful update.
   */
  async updateClientProfile(
    user: JwtPayload,
    updateClientProfileDto: UpdateClientProfileDto,
  ): Promise<ClientProfile> {
    this.logger.log(`Updating client profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.CLIENT)) {
      this.logger.warn(
        `User ${user.sub} attempted to update client profile without CLIENT role.`,
      );
      throw new ForbiddenException('Access denied. User is not a client.');
    }

    const existingProfile = await this.prisma.clientProfile.findUnique({
      where: { userId: user.sub },
    });

    if (!existingProfile) {
      this.logger.warn(`Client profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Client profile not found for user ID: ${user.sub}`,
      );
    }

    const updateData: Prisma.ClientProfileUpdateInput = {
      ...updateClientProfileDto,
      registrationPending: false, // Mark registration as complete
    };

    try {
      const updatedProfile = await this.prisma.clientProfile.update({
        where: { userId: user.sub },
        data: updateData,
      });

      this.logger.log(
        `Successfully updated client profile ID: ${updatedProfile.id} for user ID: ${user.sub}`,
      );
      return updatedProfile;
    } catch (error) {
      this.logger.error(
        `Failed to update client profile for user ID: ${user.sub}. Error: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors, e.g., unique constraint violation
        throw new InternalServerErrorException(
          `Database error while updating client profile: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `An unexpected error occurred while updating client profile: ${error.message}`,
      );
    }
  }

  /**
   * Fetches the lawyer profile for the currently authenticated user.
   * Ensures the user has the LAWYER role.
   */
  async getLawyerProfile(user: JwtPayload): Promise<LawyerProfile> {
    this.logger.log(`Fetching lawyer profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.LAWYER)) {
      this.logger.warn(
        `User ${user.sub} attempted to access lawyer profile without LAWYER role.`,
      );
      throw new ForbiddenException('Access denied. User is not a lawyer.');
    }

    const profile = await this.prisma.lawyerProfile.findUnique({
      where: { userId: user.sub },
      include: {
        practiceAreas: {
          include: {
            practiceArea: true,
          },
        },
        practiceCourts: {
          include: {
            practiceCourt: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        specialization: true,
        primaryCourt: true,
        education: true,
      },
    });

    if (!profile) {
      this.logger.warn(`Lawyer profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Lawyer profile not found for user ID: ${user.sub}`,
      );
    }

    this.logger.log(
      `Successfully fetched lawyer profile ID: ${profile.id} for user ID: ${user.sub}`,
    );
    return profile;
  }

  /**
   * Updates the lawyer profile for the currently authenticated user.
   * Sets registrationPending to false upon successful update.
   * Handles relational fields by creating or finding existing records.
   */
  async updateLawyerProfile(
    user: JwtPayload,
    updateLawyerProfileDto: UpdateLawyerProfileDto,
  ): Promise<LawyerProfile> {
    this.logger.log(`Updating lawyer profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.LAWYER)) {
      this.logger.warn(
        `User ${user.sub} attempted to update lawyer profile without LAWYER role.`,
      );
      throw new ForbiddenException('Access denied. User is not a lawyer.');
    }

    const existingProfile = await this.prisma.lawyerProfile.findUnique({
      where: { userId: user.sub },
      // Include relations if they are part of the update logic or response
    });

    if (!existingProfile) {
      this.logger.warn(`Lawyer profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Lawyer profile not found for user ID: ${user.sub}`,
      );
    }

    try {
      const updatedProfile = await this.prisma.$transaction(async (prisma) => {
        // Handle specialization
        let specializationId: string | null = null;
        if (updateLawyerProfileDto.specialization) {
          const specialization = await this.findOrCreatePracticeArea(
            updateLawyerProfileDto.specialization,
          );
          specializationId = specialization.id;
        }

        // Handle primary court
        let primaryCourtId: string | null = null;
        if (updateLawyerProfileDto.primaryCourt) {
          const primaryCourt = await this.findOrCreatePracticeCourt(
            updateLawyerProfileDto.primaryCourt,
          );
          primaryCourtId = primaryCourt.id;
        }

        // Main profile update logic
        await prisma.lawyerProfile.update({
          where: {
            userId: user.sub,
          },
          data: {
            name: updateLawyerProfileDto.name,
            photo: updateLawyerProfileDto.photo,
            location: updateLawyerProfileDto.location,
            experience: updateLawyerProfileDto.experience,
            bio: updateLawyerProfileDto.bio,
            consultFee: updateLawyerProfileDto.consultFee,
            barId: updateLawyerProfileDto.barId,
            isVerified: updateLawyerProfileDto.isVerified,
            registrationPending: false,
            specializationId: specializationId,
            primaryCourtId: primaryCourtId,
            education: updateLawyerProfileDto.education
              ? {
                  upsert: {
                    create: updateLawyerProfileDto.education,
                    update: updateLawyerProfileDto.education,
                  },
                }
              : undefined,
          },
        });

        // Disconnect existing many-to-many relations
        // await prisma.lawyerPracticeArea.deleteMany({
        //   where: { lawyerProfileId: existingProfile.id },
        // });
        // await prisma.lawyerPracticeCourt.deleteMany({
        //   where: { lawyerProfileId: existingProfile.id },
        // });

        // Handle Practice Areas
        if (updateLawyerProfileDto.practiceAreas) {
          for (const areaDto of updateLawyerProfileDto.practiceAreas) {
            const practiceArea = await prisma.practiceArea.upsert({
              where: { name: areaDto.name },
              update: { name: areaDto.name, description: areaDto.description },
              create: {
                name: areaDto.name,
                description: areaDto.description,
              },
            });
            await prisma.lawyerPracticeArea.create({
              data: {
                lawyerProfileId: existingProfile.id,
                practiceAreaId: practiceArea.id,
              },
            });
          }
        }

        // Handle Practice Courts
        if (updateLawyerProfileDto.practiceCourts) {
          for (const courtDto of updateLawyerProfileDto.practiceCourts) {
            const practiceCourt = await prisma.practiceCourt.upsert({
              where: { name: courtDto.name },
              update: { name: courtDto.name, location: courtDto.location },
              create: {
                name: courtDto.name,
                location: courtDto.location,
              },
            });
            await prisma.lawyerPracticeCourt.create({
              data: {
                lawyerProfileId: existingProfile.id,
                practiceCourtId: practiceCourt.id,
              },
            });
          }
        }

        return prisma.lawyerProfile.findUnique({
          where: { userId: user.sub },
          include: {
            practiceAreas: { include: { practiceArea: true } },
            practiceCourts: { include: { practiceCourt: true } },
            services: { include: { service: true } },
            specialization: true,
            primaryCourt: true,
            education: true,
          },
        });
      });
if  (!updatedProfile) {
this.logger.warn(`Failed to update Lawyer profile for user ID: ${user.sub}; Please try again`);
throw new InternalServerErrorException(
  `Transaction failed to update lawyer profile for user ID: ${user.sub}`,
);
}
      this.logger.log(
        `Successfully updated lawyer profile ID: ${updatedProfile.id} for user ID: ${user.sub}`,
      );
      return updatedProfile;
    } catch (error) {
      this.logger.error(
        `Failed to update lawyer profile for user ID: ${user.sub}. Error: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Database error while updating lawyer profile: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `An unexpected error occurred while updating lawyer profile: ${error.message}`,
      );
    }
  }



  /**
   * Finds an existing practice area by name or creates a new one if not found.
   */
  private async findOrCreatePracticeArea(name: string) {
    const existingArea = await this.prisma.practiceArea.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingArea) {
      return existingArea;
    }

    return this.prisma.practiceArea.create({
      data: {
        name,
        description: `Practice area: ${name}`,
      },
    });
  }

  /**
   * Finds an existing practice court by name or creates a new one if not found.
   */
  private async findOrCreatePracticeCourt(name: string) {
    const existingCourt = await this.prisma.practiceCourt.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingCourt) {
      return existingCourt;
    }

    return this.prisma.practiceCourt.create({
      data: {
        name,
        location: 'Location to be updated',
      },
    });
  }
}


