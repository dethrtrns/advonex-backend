import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PracticeArea,
  PracticeCourt,
  LawyerPracticeArea,
  LawyerPracticeCourt,
} from '@prisma/client';

@Injectable()
export class StaticDataService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all practice areas from the database.
   * @returns {Promise<PracticeArea[]>} A list of all practice areas.
   */
  async findAllPracticeAreas(): Promise<PracticeArea[]> {
    return this.prisma.practiceArea.findMany();
  }

  /**
   * Retrieves all practice courts from the database.
   * @returns {Promise<PracticeCourt[]>} A list of all practice courts.
   */
  async findAllCourts(): Promise<PracticeCourt[]> {
    return this.prisma.practiceCourt.findMany();
  }

  /**
   * Associates a practice area with a lawyer's profile.
   * @param {string} lawyerProfileId - The ID of the lawyer's profile.
   * @param {string} practiceAreaId - The ID of the practice area.
   * @returns {Promise<LawyerPracticeArea>} The created association record.
   * @throws {NotFoundException} If the lawyer profile or practice area doesn't exist.
   */
  async addPracticeAreaToLawyer(
    lawyerProfileId: string,
    practiceAreaId: string,
  ): Promise<LawyerPracticeArea> {
    // Optional: Add checks to ensure lawyerProfileId and practiceAreaId exist
    // This can prevent orphaned records but adds overhead.
    // Example check:
    // const lawyerExists = await this.prisma.lawyerProfile.findUnique({ where: { id: lawyerProfileId } });
    // if (!lawyerExists) throw new NotFoundException(`Lawyer profile with ID ${lawyerProfileId} not found`);
    // const areaExists = await this.prisma.practiceArea.findUnique({ where: { id: practiceAreaId } });
    // if (!areaExists) throw new NotFoundException(`Practice area with ID ${practiceAreaId} not found`);

    return this.prisma.lawyerPracticeArea.create({
      data: {
        lawyerProfileId,
        practiceAreaId,
      },
    });
  }

  /**
   * Removes a practice area association from a lawyer's profile.
   * @param {string} lawyerProfileId - The ID of the lawyer's profile.
   * @param {string} practiceAreaId - The ID of the practice area.
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the association doesn't exist.
   */
  async removePracticeAreaFromLawyer(
    lawyerProfileId: string,
    practiceAreaId: string,
  ): Promise<void> {
    const result = await this.prisma.lawyerPracticeArea.deleteMany({
      where: {
        lawyerProfileId,
        practiceAreaId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Association between lawyer ${lawyerProfileId} and practice area ${practiceAreaId} not found.`,
      );
    }
  }

  /**
   * Associates a practice court with a lawyer's profile.
   * @param {string} lawyerProfileId - The ID of the lawyer's profile.
   * @param {string} practiceCourtId - The ID of the practice court.
   * @returns {Promise<LawyerPracticeCourt>} The created association record.
   * @throws {NotFoundException} If the lawyer profile or practice court doesn't exist.
   */
  async addPracticeCourtToLawyer(
    lawyerProfileId: string,
    practiceCourtId: string,
  ): Promise<LawyerPracticeCourt> {
    // Optional: Add checks for existence similar to addPracticeAreaToLawyer
    return this.prisma.lawyerPracticeCourt.create({
      data: {
        lawyerProfileId,
        practiceCourtId,
      },
    });
  }

  /**
   * Removes a practice court association from a lawyer's profile.
   * @param {string} lawyerProfileId - The ID of the lawyer's profile.
   * @param {string} practiceCourtId - The ID of the practice court.
   * @returns {Promise<void>}
   * @throws {NotFoundException} If the association doesn't exist.
   */
  async removePracticeCourtFromLawyer(
    lawyerProfileId: string,
    practiceCourtId: string,
  ): Promise<void> {
    const result = await this.prisma.lawyerPracticeCourt.deleteMany({
      where: {
        lawyerProfileId,
        practiceCourtId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        `Association between lawyer ${lawyerProfileId} and practice court ${practiceCourtId} not found.`,
      );
    }
  }
}
