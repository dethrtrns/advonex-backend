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

      // Update the profile
      const updatedProfile = await this.prisma.lawyerProfile.update({
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
          registrationPending: false, // Mark registration as complete
          specializationId: specializationId,
          primaryCourtId: primaryCourtId,
          education: updateLawyerProfileDto.education
            ? {
                upsert: {
                  create: {
                    degree: updateLawyerProfileDto.education.degree,
                    institution: updateLawyerProfileDto.education.institution,
                    year: updateLawyerProfileDto.education.year,
                  },
                  update: {
                    degree: updateLawyerProfileDto.education.degree,
                    institution: updateLawyerProfileDto.education.institution,
                    year: updateLawyerProfileDto.education.year,
                  },
                },
              }
            : undefined,
          // Note: Handling for practiceAreas, practiceCourts, services (many-to-many) needs careful consideration
          // This example focuses on direct fields and simple relations. Complex relations might require transactions or more detailed logic.
        },
        include: {
          practiceAreas: { include: { practiceArea: true } },
          practiceCourts: { include: { practiceCourt: true } },
          services: { include: { service: true } },
          specialization: true,
          primaryCourt: true,
          education: true,
        },
      });

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
