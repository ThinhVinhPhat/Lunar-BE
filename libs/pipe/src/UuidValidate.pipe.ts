import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class UuidValidatePipe implements PipeTransform {
  transform(value: string): string {
    const isValidUuid = isUuid(value);

    if (!isValidUuid) {
      throw new BadRequestException('ID must be a valid UUID');
    }

    return value;
  }
}
