import { ApiProperty } from '@nestjs/swagger';
import { PracticeArea } from '@prisma/client';

export class DashboardProfileSummaryDto {
  @ApiProperty({ description: 'Lawyer name' })
  name: string;

  @ApiProperty({ description: 'Lawyer photo URL' })
  photo?: string;

  @ApiProperty({ description: 'Lawyer specialization' })
  specialization?: PracticeArea;

  @ApiProperty({ description: 'Primary court' })
  primaryCourt?: string;

  @ApiProperty({ description: 'Average rating' })
  rating?: number;
}

export class DashboardStatisticsDto {
  @ApiProperty({ description: 'Total consultation requests received' })
  totalRequests: number;

  @ApiProperty({ description: 'Number of pending consultation requests' })
  pendingRequests: number;

  @ApiProperty({ description: 'Number of accepted consultation requests' })
  acceptedRequests: number;

  @ApiProperty({ description: 'Number of rejected consultation requests' })
  rejectedRequests: number;

  @ApiProperty({ description: 'Average response time in hours' })
  averageResponseTime: number;
}

export class DashboardRecentActivityDto {
  @ApiProperty({ description: 'Last 5 consultation requests' })
  recentRequests: any[]; // We'll define this type later

  @ApiProperty({ description: 'Last 5 responses' })
  recentResponses: any[]; // We'll define this type later

  @ApiProperty({ description: 'Last login timestamp' })
  lastLogin: Date;
}

export class DashboardQuickActionsDto {
  @ApiProperty({ description: 'Number of pending requests to respond to' })
  pendingRequestsCount: number;

  @ApiProperty({ description: 'URL to view all requests' })
  viewAllRequestsUrl: string;

  @ApiProperty({ description: 'URL to update profile' })
  updateProfileUrl: string;
}

export class LawyerDashboardResponseDto {
  @ApiProperty({ description: 'Profile summary' })
  profile: DashboardProfileSummaryDto;

  @ApiProperty({ description: 'Dashboard statistics' })
  statistics: DashboardStatisticsDto;

  @ApiProperty({ description: 'Recent activity' })
  recentActivity: DashboardRecentActivityDto;

  @ApiProperty({ description: 'Quick actions' })
  quickActions: DashboardQuickActionsDto;
}
