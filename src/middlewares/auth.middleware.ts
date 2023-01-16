import { Request, Response, NextFunction } from 'express';

export function auth(req: Request, res: Response, next: NextFunction) {
  req.user ? next() : res.redirect('/login');
}
