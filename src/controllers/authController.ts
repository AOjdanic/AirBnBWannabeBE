import User from '../models/Users';
import { AppError } from '../utils/AppError';
import { catchAsyncErrors } from '../utils/catchAsyncErrors';

export const signup = catchAsyncErrors(async (req, res, next) => {
  const { email, password, passwordConfirm, name } = req.body;

  const alreadyExistingUser = await User.findOne({ email });
  if (alreadyExistingUser) {
    return next(new AppError('The user with this email already exists', 400));
  }

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  res.status(200).json({
    message: 'ethentuihent',
    data: {
      user: newUser,
    },
  });
});
