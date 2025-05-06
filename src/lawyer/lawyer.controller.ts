import {
  Controller,
  Get,
  UseGuards,
  Req,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { LawyerService } from './lawyer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasUserRoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { LawyerDashboardResponseDto } from './dto/dashboard.dto';
import { ConsultationRequestsResponseDto } from './dto/consultation-requests.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Lawyer')
@Controller('lawyer')
@ApiBearerAuth()
export class LawyerController {
  private readonly logger = new Logger(LawyerController.name);

  constructor(private readonly lawyerService: LawyerService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.LAWYER)
  @ApiOperation({ summary: 'Get lawyer dashboard data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard data retrieved successfully',
    type: LawyerDashboardResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a lawyer',
  })
  async getDashboard(@Req() req: Request): Promise<LawyerDashboardResponseDto> {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for GET /lawyer/dashboard by user ${user.sub}`,
    );
    return this.lawyerService.getDashboard(user.profileId);
  }

  @Get('consultation-requests')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.LAWYER)
  @ApiOperation({ summary: 'Get all consultation requests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation requests retrieved successfully',
    type: ConsultationRequestsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. User is not a lawyer',
  })
  async getConsultationRequests(
    @Req() req: Request,
  ): Promise<ConsultationRequestsResponseDto> {
    const user = req.user as JwtPayload;
    this.logger.log(
      `Request received for GET /lawyer/consultation-requests by user ${user.sub}`,
    );
    return this.lawyerService.getConsultationRequests(user.profileId);
  }
}
