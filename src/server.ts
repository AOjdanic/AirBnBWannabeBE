/* eslint-disable no-console */
import app from './app';
import mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
  console.log('uncaught exception');
  console.log(err);
  process.exit(1);
});

const uri =
  process.env.DATABASE_URI?.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD as string,
  ) || '';

mongoose.connect(uri).then(() => console.log('Database connection sucessful'));

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Starting server on port ${process.env.PORT}. Listening on http://localhost:${process.env.PORT}`,
  );
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection error');
  console.log(err);
  server.close(() => process.exit(1));
});
