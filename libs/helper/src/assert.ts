import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export enum AssertType {
  NOT_FOUND = 'notFound',
  CONFLICT = 'conflict',
  INVALID_STATUS = 'invalidStatus',
}

type valueProp = {
  params: any;
  message: string;
  type: AssertType;
};

export function assertValues(values: valueProp[]) {
  values.forEach((value) => {
    if (value.type === AssertType.NOT_FOUND) {
      if (!value.params.value) {
        throw new NotFoundException(value.message);
      }
    }
    if (value.type === AssertType.CONFLICT) {
      if (!value.params.value) {
        throw new ConflictException(value.message);
      }
    }
    if (value.type === AssertType.INVALID_STATUS) {
      if (value.params.value !== value.params.status) {
        throw new ConflictException(value.message);
      }
    }
  });
}

export function assert(value: valueProp) {
  if (value.type === AssertType.NOT_FOUND) {
    if (!value.params) {
      throw new NotFoundException(value.message);
    }
  }

  if (value.type === AssertType.CONFLICT) {
    if (value.params) {
      throw new ConflictException(value.message);
    }
  }
}

export function assertTime(startTime: Date, endTime: Date) {
  if (startTime >= endTime) {
    throw new ForbiddenException('StartTime must before EndTime');
  }

  if (startTime.getTime() === endTime.getTime()) {
    throw new ForbiddenException('Start time and end time cannot be the same');
  }
  if (startTime.getTime() < Date.now()) {
    throw new ForbiddenException('Start time cannot be in the past');
  }
}
