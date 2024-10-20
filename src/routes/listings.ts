import express from 'express';

import {
  getListing,
  updateListing,
  createListing,
  deleteListing,
  getAllListings,
} from '../controllers/listingsController';

import { protect, restrictTo } from '../controllers/authController';

const router = express.Router();

router
  .route('/')
  .get(getAllListings)
  .post(protect, restrictTo('admin'), createListing);

router
  .route('/:id')
  .get(getListing)
  .delete(protect, restrictTo('admin'), deleteListing)
  .patch(protect, restrictTo('admin'), updateListing);

export default router;
