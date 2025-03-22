import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LawyersService } from './lawyers.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { LawyerResponseDto, LawyerQueryDto, LawyerDetailsResponseDto } from './dto/lawyer.dto';

@ApiTags('lawyers')
@Controller('api/lawyers')
export class LawyersController {
  constructor(private readonly lawyersService: LawyersService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of lawyers with filters' })
  @ApiQuery({ name: 'practiceArea', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ type: LawyerResponseDto })
  async findAll(@Query() query: LawyerQueryDto) {
    const { practiceArea, location, page = 1, limit = 10 } = query;
    const { lawyers, pagination } = await this.lawyersService.findAll(
      practiceArea,
      location,
      +page,
      +limit,
    );

    return {
      success: true,
      data: lawyers,
      pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lawyer details by ID' })
  @ApiParam({ name: 'id', description: 'Lawyer ID' })
  @ApiResponse({ type: LawyerDetailsResponseDto })
  async findOne(@Param('id') id: string) {
    try {
      const lawyer = await this.lawyersService.findOne(id);
      return {
        success: true,
        data: lawyer,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching lawyer details');
    }
  }
}
