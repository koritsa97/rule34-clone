import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { UsersService } from '@/services/users.service';
import { CreateUserDto } from '@/types/users.dto';

export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  getRegister(req: Request, res: Response) {
    const error = req.flash('error');
    res.render('register', {
      error,
    });
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateUserDto;

      const existingUser = await this.usersService.findOneByUsername(
        data.username
      );
      if (existingUser) {
        req.flash('error', 'Username is already taken');
        res.redirect('/register');
        return;
      }

      await this.usersService.create(data);

      this.login(req, res, next);
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
        req.logIn(user, (loginError) => {
          if (loginError) {
            console.log(loginError);
            req.flash('error', loginError);
            res.redirect('/login');
          } else {
            res.redirect('/posts');
          }
        });
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
