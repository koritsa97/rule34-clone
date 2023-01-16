import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  console.log(err);
  res.status(status).send(err.message);
}
