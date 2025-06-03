import { HttpException, HttpStatus } from '@nestjs/common';

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
        throw new HttpException(value.message, HttpStatus.NOT_FOUND);
      }
    }
    if (value.type === AssertType.CONFLICT) {
      if (!value.params.value) {
        throw new HttpException(value.message, HttpStatus.CONFLICT);
      }
    }
    if (value.type === AssertType.INVALID_STATUS) {
      if (value.params.value !== value.params.status) {
        throw new HttpException(value.message, HttpStatus.BAD_REQUEST);
      }
    }
  });
}

export function assert(value: valueProp) {
  if (value.type === AssertType.NOT_FOUND) {
    if (!value.params) {
      throw new HttpException(value.message, HttpStatus.NOT_FOUND);
    }
  }

  if (value.type === AssertType.CONFLICT) {
    if (value.params) {
      throw new HttpException(value.message, HttpStatus.CONFLICT);
    }
  }
}

export function assertTime(startTime: Date, endTime: Date) {
  if (startTime >= endTime) {
    throw new HttpException(
      'StartTime must before EndTime',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (startTime.getTime() === endTime.getTime()) {
    throw new HttpException(
      'Start time and end time cannot be the same',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (startTime.getTime() < Date.now()) {
    throw new HttpException(
      'Start time cannot be in the past',
      HttpStatus.BAD_REQUEST,
    );
  }
}
