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

import {
  deleteUser,
  getAllUsers,
  updateUserData,
} from '../controllers/usersController';

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);

router.use(protect);

router.route('/update-password').patch(updatePassword);
router.route('/update-user-data').patch(updateUserData);

router.route('/delete-account').delete(deleteUser);

router.route('/').get(getAllUsers);

export default router;
