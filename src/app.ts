import express, { Request, Response } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import expressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import globalErrorHandler from './controllers/errorController';

import users from './routes/users';
import listings from './routes/listings';

import { AppError } from './services/AppError';

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  message: 'Too many request from this IP address. Please try again later',
});

app.use(limiter);

app.use(express.json({ limit: '10kb' }));

app.use(expressMongoSanitize());

app.use(xss());

app.use(morgan('dev'));

app.use('/api/v1/users', users);
app.use('/api/v1/listings', listings);

app.get('/', (_: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello There. General Kenobi! You are a bold one',
  });
});

app.all('*', (req, _, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
