import express, { Request, Response } from 'express';
import morgan from 'morgan';

import listings from './routes/listings';

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use('/api/v1/listings', listings);

app.get('/', (_: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello There. General Kenobi! You are a bold one',
  });
});

export default app;
