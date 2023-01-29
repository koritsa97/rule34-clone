import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { UsersService } from '@/services/users.service';

export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  getRegister(_req: Request, res: Response) {
    res.render('register');
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      await this.usersService.create(req.body);

      passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/posts',
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  getLogin(req: Request, res: Response) {
    const error = req.flash('error');
    res.render('login', {
      error,
    });
  }

  login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (error, user) => {
      if (error || !user) {
        req.flash('error', error);
        res.redirect('/login');
      } else {
        res.redirect('/posts');
      }
    })(req, res, next);
  }

  logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        console.log(err);
      }

      res.redirect('/');
    });
  }
}
