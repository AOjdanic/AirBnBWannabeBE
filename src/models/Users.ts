import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

type UserSchema = {
  name: string;
  email: string;
  birthdate: string;
  address: string;
  username: string;
  password: string;
  passwordConfirm?: string;
};

const userSchema = new mongoose.Schema<UserSchema>({
  name: {
    type: String,
    required: [true, 'Please provide both your first and last name'],
    validate: {
      validator: function (name: string) {
        return name.split(' ').length === 2;
      },
      message: () => 'Name must be composed of only two words',
    },
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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
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
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('users', userSchema);

export default User;
