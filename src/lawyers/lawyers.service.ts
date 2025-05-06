import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  LawyerProfile,
  Prisma,
  PracticeArea,
  PracticeCourt,
  Service,
  Education,
} from '@prisma/client';
import { SearchLawyersDto } from './dto/search-lawyers.dto';
import {
  LawyerProfileDto,
  PaginatedLawyerProfilesResponseDto,
} from './dto/lawyer-profile.dto';

@Injectable()
export class LawyersService {
  private readonly logger = new Logger(LawyersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Searches for lawyers based on the provided criteria
   * @param searchDto The search criteria
   * @returns A list of lawyer profiles matching the criteria
   */
  async findAll(
    searchDto: SearchLawyersDto,
  ): Promise<PaginatedLawyerProfilesResponseDto> {
    const {
      searchTerm,
      practiceArea,
      court,
      service,
      minHourlyRate,
      maxHourlyRate,
      minRating,
      page = 1,
      limit = 10,
    } = searchDto;

    const skip = (page - 1) * limit;

    const where: Prisma.LawyerProfileWhereInput = {
      AND: [
        searchTerm
          ? {
              OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { bio: { contains: searchTerm, mode: 'insensitive' } },
              ],
            }
          : {},
        practiceArea
          ? {
              practiceAreas: {
                some: {
                  practiceArea: {
                    name: { equals: practiceArea, mode: 'insensitive' },
                  },
                },
              },
            }
          : {},
        court
          ? {
              practiceCourts: {
                some: {
                  practiceCourt: {
                    name: { equals: court, mode: 'insensitive' },
                  },
                },
              },
            }
          : {},
        service
          ? {
              services: {
                some: {
                  service: {
                    name: { equals: service, mode: 'insensitive' },
                  },
                },
              },
            }
          : {},
        minHourlyRate ? { consultFee: { gte: minHourlyRate } } : {},
        maxHourlyRate ? { consultFee: { lte: maxHourlyRate } } : {},
      ],
    };

    // Get total count for pagination
    const total = await this.prisma.lawyerProfile.count({ where });
    const totalPages = Math.ceil(total / limit);

    const lawyers = await this.prisma.lawyerProfile.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            email: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Lawyers retrieved successfully',
      data: lawyers.map(this.mapToDto),
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Fetches a single lawyer profile by its ID
   * @param lawyerProfileId The UUID of the lawyer profile
   * @returns The lawyer profile
   * @throws NotFoundException if the profile doesn't exist
   */
  async findOne(lawyerProfileId: string): Promise<LawyerProfileDto> {
    this.logger.log(`Fetching lawyer profile with ID: ${lawyerProfileId}`);

    try {
      const profile = await this.prisma.lawyerProfile.findUnique({
        where: { id: lawyerProfileId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
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
        this.logger.warn(
          `Lawyer profile not found with ID: ${lawyerProfileId}`,
        );
        throw new NotFoundException(
          `Lawyer profile with ID ${lawyerProfileId} not found`,
        );
      }

      this.logger.log(`Successfully fetched lawyer profile ID: ${profile.id}`);
      return this.mapToDto(profile);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to fetch lawyer profile ${lawyerProfileId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Could not retrieve lawyer profile ${lawyerProfileId}`,
      );
    }
  }

  /**
   * Maps a LawyerProfile entity to a LawyerProfileDto
   * @param profile The lawyer profile entity
   * @returns The mapped DTO
   */
  private mapToDto(
    profile: LawyerProfile & {
      user: { email: string | null };
      practiceAreas: Array<{ practiceArea: PracticeArea }>;
      practiceCourts: Array<{ practiceCourt: PracticeCourt }>;
      services: Array<{ service: Service }>;
      specialization: PracticeArea | null;
      primaryCourt: PracticeCourt | null;
      education: Education | null;
    },
  ): LawyerProfileDto {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.user.email,
      photo: profile.photo,
      location: profile.location,
      experience: profile.experience,
      bio: profile.bio,
      consultFee: profile.consultFee,
      barId: profile.barId,
      isVerified: profile.isVerified,
      registrationPending: profile.registrationPending,
      specialization: profile.specialization,
      primaryCourt: profile.primaryCourt,
      practiceAreas: profile.practiceAreas,
      practiceCourts: profile.practiceCourts,
      services: profile.services,
      education: profile.education,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
