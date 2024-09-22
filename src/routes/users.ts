import express from 'express';

const router = express.Router();

import { signup } from '../controllers/authController';
import { getAllUsers } from '../controllers/usersController';

router.route('/signup').post(signup);

router.route('/').get(getAllUsers);

export default router;
