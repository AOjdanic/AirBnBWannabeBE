import express from 'express';

import { getAllListings, getListing } from '../controllers/listingsController';

const router = express.Router();

router.route('/').get(getAllListings);

router.route('/:id').get(getListing);

export default router;
