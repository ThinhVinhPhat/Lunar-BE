import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  getPaginationMeta(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return {
      skip,
    };
  }
}
