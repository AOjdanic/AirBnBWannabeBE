import express from 'express';

const router = express.Router();

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';

import { getAllUsers } from '../controllers/usersController';

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);

router.route('/').get(getAllUsers);

export default router;
