import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaticDataService } from './static-data.service';
import {
  PracticeArea,
  PracticeCourt,
  LawyerPracticeArea,
  LawyerPracticeCourt,
} from '@prisma/client';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Import JwtAuthGuard
import { HasUserRoleGuard } from '../auth/guards/roles.guard'; // Corrected import
import { Roles } from '../auth/decorators/roles.decorator'; // Import Roles decorator
import { Role } from '@prisma/client'; // Import Role enum
import { AddLawyerPracticeAreaDto } from './dto/add-lawyer-practice-area.dto'; // Import DTO
import { AddLawyerPracticeCourtDto } from './dto/add-lawyer-practice-court.dto'; // Import DTO

@ApiTags('static-data')
@Controller('static-data')
export class StaticDataController {
  constructor(private readonly staticDataService: StaticDataService) {}

  /**
   * Retrieves a list of all available practice areas.
   * Publicly accessible.
   * @returns {Promise<PracticeArea[]>} A list of practice areas.
   */
  @Get('practice-areas')
  @ApiOperation({ summary: 'Get all practice areas' })
  @ApiResponse({
    status: 200,
    description: 'List of practice areas.',
    type: [Object],
  }) // Use Object for Swagger
  async findAllPracticeAreas(): Promise<PracticeArea[]> {
    return this.staticDataService.findAllPracticeAreas();
  }

  /**
   * Retrieves a list of all available practice courts.
   * Publicly accessible.
   * @returns {Promise<PracticeCourt[]>} A list of practice courts.
   */
  @Get('courts')
  @ApiOperation({ summary: 'Get all practice courts' })
  @ApiResponse({
    status: 200,
    description: 'List of practice courts.',
    type: [Object],
  }) // Use Object for Swagger
  async findAllCourts(): Promise<PracticeCourt[]> {
    return this.staticDataService.findAllCourts();
  }

  // --- Lawyer Specific Endpoints (Protected) ---

  /**
   * Allows a logged-in lawyer to add a practice area to their profile.
   * @param {Req} req - The request object containing the authenticated user.
   * @param {AddLawyerPracticeAreaDto} addDto - DTO containing the practiceAreaId.
   * @returns {Promise<LawyerPracticeArea>} The created association record.
   */
  @Post('lawyer/me/practice-areas')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard) // Use corrected guard name
  @Roles(Role.LAWYER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Add a practice area to the current lawyer's profile",
  })
  @ApiResponse({
    status: 201,
    description: 'Practice area successfully added.',
    type: Object,
  }) // Use Object for Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not a lawyer.' })
  @ApiResponse({ status: 404, description: 'Practice area not found.' })
  @HttpCode(HttpStatus.CREATED)
  async addPracticeAreaToLawyer(
    @Req() req,
    @Body() addDto: AddLawyerPracticeAreaDto,
  ): Promise<LawyerPracticeArea> {
    const lawyerProfileId = req.user.profileId; // Assuming profileId is attached by JwtAuthGuard/strategy
    return this.staticDataService.addPracticeAreaToLawyer(
      lawyerProfileId,
      addDto.practiceAreaId,
    );
  }

  /**
   * Allows a logged-in lawyer to remove a practice area from their profile.
   * @param {Req} req - The request object containing the authenticated user.
   * @param {string} practiceAreaId - The UUID of the practice area to remove.
   * @returns {Promise<void>}
   */
  @Delete('lawyer/me/practice-areas/:practiceAreaId')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard) // Use corrected guard name
  @Roles(Role.LAWYER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Remove a practice area from the current lawyer's profile",
  })
  @ApiParam({
    name: 'practiceAreaId',
    description: 'UUID of the practice area to remove',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Practice area successfully removed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not a lawyer.' })
  @ApiResponse({ status: 404, description: 'Association not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePracticeAreaFromLawyer(
    @Req() req,
    @Param('practiceAreaId', ParseUUIDPipe) practiceAreaId: string,
  ): Promise<void> {
    const lawyerProfileId = req.user.profileId;
    await this.staticDataService.removePracticeAreaFromLawyer(
      lawyerProfileId,
      practiceAreaId,
    );
  }

  /**
   * Allows a logged-in lawyer to add a practice court to their profile.
   * @param {Req} req - The request object containing the authenticated user.
   * @param {AddLawyerPracticeCourtDto} addDto - DTO containing the practiceCourtId.
   * @returns {Promise<LawyerPracticeCourt>} The created association record.
   */
  @Post('lawyer/me/practice-courts')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard) // Use corrected guard name
  @Roles(Role.LAWYER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Add a practice court to the current lawyer's profile",
  })
  @ApiResponse({
    status: 201,
    description: 'Practice court successfully added.',
    type: Object,
  }) // Use Object for Swagger
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not a lawyer.' })
  @ApiResponse({ status: 404, description: 'Practice court not found.' })
  @HttpCode(HttpStatus.CREATED)
  async addPracticeCourtToLawyer(
    @Req() req,
    @Body() addDto: AddLawyerPracticeCourtDto,
  ): Promise<LawyerPracticeCourt> {
    const lawyerProfileId = req.user.profileId;
    return this.staticDataService.addPracticeCourtToLawyer(
      lawyerProfileId,
      addDto.practiceCourtId,
    );
  }

  /**
   * Allows a logged-in lawyer to remove a practice court from their profile.
   * @param {Req} req - The request object containing the authenticated user.
   * @param {string} practiceCourtId - The UUID of the practice court to remove.
   * @returns {Promise<void>}
   */
  @Delete('lawyer/me/practice-courts/:practiceCourtId')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard) // Use corrected guard name
  @Roles(Role.LAWYER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Remove a practice court from the current lawyer's profile",
  })
  @ApiParam({
    name: 'practiceCourtId',
    description: 'UUID of the practice court to remove',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Practice court successfully removed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. User is not a lawyer.' })
  @ApiResponse({ status: 404, description: 'Association not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePracticeCourtFromLawyer(
    @Req() req,
    @Param('practiceCourtId', ParseUUIDPipe) practiceCourtId: string,
  ): Promise<void> {
    const lawyerProfileId = req.user.profileId;
    await this.staticDataService.removePracticeCourtFromLawyer(
      lawyerProfileId,
      practiceCourtId,
    );
  }
}
