import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException, // Added import
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProfile, LawyerProfile, Role, Prisma } from '@prisma/client';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { UpdateLawyerProfileDto } from './dto/update-lawyer-profile.dto';
import { equals } from 'class-validator';
import { practiceCourts } from 'src/data/seedData';
import { CityDto, LocationDetailsDto } from 'src/common/dto/location-details.dto';
import { connect } from 'http2';
import { PracticeAreaDto } from './dto/practice-area.dto';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Fetches the client profile for the currently authenticated user.
   * Ensures the user has the CLIENT role.
   */
  async getClientProfile(user: JwtPayload): Promise<ClientProfile> {
    this.logger.log(`Fetching client profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.CLIENT)) {
      this.logger.warn(
        `User ${user.sub} attempted to access client profile without CLIENT role.`,
      );
      throw new ForbiddenException('Access denied. User is not a client.');
    }

    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId: user.sub },
    });

    if (!profile) {
      this.logger.warn(`Client profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Client profile not found for user ID: ${user.sub}`,
      );
    }

    this.logger.log(
      `Successfully fetched client profile ID: ${profile.id} for user ID: ${user.sub}`,
    );
    return profile;
  }

  /**
   * Updates the client profile for the currently authenticated user.
   * Sets registrationPending to false upon successful update.
   */
  async updateClientProfile(
    user: JwtPayload,
    updateClientProfileDto: UpdateClientProfileDto,
  ): Promise<ClientProfile> {
    this.logger.log(`Updating client profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.CLIENT)) {
      this.logger.warn(
        `User ${user.sub} attempted to update client profile without CLIENT role.`,
      );
      throw new ForbiddenException('Access denied. User is not a client.');
    }

    const existingProfile = await this.prisma.clientProfile.findUnique({
      where: { userId: user.sub },
    });

    if (!existingProfile) {
      this.logger.warn(`Client profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Client profile not found for user ID: ${user.sub}`,
      );
    }

    const updateData: Prisma.ClientProfileUpdateInput = {
      ...updateClientProfileDto,
      registrationPending: false, // Mark registration as complete
    };

    try {
      const updatedProfile = await this.prisma.clientProfile.update({
        where: { userId: user.sub },
        data: updateData,
      });

      this.logger.log(
        `Successfully updated client profile ID: ${updatedProfile.id} for user ID: ${user.sub}`,
      );
      return updatedProfile;
    } catch (error) {
      this.logger.error(
        `Failed to update client profile for user ID: ${user.sub}. Error: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors, e.g., unique constraint violation
        throw new InternalServerErrorException(
          `Database error while updating client profile: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `An unexpected error occurred while updating client profile: ${error.message}`,
      );
    }
  }

  /**
   * Fetches the lawyer profile for the currently authenticated user.
   * Ensures the user has the LAWYER role.
   */
  async getLawyerProfile(user: JwtPayload): Promise<LawyerProfile> {
    this.logger.log(`Fetching lawyer profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.LAWYER)) {
      this.logger.warn(
        `User ${user.sub} attempted to access lawyer profile without LAWYER role.`,
      );
      throw new ForbiddenException('Access denied. User is not a lawyer.');
    }

    const profile = await this.prisma.lawyerProfile.findUnique({
      where: { userId: user.sub },
      include: {
        practiceAreas: {
          include: {
            practiceArea: true,
          },
        },
        practiceCourts: {
          include: {
            practiceCourt: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        specialization: true,
        primaryCourt: true,
        education: true,
      },
    });

    if (!profile) {
      this.logger.warn(`Lawyer profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Lawyer profile not found for user ID: ${user.sub}`,
      );
    }

    this.logger.log(
      `Successfully fetched lawyer profile ID: ${profile.id} for user ID: ${user.sub}`,
    );
    return profile;
  }

  /**
   * Updates the lawyer profile for the currently authenticated user.
   * Sets registrationPending to false upon successful update.
   * Handles relational fields by creating or finding existing records.
   */
  async updateLawyerProfile(
    user: JwtPayload,
    updateLawyerProfileDto: UpdateLawyerProfileDto,
  ): Promise<LawyerProfile> {
    this.logger.log(`Updating lawyer profile for user ID: ${user.sub}`);

    if (!user.roles.includes(Role.LAWYER)) {
      this.logger.warn(
        `User ${user.sub} attempted to update lawyer profile without LAWYER role.`,
      );
      throw new ForbiddenException('Access denied. User is not a lawyer.');
    }

    const existingProfile = await this.prisma.lawyerProfile.findUnique({
      where: { userId: user.sub },
      include: {
        practiceCourts: {
          include: {
            practiceCourt: true,
          },
        },
        practiceAreas: {
          include: {
            practiceArea: true,
          },
        },
      },
    });

    if (!existingProfile) {
      this.logger.warn(`Lawyer profile not found for user ID: ${user.sub}`);
      throw new NotFoundException(
        `Lawyer profile not found for user ID: ${user.sub}`,
      );
    }

    try {
      const updatedProfile = await this.prisma.$transaction(async (prisma) => {
        // Handle specialization
        let specializationId: string | null = null;
        if (updateLawyerProfileDto?.specialization?.name && !updateLawyerProfileDto.specialization?.id) {
          const specialization = await this.findOrCreatePracticeArea(
            updateLawyerProfileDto.specialization.name,
          );
          specializationId = specialization.id;
        }
        let locationData: LocationDetailsDto | undefined = undefined;
        try {
          // Handle location: frontend must send both ID and city ID
          if (updateLawyerProfileDto.location?.id) {
            locationData = await this.prisma.location.update({
              where: { id: updateLawyerProfileDto.location.id },
              data: {
                address: updateLawyerProfileDto.location.address || undefined,
                latitude: updateLawyerProfileDto.location.latitude || undefined,
                longitude: updateLawyerProfileDto.location.longitude || undefined,
                locationOf: 'LAWYER',
                // cityId: updateLawyerProfileDto.location.city.id,
                city: {
                  connect: { id: updateLawyerProfileDto.location?.city?.id || undefined },
                },
              },
              select: {
                id: true,
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: {
                      select: {
                        id: true,
                        name: true,
                        country: {
                          select: { id: true, name: true },
                        },
                      },
                    },
                  },
                },
              }
            });
          }
          if (!updateLawyerProfileDto?.location?.id && updateLawyerProfileDto.location?.city?.id) {
            locationData = await this.prisma.location.create({
              data: {
                address: updateLawyerProfileDto.location.address || undefined,
                latitude: updateLawyerProfileDto.location.latitude || undefined,
                longitude: updateLawyerProfileDto.location.longitude || undefined,
                locationOf: 'LAWYER',
                city: { connect: { id: updateLawyerProfileDto.location.city.id } },
              },
              select: {
                id: true,
                city: {
                  select: {
                    id: true,
                    name: true,
                    state: {
                      select: {
                        id: true,
                        name: true,
                        country: {
                          select: { id: true, name: true },
                        },
                      },
                    },
                  },
                },
              },
            });
          }
        } catch (error) {
          this.logger.error(`Error updating location for user ID: ${user.sub}`, error);
          throw new InternalServerErrorException('Error updating location');
        }
        this.logger.log(`Location data for user ID ${user.sub}: ${(locationData)}`);
        const locationId = locationData?.id || undefined;
        // Handle primary court
        let primaryCourtId: string | undefined = undefined;
        if (updateLawyerProfileDto.primaryCourt?.name && !updateLawyerProfileDto.primaryCourt?.id) {
          const primaryCourt = await this.findOrCreatePracticeCourt(
            updateLawyerProfileDto.primaryCourt.name,
          );
          primaryCourtId = primaryCourt.id;
        }

        // Main profile update logic
        await prisma.lawyerProfile.update({
          where: {
            userId: user.sub,
          },
          data: {
            name: updateLawyerProfileDto.name || undefined,
            photo: updateLawyerProfileDto.photo || undefined,
            locationId: locationId || undefined,
            experience: updateLawyerProfileDto.experience || undefined,
            bio: updateLawyerProfileDto.bio || undefined,
            consultFee: updateLawyerProfileDto.consultFee || undefined,
            barId: updateLawyerProfileDto.barId || undefined,
            isVerified: updateLawyerProfileDto.isVerified || undefined,
            registrationPending: updateLawyerProfileDto.registrationPending ? updateLawyerProfileDto.registrationPending : true,
            specializationId: (updateLawyerProfileDto.specialization?.id ? updateLawyerProfileDto.specialization.id : specializationId) || undefined,
            primaryCourtId: (updateLawyerProfileDto.primaryCourt?.id ? updateLawyerProfileDto.primaryCourt.id : primaryCourtId) || undefined,
            education: updateLawyerProfileDto.education
              ? {
                upsert: {
                  create: updateLawyerProfileDto.education,
                  update: updateLawyerProfileDto.education,
                },
              }
              : undefined,
          },
        });
        // Many-to-many relationships logic
        
        // Clarify frontend expectations
        // Disconnect existing many-to-many relations
        // await prisma.lawyerPracticeArea.deleteMany({
        //   where: { lawyerProfileId: existingProfile.id },
        // });
        // await prisma.lawyerPracticeCourt.deleteMany({
        //   where: { lawyerProfileId: existingProfile.id },
        // });

        // Handle Practice Areas
        if (updateLawyerProfileDto.practiceAreas) {
          for (const areaDto of updateLawyerProfileDto.practiceAreas) {
            let practiceArea;
            if (!areaDto.id) {
              practiceArea = await prisma.practiceArea.findUnique({
                where: { name: areaDto.name },
                select: { id: true },
                // User Can NOT create or update static practice areas for now...
                // where: { name: areaDto.name },
                // update: { name: areaDto.name, description: areaDto.description },
                // create: {
                //   name: areaDto.name,
                //   description: areaDto.description,
                // },
              });
            }
            
            
            // If there's existing practice courts in the profile, we skip them
            //Only create a new entry if the court is not already associated with the profile
            await prisma.lawyerPracticeCourt.upsert({
              where: {
                lawyerProfileId_practiceCourtId: {
                  lawyerProfileId: existingProfile.id,
                  practiceCourtId: areaDto?.id ? areaDto.id : practiceArea.id,
                },
              },
              create: {
                lawyerProfileId: existingProfile.id,
                practiceCourtId: areaDto?.id ? areaDto.id : practiceArea.id,
              },
              update: {},
            });
          }

          // Handle Practice courts location
          // for (courtDto.location.cityId of updateLawyerProfileDto.practiceCourts) { }
          // Handle Practice Courts
          if (updateLawyerProfileDto.practiceCourts) {
            for (const courtDto of updateLawyerProfileDto.practiceCourts) {
              let practiceCourt;
              if (!courtDto.id) {
                practiceCourt = await prisma.practiceCourt.findUnique({
                  where: { name: courtDto.name },
                  select: { id: true },
                });
              }
              // let updatedCourtLocation: LocationDetailsDto | null = null;
              let updatedCourtLocation: any;
              // Where are we connecting newly updated or created location ?
              if (!courtDto.location?.id && courtDto.location?.city?.id) {
                updatedCourtLocation = await this.prisma.location.create({
               
                  data: {
                    address: courtDto.location.address || undefined,
                    latitude: courtDto.location.latitude || undefined,
                    longitude: courtDto.location.longitude || undefined,
                    city: { connect: { id: courtDto.location.city?.id } }, // we can also use city name if its unique.
                    practiceCourts: { connect: { id: courtDto.id || undefined, name: courtDto.name || undefined } },
                    locationOf: 'PRACTICE_COURT'

                  },
                  select: {
                    id: true,
                 
                    city: {
                      select: { id: true, name: true, state: { select: { id: true, name: true, country: { select: { id: true, name: true } } } } },
                    },
                  
                  }
                })
              };
              if (courtDto.location?.id) {
                await this.prisma.location.update({
                  where: { id: courtDto.location.id, locationOf: 'PRACTICE_COURT' },
                  data: {
                    address: courtDto.location.address || undefined,
                    latitude: courtDto.location.latitude || undefined,
                    longitude: courtDto.location.longitude || undefined,
                    cityId: courtDto.location?.city?.id || undefined,
                    locationOf: 'PRACTICE_COURT',
                    practiceCourts: { connect: { id: courtDto.id || undefined, name: courtDto.name || undefined } },
                  },
                });
              }
              // User can NOT create or update practice courts for now...
              // const practiceCourt = await prisma.practiceCourt.upsert({
              //   where: { name: courtDto.name },
              //   update: { name: courtDto.name, locationId: updatedCourtLocation?.id || undefined || courtDto.locationId },
              //   create: {
              //     name: courtDto.name,
              //     locationId:  updatedCourtLocation?.id ,
              //   },
              // });

          
              {
                // If there's existing practice courts in the profile, we skip them
                //Only create a new entry if the court is not already associated with the profile
                await prisma.lawyerPracticeCourt.upsert({
                  where: {
                    lawyerProfileId_practiceCourtId: {
                      lawyerProfileId: existingProfile.id,
                      practiceCourtId: courtDto?.id ? courtDto.id : practiceCourt.id,
                    },
                  },
                  create: {
                    lawyerProfileId: existingProfile.id,
                    practiceCourtId: courtDto?.id ? courtDto.id : practiceCourt.id,
                  },
                  update: {},
                });
              }
            }
          }

          return prisma.lawyerProfile.findUnique({
            where: { userId: user.sub },
            include: {
              practiceAreas: { include: { practiceArea: true } },
              practiceCourts: { include: { practiceCourt: true } },
              services: { include: { service: true } },
              specialization: true,
              primaryCourt: true,
              education: true,
              location: {
                include: {
                  city: {
                    include: {
                      state: {
                        include: {
                          country: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
      
      
        }
      })
    
    
  
  

      if (!updatedProfile) {
        this.logger.warn(`Failed to update Lawyer profile for user ID: ${user.sub}; Please try again`);
        throw new InternalServerErrorException(
          `Transaction failed to update lawyer profile for user ID: ${user.sub}`,
        );
      }
    
      this.logger.log(
        `Successfully updated lawyer profile ID: ${updatedProfile.id} for user ID: ${user.sub}`,
      );
      return updatedProfile;
    }
catch (error) {
      this.logger.error(
        `Failed to update lawyer profile for user ID: ${user.sub}. Error: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          `Database error while updating lawyer profile: ${error.message}`,
        );
      }
      // Hadnle P2002 error for unique constraint violations
      if (error.code === 'P2002') {
        this.logger.warn(
          `Unique constraint violation while updating lawyer profile for user ID: ${user.sub}. Error: ${error.message}`,
        );
        throw new BadRequestException(
          `Unique constraint violation in DB: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `An unexpected error occurred while updating lawyer profile: ${error.message}`,
      );
    }
  }



  /**
   * Finds an existing practice area by name or creates a new one if not found.
   */
  private async findOrCreatePracticeArea(name: string) {
    const existingArea = await this.prisma.practiceArea.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingArea) {
      return existingArea;
    }

    return this.prisma.practiceArea.create({
      data: {
        name,
        description: `Practice area: ${name}`,
      },
    });
  }

  /**
   * Finds an existing practice court by name or creates a new one if not found.
   */
  private async findOrCreatePracticeCourt(name: string) {
    const existingCourt = await this.prisma.practiceCourt.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingCourt) {
      return existingCourt;
    }

    return this.prisma.practiceCourt.create({
      data: {
        name
      },
    });
  }
}


