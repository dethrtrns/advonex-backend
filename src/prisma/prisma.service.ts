import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Function-level comment: Called once the host module has been initialized.
  async onModuleInit() {
    // Connect to the database when the module initializes
    await this.$connect();
  }

  // Function-level comment: Called once the host module gets destroyed.
  async onModuleDestroy() {
    // Disconnect from the database when the module is destroyed
    await this.$disconnect();
  }
}
