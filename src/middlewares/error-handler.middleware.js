export function errorHandler(err, req, res, next) {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  console.log(err);
  res.status(status).send(err.message);
}
