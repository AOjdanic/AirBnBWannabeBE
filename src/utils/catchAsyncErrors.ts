/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';

export const catchAsyncErrors =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
