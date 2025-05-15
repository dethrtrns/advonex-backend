import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasUserRoleGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ClientProfile, LawyerProfile } from '@prisma/client';
import { ClientProfileResponseDto } from './dto/client-profile-response.dto';
import { LawyerProfileResponseDto } from './dto/lawyer-profile-response.dto';
import { StandardResponseDto } from '../common/dto/standard-response.dto'; // Import the new DTO
import { ApiStandardResponse } from 'src/common/decorators/api-standard-response.decorator';
import { ApiStandardErrors } from 'src/common/decorators/api-error-responses';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('client')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({
    summary: 'Get client profile',
    description: `
      Retrieves the profile of the authenticated client user.
      Requires CLIENT role.
      
      **Testing Tips:**
      - Requires valid JWT token with CLIENT role
      - Returns complete client profile data
    `,
  })
  @ApiBearerAuth()
  @ApiStandardResponse(
    ClientProfileResponseDto,
    'Client profile retrieved successfully.',
  )
  @ApiStandardErrors()
  async getClientProfile(@Req() req: Request): Promise<ClientProfile> {
    const user = req.user as JwtPayload;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }
    return this.profilesService.getClientProfile(user);
  }

  @Put('client')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({
    summary: 'Update client profile',
    description: `
      Updates the profile of the authenticated client user.
      All fields are optional. Only provided fields will be updated.
      Requires CLIENT role.
      
      **Testing Tips:**
      - Requires valid JWT token with CLIENT role
      - Only include fields that need to be updated
      - All fields are optional
    `,
  })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateClientProfileDto })
  @ApiStandardResponse(
    ClientProfileResponseDto,
    'Client profile updated successfully',
  )
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client profile not found.',
  })
  @HttpCode(HttpStatus.OK)
  async updateClientProfile(
    @Req() req: Request,
    @Body() updateClientProfileDto: UpdateClientProfileDto,
  ): Promise<ClientProfile> {
    const user = req.user as JwtPayload;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }
    return this.profilesService.updateClientProfile(
      user,
      updateClientProfileDto,
    );
  }

  @Get('lawyer')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.LAWYER)
  @ApiOperation({
    summary: 'Get lawyer profile',
    description: `
      Retrieves the profile of the authenticated lawyer user.
      Requires LAWYER role.
      Includes all related data (practice areas, courts, services, etc.).
      
      **Testing Tips:**
      - Requires valid JWT token with LAWYER role
      - Returns complete lawyer profile data with all relations
    `,
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lawyer profile retrieved successfully',
    type: LawyerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lawyer profile not found.',
  })
  async getLawyerProfile(@Req() req: Request): Promise<LawyerProfile> {
    const user = req.user as JwtPayload;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }
    return this.profilesService.getLawyerProfile(user);
  }

  @Put('lawyer')
  @UseGuards(JwtAuthGuard, HasUserRoleGuard)
  @Roles(Role.LAWYER)
  @ApiOperation({
    summary: 'Update lawyer profile',
    description: `
      Updates the profile of the authenticated lawyer user.
      All fields are optional. Only provided fields will be updated.
      For relational fields (practice areas, courts, services):
      - If a string is provided, it will be checked against existing data
      - If a match is found, the relation will be mapped
      - If no match is found, new data will be created and associated
      Requires LAWYER role.
      
      **Testing Tips:**
      - Requires valid JWT token with LAWYER role
      - Only include fields that need to be updated
      - All fields are optional
      - For relations, provide strings that will be matched or created
    `,
  })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateLawyerProfileDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lawyer profile updated successfully',
    type: LawyerProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lawyer profile not found.',
  })
  @HttpCode(HttpStatus.OK)
  async updateLawyerProfile(
    @Req() req: Request,
    @Body() updateLawyerProfileDto: UpdateLawyerProfileDto,
  ): Promise<LawyerProfile> {
    const user = req.user as JwtPayload;
    if (!user?.sub) {
      throw new UnauthorizedException();
    }
    return this.profilesService.updateLawyerProfile(
      user,
      updateLawyerProfileDto,
    );
  }
}
