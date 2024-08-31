import app from './app';
import mongoose from 'mongoose';

const uri =
  process.env.DATABASE_URI?.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD as string,
  ) || '';

mongoose.connect(uri).then(() => console.log('Database connection sucessful'));

app.listen(process.env.PORT, () => {
  console.log(
    `Starting server on port ${process.env.PORT}. Listening on http://localhost:${process.env.PORT}`,
  );
});
