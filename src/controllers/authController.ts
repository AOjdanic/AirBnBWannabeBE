import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Types } from 'mongoose';
import { Request, NextFunction, Response } from 'express';

import User from '../models/Users';
import sendEmail from '../services/email';
import { AppError } from '../services/AppError';
import { catchAsyncErrors } from '../services/catchAsyncErrors';
import { UserDocument } from '../types/types';

type Decoded = {
  id: string;
  iat: number;
  exp: string;
};

function createAndSendToken(user: UserDocument, status: number, res: Response) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN!)),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(status).json({
    message: 'success',
    token,
    data: {
      user,
    },
  });
}

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

  createAndSendToken(newUser, 201, res);
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

  createAndSendToken(user, 200, res);
});

export const protect = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
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
  (req: Request, _: Response, next: NextFunction) => {
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
  async (req: Request, res: Response, next: NextFunction) => {
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

  createAndSendToken(user, 200, res);
});

export const updatePassword = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordNew, passwordConfirm } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(
        new AppError('You are not logged in. Please log in first', 401),
      );
    }

    const passwordsMatch = await user.comparePasswords(password, user.password);

    if (!passwordsMatch)
      return next(
        new AppError('Invalid password provided. Please try again', 401),
      );

    user.password = passwordNew;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    createAndSendToken(user, 200, res);
  },
);
