import express from 'express';

import {
  createListing,
  deleteListing,
  getAllListings,
  getListing,
  updateListing,
} from '../controllers/listingsController';

const router = express.Router();

router.route('/').get(getAllListings).post(createListing);

router.route('/:id').get(getListing).delete(deleteListing).patch(updateListing);

export default router;
