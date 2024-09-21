import { TAppError } from '../types';

export class AppError extends Error implements TAppError {
  status: string;
  statusCode: number;
  isOperational: boolean;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith('4') ? 'failure' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
