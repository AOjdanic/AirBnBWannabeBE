import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Types } from 'mongoose';
import { NextFunction, Response } from 'express';

import User from '../models/Users';
import sendEmail from '../utils/email';
import { RequestWithUser } from '../types';
import { AppError } from '../utils/AppError';
import { catchAsyncErrors } from '../utils/catchAsyncErrors';

type Decoded = {
  id: string;
  iat: number;
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

    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401),
      );
    }

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

export const forgotPassword = catchAsyncErrors(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return next(new AppError('User with provided email does not exist', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;

    try {
      await sendEmail({
        message: `Use the link at ${resetURL} in order to reset your password. If you did not request this change, please ignore this email`,
        to: user.email,
        subject: 'Reset password',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'Something wrong happened with the password reset request. Please try again',
          500,
        ),
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Reset password link sent to the email',
    });
  },
);

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token: tokenParam } = req.params;

  const hashToken = crypto
    .createHash('sha256')
    .update(tokenParam)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

export const updatePassword = catchAsyncErrors(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { password, passwordNew, passwordMatch } = req.body;
    // 1) get user from the collection
    const user = req.user;

    if (!user) {
      return next(
        new AppError('You are not logged in. Please log in first', 401),
      );
    }

    const passwordsMatch = await user.comparePasswords(
      password,
      user?.password,
    );

    if (!passwordsMatch)
      return next(
        new AppError('Invalid password provided. Please try again', 401),
      );

    // 3) if so, update password
    user.password = passwordNew;
    user.passwordConfirm = passwordMatch;
    await user.save();
    // 4) log user in, send JWT

    const token = signToken(user._id);
    res.status(200).json({
      user,
      token,
    });
  },
);
