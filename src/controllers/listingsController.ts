import { NextFunction, Request, Response } from 'express';

import Listing from '../models/Listings';

import { catchAsyncErrors } from '../services/catchAsyncErrors';
import { AppError } from '../services/AppError';
import { ApiFilteringService } from '../services/ApiFilteringService';

export const getAllListings = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const finalListingQuery = new ApiFilteringService(Listing.find(), req.query)
      .filter()
      .sort()
      .paginate()
      .select();

    const listings = await finalListingQuery.mongooseQuery;
    res.status(200).json({
      message: 'success',
      results: listings.length,
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
