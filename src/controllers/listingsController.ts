import { NextFunction, Request, Response } from 'express';

import Listing from '../models/Listings';

import { catchAsyncErrors } from '../utils/catchAsyncErrors';
import { AppError } from '../utils/AppError';

export const getAllListings = catchAsyncErrors(
  async (_: Request, res: Response) => {
    const listings = await Listing.find().limit(30);
    res.status(200).json({
      message: 'success',
      data: {
        listings,
      },
    });
  },
);

export const createListing = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const listing = await Listing.create(req.body);

    return res.status(201).json({
      message: 'success',
      data: {
        listing,
      },
    });
  },
);

export const getListing = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return next(new AppError('No Listing found with given id', 404));
    }

    res.status(200).json({
      message: 'success',
      data: {
        listing,
      },
    });
  },
);

export const updateListing = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const updatedListing = await Listing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedListing) {
      return next(new AppError('No Listing found with given id', 404));
    }

    res.status(200).json({
      message: 'success',
      data: {
        listing: updatedListing,
      },
    });
  },
);

export const deleteListing = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      return next(new AppError('No Listing found with given id', 404));
    }
    res.status(204).json({
      message: 'success',
    });
  },
);
