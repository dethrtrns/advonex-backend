import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return {
      message:
        'Hello World from Advonex API! hey. This line should not be there in docker',
    };
  }
}
