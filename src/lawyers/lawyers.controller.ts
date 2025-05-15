import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Param,
  NotFoundException,
  Response,
} from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasUserRoleGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { SearchLawyersDto } from './dto/search-lawyers.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import {
  LawyerProfileDto,
  PaginatedLawyerProfilesResponseDto,
} from './dto/lawyer-profile.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { ApiStandardResponse } from 'src/common/decorators/api-standard-response.decorator';

@ApiTags('Lawyers')
@Controller('lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search for lawyers',
    description: 'Search for lawyers based on various criteria.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns a list of lawyer profiles matching the search criteria',
    type: PaginatedLawyerProfilesResponseDto,
  })
  async searchLawyers(
    @Query() searchDto: SearchLawyersDto,
  ): Promise<PaginatedLawyerProfilesResponseDto> {
    return this.lawyersService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get lawyer by ID',
    description: `
      Get a specific lawyer's profile by their ID.
      Returns the complete lawyer profile with all related data.
      
      **Testing Tips:**
      - ID must be a valid UUID
      - Returns 404 if lawyer not found
    `,
  })
  @ApiStandardResponse(
    LawyerProfileDto,
    'Lawyer profile retrieved successfully',
  )
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lawyer not found.',
  })
  @HttpCode(HttpStatus.OK)
  async getLawyerById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawyerProfileDto> {
    return this.lawyersService.findOne(id);
  }
}
