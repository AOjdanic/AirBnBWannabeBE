import { Request } from 'express';
import { Model, Types, HydratedDocument } from 'mongoose';

export interface TAppError {
  status: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
}

export type UserType = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  birthdate: string;
  address: string;
  username: string;
  password: string;
  passwordConfirm: string | undefined;
  changedPasswordAt: Date;
  role: 'admin' | 'user';
  passwordResetToken: string | undefined;
  passwordResetTokenExpires: number | undefined;
};

export type UserStaticMethods = {
  comparePasswords: (inputPass: string, userPass: string) => Promise<boolean>;
  createPasswordResetToken: () => string;
  changedPasswordAfterIssuedToken: (jwtTimestamp: number) => boolean;
};

export type UserModel = Model<UserType, object, UserStaticMethods>;

type UserDocument = HydratedDocument<UserType, UserStaticMethods>;

export type RequestWithUser = Request & { user?: UserDocument };
