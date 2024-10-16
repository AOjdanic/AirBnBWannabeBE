import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { UserSchema } from '../types';

const userSchema = new mongoose.Schema<UserSchema>({
  name: {
    type: String,
    required: [true, 'Please provide both your first and last name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  birthdate: Date,
  address: String,
  username: {
    type: String,
    default: function () {
      const [firstName, lastName] = this.name.split(' ');

      return `${firstName[0]}${lastName}`.toLowerCase();
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (passwordConfirm: string) {
        return passwordConfirm === this.password;
      },
      message: 'The passwords do not match',
    },
  },
  changedPasswordAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = (Date.now() - 1000).toString(10);

  next();
});

userSchema.methods.comparePasswords = async function (
  inputPass: string,
  userPass: string,
) {
  return await bcrypt.compare(inputPass, userPass);
};

userSchema.methods.changedPasswordAfterIssuedToken = function (
  jwtTimestamp: number,
) {
  if (this?.changedPasswordAt) {
    const changedTimestamp = this.changedPasswordAt.getTime() / 1000;

    return changedTimestamp > jwtTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('users', userSchema);

export default User;
