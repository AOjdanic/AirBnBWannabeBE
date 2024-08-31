import { Request, Response } from 'express';

export const getAllListings = (_: Request, res: Response) => {
  res.status(200).json({
    message: 'These are all listings',
  });
};

export const getListing = (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({
    message: `This is only one listing with id ${id}`,
    id,
  });
};
