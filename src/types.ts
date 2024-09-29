import { Request } from 'express';

export interface TAppError {
  status: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
}

export type UserSchema = {
  name: string;
  email: string;
  birthdate: string;
  address: string;
  username: string;
  password: string;
  passwordConfirm?: string;
  changedPasswordAt?: string;
};

export type RequestWithUser = Request & { user?: UserSchema };
