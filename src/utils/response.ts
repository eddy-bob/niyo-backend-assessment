import { HttpStatus } from '@nestjs/common';

export class SuccessResponse {
  statusCode: HttpStatus;
  message: string;
  data: any;

  constructor(data: any, message: string, statusCode = HttpStatus.OK) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
