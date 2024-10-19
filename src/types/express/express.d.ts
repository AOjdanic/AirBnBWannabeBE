// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import { Request } from 'express';
import { UserDocument } from '../types';

declare global {
  namespace Express {
    export interface Request {
      user: UserDocument;
    }
  }
}
