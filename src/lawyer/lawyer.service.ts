import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, PracticeArea } from '@prisma/client';
import { LawyerDashboardResponseDto } from './dto/dashboard.dto';
import { ConsultationRequestsResponseDto } from './dto/consultation-requests.dto';

@Injectable()
export class LawyerService {
  private readonly logger = new Logger(LawyerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get lawyer dashboard data including profile, statistics, and recent activity
   * @param lawyerProfileId - The ID of the lawyer profile
   * @returns Dashboard data for the lawyer
   */
  async getDashboard(
    lawyerProfileId: string,
  ): Promise<LawyerDashboardResponseDto> {
    this.logger.log(`Fetching dashboard for lawyer profile ${lawyerProfileId}`);

    // Get lawyer profile with related data
    const lawyerProfile = await this.prisma.lawyerProfile.findUnique({
      where: { id: lawyerProfileId },
      include: {
        specialization: true,
        primaryCourt: true,
        user: {
          select: {
            lastLogin: true,
          },
        },
      },
    });

    if (!lawyerProfile) {
      this.logger.error(`Lawyer profile not found: ${lawyerProfileId}`);
      throw new Error('Lawyer profile not found');
    }

    // Get consultation request statistics
    const [
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      respondedRequests,
    ] = await Promise.all([
      this.prisma.consultationRequest.count({
        where: { lawyerProfileId },
      }),
      this.prisma.consultationRequest.count({
        where: {
          lawyerProfileId,
          responseStatus: 'PENDING',
        },
      }),
      this.prisma.consultationRequest.count({
        where: {
          lawyerProfileId,
          responseStatus: 'ACCEPTED',
        },
      }),
      this.prisma.consultationRequest.count({
        where: {
          lawyerProfileId,
          responseStatus: 'REJECTED',
        },
      }),
      this.prisma.consultationRequest.findMany({
        where: {
          lawyerProfileId,
          responseTimestamp: { not: null },
        },
        select: {
          responseTimestamp: true,
        },
      }),
    ]);

    // Get recent activity
    const recentRequests = await this.prisma.consultationRequest.findMany({
      where: { lawyerProfileId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        clientProfile: {
          select: {
            name: true,
            photo: true,
          },
        },
      },
    });

    const recentResponses = await this.prisma.consultationRequest.findMany({
      where: {
        lawyerProfileId,
        responseTimestamp: { not: null },
      },
      orderBy: { responseTimestamp: 'desc' },
      take: 5,
      include: {
        clientProfile: {
          select: {
            name: true,
            photo: true,
          },
        },
      },
    });

    // Calculate average response time in hours
    const avgResponseTime =
      respondedRequests.length > 0
        ? respondedRequests.reduce((acc, req) => {
            if (req.responseTimestamp) {
              return (
                acc + (new Date().getTime() - req.responseTimestamp.getTime())
              );
            }
            return acc;
          }, 0) /
          (respondedRequests.length * 1000 * 60 * 60)
        : 0;

    return {
      profile: {
        name: lawyerProfile.name || '',
        photo: lawyerProfile.photo || undefined,
        specialization: lawyerProfile.specialization || undefined,
        primaryCourt: lawyerProfile.primaryCourt?.name,
        rating: 0, // TODO: Implement rating system
      },
      statistics: {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        rejectedRequests,
        averageResponseTime: avgResponseTime,
      },
      recentActivity: {
        recentRequests,
        recentResponses,
        lastLogin: lawyerProfile.user.lastLogin || new Date(),
      },
      quickActions: {
        pendingRequestsCount: pendingRequests,
        viewAllRequestsUrl: `/lawyer/consultation-requests`,
        updateProfileUrl: `/lawyer/profile`,
      },
    };
  }

  /**
   * Get all consultation requests for a lawyer
   * @param lawyerProfileId - The ID of the lawyer profile
   * @returns List of consultation requests with statistics
   */
  async getConsultationRequests(
    lawyerProfileId: string,
  ): Promise<ConsultationRequestsResponseDto> {
    this.logger.log(
      `Fetching consultation requests for lawyer profile ${lawyerProfileId}`,
    );

    // Get consultation request statistics
    const [total, pending, accepted, rejected] = await Promise.all([
      this.prisma.consultationRequest.count({
        where: { lawyerProfileId },
      }),
      this.prisma.consultationRequest.count({
        where: {
          lawyerProfileId,
          responseStatus: 'PENDING',
        },
      }),
      this.prisma.consultationRequest.count({
        where: {
          lawyerProfileId,
          responseStatus: 'ACCEPTED',
        },
      }),
      this.prisma.consultationRequest.count({
        where: {
          lawyerProfileId,
          responseStatus: 'REJECTED',
        },
      }),
    ]);

    // Get all consultation requests
    const requests = await this.prisma.consultationRequest.findMany({
      where: { lawyerProfileId },
      orderBy: { createdAt: 'desc' },
      include: {
        clientProfile: {
          select: {
            name: true,
            photo: true,
          },
        },
      },
    });

    return {
      requests: requests.map((request) => ({
        id: request.id,
        clientProfile: {
          name: request.clientProfile.name || '',
          photo: request.clientProfile.photo || undefined,
        },
        message: request.message,
        status: request.status,
        responseStatus: request.responseStatus,
        response: request.response || undefined,
        responseReason: request.responseReason || undefined,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        responseTimestamp: request.responseTimestamp || undefined,
      })),
      total,
      pending,
      accepted,
      rejected,
    };
  }
}
