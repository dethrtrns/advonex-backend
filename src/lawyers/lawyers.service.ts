import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Lawyer, Education } from '@prisma/client'; // Import Prisma-generated types
import { LawyerDto, LawyerDetailsDto, PaginationDto } from './dto/lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    practiceArea?: string,
    location?: string,
    page = 1,
    limit = 10,
  ): Promise<{ lawyers: LawyerDto[]; pagination: PaginationDto }> {
    const where = {};

    if (practiceArea) {
      where['practiceAreas'] = {
        has: practiceArea,
      };
    }

    if (location) {
      where['location'] = {
        contains: location,
        mode: 'insensitive',
      };
    }

    const total = await this.prisma.lawyer.count({ where });
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Using Prisma to get lawyer data with specific fields
    const lawyers = await this.prisma.lawyer.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        photo: true,
        practiceAreas: true,
        location: true,
        experience: true,
        consultFee: true,
      },
    });

    return {
      lawyers: lawyers as LawyerDto[], // Cast to DTO type since fields match
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<LawyerDetailsDto> {
    // Use Prisma to get data with included relationships
    const lawyer = await this.prisma.lawyer.findUnique({
      where: { id },
      include: {
        education: true,
      },
    });

    if (!lawyer) {
      throw new NotFoundException(`Lawyer with ID ${id} not found`);
    }

    // Return the data as LawyerDetailsDto (the types already match)
    return lawyer as unknown as LawyerDetailsDto;
  }
}
