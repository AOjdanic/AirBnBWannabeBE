import { NextFunction, Request, Response } from 'express';

import User from '../models/Users';
import { AppError } from '../services/AppError';
import { catchAsyncErrors } from '../services/catchAsyncErrors';

export const getAllUsers = catchAsyncErrors(
  async (_: Request, res: Response) => {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      length: users.length,
      data: {
        users,
      },
    });
  },
);

export const updateUserData = catchAsyncErrors(
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

export const deleteUser = catchAsyncErrors(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
