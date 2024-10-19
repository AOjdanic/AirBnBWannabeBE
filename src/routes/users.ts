import express from 'express';

const router = express.Router();

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} from '../controllers/authController';

import { getAllUsers, updateMe } from '../controllers/usersController';

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);
router.route('/update-password').patch(protect, updatePassword);
router.route('/update-me').patch(protect, updateMe);

router.route('/').get(getAllUsers);

export default router;
