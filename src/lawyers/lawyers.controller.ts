import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LawyersService } from './lawyers.service';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import {
  LawyerResponseDto,
  LawyerQueryDto,
  LawyerDetailsResponseDto,
  CreateLawyerDto,
} from './dto/lawyer.dto';
import { UploadImageResponseDto } from './dto/upload.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { multerConfig } from '../cloudinary/multer.config';

// This controller handles all HTTP requests related to lawyer data
// It exposes RESTful endpoints for retrieving lawyer information

@ApiTags('lawyers')
@Controller('api/lawyers')
export class LawyersController {
  // Update the constructor in the LawyersController class
  constructor(
    private readonly lawyersService: LawyersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      // Enhanced error handling with more details
      console.error('Error creating lawyer:', error);
      
      // Handle specific Prisma errors with more descriptive messages
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new InternalServerErrorException(`User with this ${field} already exists`);
      }
      
      // Return the actual error message for better debugging
      const errorMessage = error.message || 'Error creating lawyer profile';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  // Add this endpoint to the LawyersController class
  
  /**
   * POST /api/lawyers/:id/upload-photo - Uploads a profile photo for a lawyer
   * @param id - Lawyer ID
   * @param file - Image file to upload
   * @returns Updated lawyer with new photo URL
   */
  @Post(':id/upload-photo')
  @ApiOperation({ summary: 'Upload lawyer profile photo' })
  @ApiParam({ name: 'id', description: 'Lawyer ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ type: UploadImageResponseDto })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      // Upload image to Cloudinary in the lawyers/profiles folder
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'advonex/lawyers/profiles',
      );
  
      // Update lawyer profile with new photo URL
      const updatedLawyer = await this.lawyersService.updateProfilePhoto(id, uploadResult.url);
  
      return {
        success: true,
        data: {
          imageUrl: uploadResult.url,
          publicId: uploadResult.publicId,
          lawyer: updatedLawyer, // Return the updated lawyer object for convenience
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error uploading profile photo');
    }
  }
}
