import { NextFunction, Request, Response } from 'express';

import User from '../models/Users';
import { AppError } from '../utils/AppError';
import { catchAsyncErrors } from '../utils/catchAsyncErrors';

export const getAllUsers = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  },
);

export const updateMe = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordConfirm, name } = req.body;

    if (password || passwordConfirm) {
      return next(
        new AppError(
          "You can't update your password through this endpoint",
          400,
        ),
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);
