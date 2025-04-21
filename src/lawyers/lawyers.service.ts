import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LawyerDto, LawyerDetailsDto, PaginationDto, CreateLawyerDto } from './dto/lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves a paginated list of lawyers with optional filtering
   * @param practiceArea - Optional filter by practice area
   * @param location - Optional filter by location (case insensitive)
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Object containing array of lawyers and pagination metadata
   */
  async findAll(
    practiceArea?: string,
    location?: string,
    page = 1,
    limit = 10,
  ): Promise<{ lawyers: LawyerDto[]; pagination: PaginationDto }> {
    // Initialize empty where clause for Prisma query
    const where = {};

    // Add practice area filter if provided
    // Uses Prisma's 'has' operator to search in the array field
    if (practiceArea) {
      where['practiceAreas'] = {
        has: practiceArea,
      };
    }

    // Add location filter if provided
    // Uses case-insensitive partial matching
    if (location) {
      where['location'] = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Get total count of matching records for pagination metadata
    const total = await this.prisma.lawyer.count({ where });
    const totalPages = Math.ceil(total / limit);
    // Calculate number of records to skip based on page number
    const skip = (page - 1) * limit;

    // Using Prisma to get lawyer data with specific fields
    // Include practiceCourt relation as requested by frontend
    const lawyers = await this.prisma.lawyer.findMany({
      where,
      skip, // Skip records for pagination
      take: limit, // Limit number of records returned
      select: {
        id: true,
        name: true,
        photo: true,
        practiceAreas: true,
        location: true,
        experience: true,
        consultFee: true,
        practiceCourt: true, // Include practice court information
      },
    });

    // Return structured response with lawyers array and pagination metadata
    // The lawyers array contains the filtered and paginated lawyer records
    // The pagination object contains metadata for client-side pagination controls
    return {
      lawyers, // No need for explicit casting as the types already match
      pagination: {
        total, // Total number of records matching the filter criteria
        page, // Current page number
        limit, // Number of records per page
        totalPages, // Total number of pages available
      },
    };
  }

  /**
   * Retrieves detailed information about a specific lawyer by ID
   * @param id - Unique identifier of the lawyer to retrieve
   * @returns Complete lawyer details including related education and practice court information
   * @throws NotFoundException if lawyer with specified ID doesn't exist
   */
  async findOne(id: string): Promise<LawyerDetailsDto> {
    // Use Prisma to get data with included relationships
    // The include parameter tells Prisma to fetch related records from other tables
    const lawyer = await this.prisma.lawyer.findUnique({
      where: { id },
      include: {
        education: true, // Include education records related to this lawyer
        practiceCourt: true, // Include practice court information related to this lawyer
      },
    });

    // If no lawyer found with the given ID, throw a 404 exception
    // This will be caught by NestJS exception filters and returned as a 404 response
    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${id} not found`);
    }

    // Return the data directly as the types match the LawyerDetailsDto structure
    // Type casting is used to ensure TypeScript recognizes the included relations
    return lawyer as LawyerDetailsDto;
  }

  /**
   * Creates a new lawyer record with associated user, education, and practice court
   * @param createLawyerDto - Data for creating the lawyer
   * @returns The created lawyer with all related information
   */
  async create(createLawyerDto: CreateLawyerDto): Promise<LawyerDetailsDto> {
    // Use Prisma transaction to ensure all related records are created or none at all
    return this.prisma.$transaction(async (prisma) => {
      // First create the user record
      const user = await prisma.user.create({
        data: {
          phoneNumber: createLawyerDto.phone,
          name: createLawyerDto.name,
          email: createLawyerDto.email,
          role: 'LAWYER',
        },
      });

      // Then create the lawyer record with reference to the user
      const lawyer = await prisma.lawyer.create({
        data: {
          name: createLawyerDto.name,
          photo: createLawyerDto.photo,
          practiceAreas: createLawyerDto.practiceAreas,
          location: createLawyerDto.location,
          experience: createLawyerDto.experience,
          email: createLawyerDto.email,
          phone: createLawyerDto.phone,
          bio: createLawyerDto.bio,
          consultFee: createLawyerDto.consultFee,
          barId: createLawyerDto.barId,
          userId: user.id,
          // Create education record
          education: {
            create: {
              degree: createLawyerDto.education.degree,
              institution: createLawyerDto.education.institution,
              year: createLawyerDto.education.year,
            },
          },
          // Create practice court record
          practiceCourt: {
            create: {
              primary: createLawyerDto.practiceCourt.primary,
              secondary: createLawyerDto.practiceCourt.secondary,
            },
          },
        },
        // Include related records in the response
        include: {
          education: true,
          practiceCourt: true,
        },
      });

      return lawyer as LawyerDetailsDto;
    });
  }
}
