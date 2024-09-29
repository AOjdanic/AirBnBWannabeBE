import express from 'express';

const router = express.Router();

import { signup, login } from '../controllers/authController';
import { getAllUsers } from '../controllers/usersController';

router.route('/signup').post(signup);
router.route('/login').post(login);

router.route('/').get(getAllUsers);

export default router;
