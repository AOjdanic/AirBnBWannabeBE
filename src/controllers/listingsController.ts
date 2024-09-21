import { Request, Response } from 'express';
import Listing from '../models/Listings';

export const getAllListings = async (_: Request, res: Response) => {
  const listings = await Listing.find().limit(30);
  res.status(200).json({
    message: 'success',
    data: {
      listings,
    },
  });
};

export const createListing = async (req: Request, res: Response) => {
  const listing = await Listing.create(req.body);

  return res.status(201).json({
    message: 'success',
    data: {
      listing,
    },
  });
};

export const getListing = async (req: Request, res: Response) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  res.status(200).json({
    message: 'success',
    data: {
      listing,
    },
  });
};

export const updateListing = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: 'success',
    data: {
      listing: updatedListing,
    },
  });
};

export const deleteListing = async (req: Request, res: Response) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  res.status(204).json({
    message: 'success',
  });
};
