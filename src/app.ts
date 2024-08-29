import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.get('/', (_: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello There. General Kenobi! You are a bold one',
  });
});

export default app;
