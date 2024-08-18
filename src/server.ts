import app from "./app";

const port: number = 8000;

app.listen(port, () => {
  console.log(
    `Starting server on port ${port}. Listening on http://localhost:3000`,
  );
});
