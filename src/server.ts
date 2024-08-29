import app from './app';

app.listen(process.env.PORT, () => {
  console.log(
    `Starting server on port ${process.env.PORT}. Listening on http://localhost:${process.env.PORT}`,
  );
});
