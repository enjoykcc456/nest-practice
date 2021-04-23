import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(resource: string | number) {
    super(
      `[NotFoundException] No user found with ${
        typeof resource === 'string' ? 'username' : 'id'
      } of ${resource}`,
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InputValidationException extends HttpException {
  constructor(error: any) {
    super(
      {
        message: '[InputValidationException] Input data validation failed',
        error,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
