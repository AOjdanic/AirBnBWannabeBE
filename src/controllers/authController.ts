import User from '../models/Users';
import { catchAsyncErrors } from '../utils/catchAsyncErrors';

export const signup = catchAsyncErrors(async (req, res) => {
  const { email, password, passwordConfirm, name } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  res.status(200).json({
    message: 'success',
    data: {
      user: newUser,
    },
  });
});
