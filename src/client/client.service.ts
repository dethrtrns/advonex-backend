import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SavedLawyer,
  ConsultationRequest,
  RequestStatus,
} from '@prisma/client';
import { SavedLawyerDto } from './dto/saved-lawyer.dto';
import { ConsultationRequestDto } from './dto/consultation-request.dto';
import { ConsultationRequestResponseDto } from './dto/consultation-request-response.dto';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Saves a lawyer to a client's shortlist.
   * @param clientProfileId The UUID of the client profile
   * @param lawyerId The UUID of the lawyer profile to save
   * @returns The created SavedLawyer record
   * @throws NotFoundException if the lawyer profile doesn't exist
   * @throws ConflictException if the lawyer is already saved
   */
  async saveLawyer(
    clientProfileId: string,
    lawyerId: string,
  ): Promise<SavedLawyer> {
    this.logger.log(
      `Client ${clientProfileId} attempting to save lawyer ${lawyerId}`,
    );

    // Check if lawyer exists
    const lawyer = await this.prisma.lawyerProfile.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      this.logger.warn(`Lawyer profile not found with ID: ${lawyerId}`);
      throw new NotFoundException(
        `Lawyer profile with ID ${lawyerId} not found`,
      );
    }

    // Check if already saved
    const existingSave = await this.prisma.savedLawyer.findUnique({
      where: {
        clientProfileId_lawyerProfileId: {
          clientProfileId,
          lawyerProfileId: lawyerId,
        },
      },
    });

    if (existingSave) {
      this.logger.warn(
        `Lawyer ${lawyerId} already saved by client ${clientProfileId}`,
      );
      throw new ConflictException('Lawyer already saved to shortlist');
    }

    // Create the save record
    const savedLawyer = await this.prisma.savedLawyer.create({
      data: {
        clientProfileId,
        lawyerProfileId: lawyerId,
      },
    });

    this.logger.log(
      `Successfully saved lawyer ${lawyerId} for client ${clientProfileId}`,
    );
    return savedLawyer;
  }

  /**
   * Retrieves all lawyers saved by a client.
   * @param clientProfileId The UUID of the client profile
   * @returns List of saved lawyers with their profile information
   */
  async getSavedLawyers(clientProfileId: string): Promise<SavedLawyerDto[]> {
    this.logger.log(`Fetching saved lawyers for client ${clientProfileId}`);

    const savedLawyers = await this.prisma.savedLawyer.findMany({
      where: { clientProfileId },
      include: {
        lawyerProfile: {
          include: {
            user: {
              select: {
                clientProfile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            specialization: {
              select: {
                id: true,
                name: true,
              },
            },
            primaryCourt: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.log(
      `Found ${savedLawyers.length} saved lawyers for client ${clientProfileId}`,
    );

    return savedLawyers.map((savedLawyer) => {
      const lawyerProfile = savedLawyer.lawyerProfile;
      const clientProfile = lawyerProfile?.user?.clientProfile;

      return {
        id: savedLawyer.id,
        lawyer: {
          id: lawyerProfile.id,
          name: clientProfile?.name ?? null,
          photo: lawyerProfile.photo,
          location: lawyerProfile.location,
          experience: lawyerProfile.experience,
          bio: lawyerProfile.bio,
          consultFee: lawyerProfile.consultFee,
          isVerified: lawyerProfile.isVerified,
          specialization: lawyerProfile.specialization,
          primaryCourt: lawyerProfile.primaryCourt,
        },
        savedAt: savedLawyer.createdAt,
      };
    });
  }

  /**
   * Creates a consultation request from a client to a lawyer.
   * @param clientProfileId The UUID of the client profile
   * @param requestDto The consultation request details
   * @returns The created consultation request
   * @throws NotFoundException if the lawyer profile doesn't exist
   */
  async requestConsultation(
    clientProfileId: string,
    requestDto: ConsultationRequestDto,
  ): Promise<ConsultationRequest> {
    this.logger.log(
      `Client ${clientProfileId} requesting consultation from lawyer ${requestDto.lawyerId}`,
    );

    // Check if lawyer exists
    const lawyer = await this.prisma.lawyerProfile.findUnique({
      where: { id: requestDto.lawyerId },
    });

    if (!lawyer) {
      this.logger.warn(
        `Lawyer profile not found with ID: ${requestDto.lawyerId}`,
      );
      throw new NotFoundException(
        `Lawyer profile with ID ${requestDto.lawyerId} not found`,
      );
    }

    // Create the consultation request
    const consultationRequest = await this.prisma.consultationRequest.create({
      data: {
        clientProfileId,
        lawyerProfileId: requestDto.lawyerId,
        message: requestDto.message,
        status: RequestStatus.PENDING,
      },
    });

    this.logger.log(
      `Successfully created consultation request ${consultationRequest.id} from client ${clientProfileId} to lawyer ${requestDto.lawyerId}`,
    );

    // TODO: Trigger notification to lawyer
    // This will be implemented when the notification service is ready

    return consultationRequest;
  }

  /**
   * Retrieves all consultation requests made by a client.
   * @param clientProfileId The UUID of the client profile
   * @returns List of consultation requests with lawyer information
   */
  async getConsultationRequests(
    clientProfileId: string,
  ): Promise<ConsultationRequestResponseDto[]> {
    this.logger.log(
      `Fetching consultation requests for client ${clientProfileId}`,
    );

    const requests = await this.prisma.consultationRequest.findMany({
      where: { clientProfileId },
      include: {
        lawyerProfile: {
          include: {
            user: {
              select: {
                clientProfile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            specialization: {
              select: {
                id: true,
                name: true,
              },
            },
            primaryCourt: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    this.logger.log(
      `Found ${requests.length} consultation requests for client ${clientProfileId}`,
    );

    return requests.map((request) => {
      const lawyerProfile = request.lawyerProfile;
      const clientProfile = lawyerProfile?.user?.clientProfile;

      return {
        id: request.id,
        lawyer: {
          id: lawyerProfile.id,
          name: clientProfile?.name ?? null,
          photo: lawyerProfile.photo,
          location: lawyerProfile.location,
          experience: lawyerProfile.experience,
          bio: lawyerProfile.bio,
          consultFee: lawyerProfile.consultFee,
          isVerified: lawyerProfile.isVerified,
          specialization: lawyerProfile.specialization,
          primaryCourt: lawyerProfile.primaryCourt,
        },
        message: request.message,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      };
    });
  }

  /**
   * Retrieves a specific consultation request by ID.
   * @param clientProfileId The UUID of the client profile
   * @param requestId The UUID of the consultation request
   * @returns The consultation request with lawyer information
   * @throws NotFoundException if the request doesn't exist or doesn't belong to the client
   */
  async getConsultationRequestById(
    clientProfileId: string,
    requestId: string,
  ): Promise<ConsultationRequestResponseDto> {
    this.logger.log(
      `Client ${clientProfileId} fetching consultation request ${requestId}`,
    );

    const request = await this.prisma.consultationRequest.findFirst({
      where: {
        id: requestId,
        clientProfileId,
      },
      include: {
        lawyerProfile: {
          include: {
            user: {
              select: {
                clientProfile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            specialization: {
              select: {
                id: true,
                name: true,
              },
            },
            primaryCourt: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      this.logger.warn(
        `Consultation request ${requestId} not found for client ${clientProfileId}`,
      );
      throw new NotFoundException(
        `Consultation request with ID ${requestId} not found`,
      );
    }

    const lawyerProfile = request.lawyerProfile;
    const clientProfile = lawyerProfile?.user?.clientProfile;

    return {
      id: request.id,
      lawyer: {
        id: lawyerProfile.id,
        name: clientProfile?.name ?? null,
        photo: lawyerProfile.photo,
        location: lawyerProfile.location,
        experience: lawyerProfile.experience,
        bio: lawyerProfile.bio,
        consultFee: lawyerProfile.consultFee,
        isVerified: lawyerProfile.isVerified,
        specialization: lawyerProfile.specialization,
        primaryCourt: lawyerProfile.primaryCourt,
      },
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  /**
   * Cancels a specific consultation request.
   * @param clientProfileId The UUID of the client profile
   * @param requestId The UUID of the consultation request
   * @returns The updated consultation request
   * @throws NotFoundException if the request doesn't exist or doesn't belong to the client
   * @throws BadRequestException if the request is not in a cancellable state
   */
  async cancelConsultationRequest(
    clientProfileId: string,
    requestId: string,
  ): Promise<ConsultationRequestResponseDto> {
    this.logger.log(
      `Client ${clientProfileId} attempting to cancel consultation request ${requestId}`,
    );

    const request = await this.prisma.consultationRequest.findFirst({
      where: {
        id: requestId,
        clientProfileId,
      },
      include: {
        lawyerProfile: {
          include: {
            user: {
              select: {
                clientProfile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            specialization: {
              select: {
                id: true,
                name: true,
              },
            },
            primaryCourt: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      this.logger.warn(
        `Consultation request ${requestId} not found for client ${clientProfileId}`,
      );
      throw new NotFoundException(
        `Consultation request with ID ${requestId} not found`,
      );
    }

    // Check if the request is in a cancellable state
    if (request.status !== RequestStatus.PENDING) {
      this.logger.warn(
        `Cannot cancel consultation request ${requestId} in status ${request.status}`,
      );
      throw new BadRequestException(
        `Cannot cancel consultation request in status ${request.status}`,
      );
    }

    // Update the request status to CLOSED
    const updatedRequest = await this.prisma.consultationRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.CLOSED },
      include: {
        lawyerProfile: {
          include: {
            user: {
              select: {
                clientProfile: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            specialization: {
              select: {
                id: true,
                name: true,
              },
            },
            primaryCourt: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Successfully closed consultation request ${requestId} for client ${clientProfileId}`,
    );

    const lawyerProfile = updatedRequest.lawyerProfile;
    const clientProfile = lawyerProfile?.user?.clientProfile;

    return {
      id: updatedRequest.id,
      lawyer: {
        id: lawyerProfile.id,
        name: clientProfile?.name ?? null,
        photo: lawyerProfile.photo,
        location: lawyerProfile.location,
        experience: lawyerProfile.experience,
        bio: lawyerProfile.bio,
        consultFee: lawyerProfile.consultFee,
        isVerified: lawyerProfile.isVerified,
        specialization: lawyerProfile.specialization,
        primaryCourt: lawyerProfile.primaryCourt,
      },
      message: updatedRequest.message,
      status: updatedRequest.status,
      createdAt: updatedRequest.createdAt,
      updatedAt: updatedRequest.updatedAt,
    };
  }
}
