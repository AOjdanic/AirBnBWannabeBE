import { Request, Response } from 'express';
import Listing from '../models/Listings';

export const getAllListings = async (_: Request, res: Response) => {
  const listings = await Listing.find().limit(30);
  res.status(200).json({
    message: 'These are all listings',
    data: {
      listings,
    },
  });
};

export const getListing = async (req: Request, res: Response) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  res.status(200).json({
    message: `This is only one listing with id ${id}`,
    data: {
      listing,
    },
  });
};
