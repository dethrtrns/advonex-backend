import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Post,
  Body,
} from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  LawyerResponseDto,
  LawyerQueryDto,
  LawyerDetailsResponseDto,
  CreateLawyerDto,
} from './dto/lawyer.dto';

// This controller handles all HTTP requests related to lawyer data
// It exposes RESTful endpoints for retrieving lawyer information

@ApiTags('lawyers')
@Controller('api/lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  /**
   * GET /api/lawyers - Retrieves a list of lawyers with optional filtering and pagination
   * Supports filtering by practice area and location
   * Supports pagination with page number and limit parameters
   */
  @Get()
  @ApiOperation({ summary: 'Get list of lawyers with filters' })
  @ApiQuery({ name: 'practiceArea', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ type: LawyerResponseDto })
  async findAll(@Query() query: LawyerQueryDto) {
    // Extract query parameters with defaults for pagination
    const { practiceArea, location, page = 1, limit = 10 } = query;
    
    // Call service method to get filtered and paginated data
    // Convert page and limit to numbers with the + operator
    const { lawyers, pagination } = await this.lawyersService.findAll(
      practiceArea,
      location,
      +page,
      +limit,
    );

    // Return standardized response format with success flag
    return {
      success: true,
      data: lawyers,
      pagination,
    };
  }

  /**
   * GET /api/lawyers/:id - Retrieves detailed information about a specific lawyer
   * Returns complete lawyer profile including education and practice court information
   * Returns 404 if lawyer with specified ID doesn't exist
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get lawyer details by ID' })
  @ApiParam({ name: 'id', description: 'Lawyer ID' })
  @ApiResponse({ type: LawyerDetailsResponseDto })
  @ApiResponse({ status: 404, description: 'Lawyer not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    try {
      // Call service method to get lawyer details by ID
      const lawyer = await this.lawyersService.findOne(id);
      
      // Return standardized response format with success flag
      return {
        success: true,
        data: lawyer,
      };
    } catch (error) {
      // The NotFoundException will be handled by NestJS's exception filter
      // This allows the error to be properly formatted in the response
      if (!(error instanceof NotFoundException)) {
        // For any other errors, wrap in a 500 Internal Server Error
        // This prevents exposing internal error details to clients
        throw new InternalServerErrorException('Error fetching lawyer details');
      }
      throw error;
    }
  }

  /**
   * POST /api/lawyers - Creates a new lawyer record
   * Creates both a user and lawyer record in the database
   * Returns the created lawyer details
   */
  @Post()
  @ApiOperation({ summary: 'Create a new lawyer' })
  @ApiBody({ type: CreateLawyerDto })
  @ApiResponse({ type: LawyerDetailsResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createLawyerDto: CreateLawyerDto) {
    try {
      const lawyer = await this.lawyersService.create(createLawyerDto);
      
      return {
        success: true,
        data: lawyer,
      };
    } catch (error) {
      // Handle specific errors if needed
      if (error.code === 'P2002') {
        throw new InternalServerErrorException('User with this email or phone already exists');
      }
      throw new InternalServerErrorException('Error creating lawyer profile');
    }
  }
}
