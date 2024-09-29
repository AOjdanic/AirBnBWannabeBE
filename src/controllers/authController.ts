import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Types } from 'mongoose';
import { NextFunction, Response } from 'express';

import User from '../models/Users';
import { RequestWithUser } from '../types';
import { AppError } from '../utils/AppError';
import { catchAsyncErrors } from '../utils/catchAsyncErrors';

type Decoded = {
  id: string;
  iat: string;
  exp: string;
};

const signToken = (id: Types.ObjectId) =>
  jwt.sign({ id: id.toString('hex') }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const signup = catchAsyncErrors(async (req, res) => {
  const { email, password, passwordConfirm, name } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    message: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide an email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  // @ts-expect-error will fix types of user doc/schema
  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(
      new AppError('Invalid credentials provided. Please try again', 401),
    );
  }

  const token = signToken(user._id);

  res.status(200).json({
    token,
    message: 'success',
  });
});

export const protect = catchAsyncErrors(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let token = '';
    if (!req.headers.authorization) {
      return next(
        new AppError('You are not logged in. Please log in and come back', 401),
      );
    }

    if (
      req.headers.authorization &&
      req.headers.authorization?.startsWith('Bearer')
    ) {
      const header = req.headers.authorization;
      if (header) {
        const jwt = header?.split(' ')?.[1];
        token = jwt;
      }
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in and come back', 401),
      );
    }
    // @ts-expect-error does not recognize the function signature
    // prettier-ignore
    const decoded: Decoded = await promisify(jwt.verify)( token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401),
      );
    }

    // @ts-expect-error does not recognize the function signature
    if (user.changedPasswordAfterIssuedToken(decoded.iat)) {
      return next(
        new AppError(
          'User has recently changed their password. Please log in again.',
          401,
        ),
      );
    }

    req.user = user;

    next();
  },
);

export const restrictTo =
  (...roles: string[]) =>
  (req: RequestWithUser, _: Response, next: NextFunction) => {
    if (req?.user?.role && !roles.includes(req?.user?.role)) {
      return next(
        new AppError(
          'You do not have permissions to access this resource',
          403,
        ),
      );
    }

    next();
  };
