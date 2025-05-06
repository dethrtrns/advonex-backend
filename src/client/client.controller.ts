import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Logger,
  HttpStatus,
  HttpCode,
  Param,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasUserRoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SaveLawyerDto } from './dto/save-lawyer.dto';
import { SavedLawyerDto } from './dto/saved-lawyer.dto';
import { ConsultationRequestDto } from './dto/consultation-request.dto';
import { ConsultationRequestResponseDto } from './dto/consultation-request-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Client')
@Controller('client')
@ApiBearerAuth()
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(private readonly clientService: ClientService) {}

  /**
   * Endpoint to save a lawyer to the client's shortlist.
   */
  @Post('save-lawyer')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a lawyer to client shortlist' })
  @ApiBody({ type: SaveLawyerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lawyer successfully saved to shortlist.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lawyer profile not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Lawyer already saved to shortlist.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a client.',
  })
  async saveLawyer(@Req() req: Request, @Body() saveLawyerDto: SaveLawyerDto) {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for POST /client/save-lawyer by user ${user.sub}`,
    );
    return this.clientService.saveLawyer(
      user.profileId,
      saveLawyerDto.lawyerId,
    );
  }

  /**
   * Endpoint to retrieve all lawyers saved by the client.
   */
  @Get('saved-lawyers')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Get all lawyers saved by the client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of saved lawyers retrieved successfully.',
    type: [SavedLawyerDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a client.',
  })
  async getSavedLawyers(@Req() req: Request): Promise<SavedLawyerDto[]> {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for GET /client/saved-lawyers by user ${user.sub}`,
    );
    return this.clientService.getSavedLawyers(user.profileId);
  }

  /**
   * Endpoint to request a consultation from a lawyer.
   */
  @Post('request-consultation')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a consultation from a lawyer' })
  @ApiBody({ type: ConsultationRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Consultation request created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lawyer profile not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a client.',
  })
  async requestConsultation(
    @Req() req: Request,
    @Body() requestDto: ConsultationRequestDto,
  ) {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for POST /client/request-consultation by user ${user.sub}`,
    );
    return this.clientService.requestConsultation(user.profileId, requestDto);
  }

  @Get('consultation-requests')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Get all consultation requests' })
  @ApiResponse({
    status: 200,
    description: 'List of consultation requests',
    type: [ConsultationRequestResponseDto],
  })
  async getConsultationRequests(
    @Req() req: Request,
  ): Promise<ConsultationRequestResponseDto[]> {
    const user = req.user as JwtPayload;
    this.logger.log(`Client ${user.profileId} fetching consultation requests`);
    return this.clientService.getConsultationRequests(user.profileId);
  }

  @Get('consultation-requests/:requestId')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Get a specific consultation request' })
  @ApiParam({
    name: 'requestId',
    description: 'The ID of the consultation request',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation request retrieved successfully',
    type: ConsultationRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation request not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a client',
  })
  async getConsultationRequestById(
    @Req() req: Request,
    @Param('requestId') requestId: string,
  ): Promise<ConsultationRequestResponseDto> {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for GET /client/consultation-requests/${requestId} by user ${user.sub}`,
    );
    return this.clientService.getConsultationRequestById(
      user.profileId,
      requestId,
    );
  }

  @Post('consultation-requests/:requestId/cancel')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a specific consultation request' })
  @ApiParam({
    name: 'requestId',
    description: 'The ID of the consultation request',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation request cancelled successfully',
    type: ConsultationRequestResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation request not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel consultation request in current status',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a client',
  })
  async cancelConsultationRequest(
    @Req() req: Request,
    @Param('requestId') requestId: string,
  ): Promise<ConsultationRequestResponseDto> {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for POST /client/consultation-requests/${requestId}/cancel by user ${user.sub}`,
    );
    return this.clientService.cancelConsultationRequest(
      user.profileId,
      requestId,
    );
  }
}
