import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';

import { UsersService } from '@/services/users.service';
import { CreateUserDto } from '@/types/users.dto';

export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  getRegister(req: Request, res: Response) {
    const message = req.flash('message');
    res.render('register', {
      message:
        message && message.length > 0
          ? {
              type: message[0],
              text: message[1],
            }
          : null,
    });
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateUserDto;

      const existingUser = await this.usersService.findOneByUsername(
        data.username
      );
      if (existingUser) {
        req.flash('message', ['danger', 'Username is already taken']);
        res.redirect('/register');
        return;
      }

      const hashedPassword = await bcrypt.hash(data.password, 12);
      await this.usersService.create({
        username: data.password,
        password: hashedPassword,
      });

      this.login(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  getLogin(req: Request, res: Response) {
    const message = req.flash('message');
    res.render('login', {
      message:
        message && message.length > 0
          ? {
              type: message[0],
              text: message[1],
            }
          : null,
    });
  }

  login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (error, user) => {
      if (error || !user) {
        req.flash('message', ['danger', error]);
        res.redirect('/login');
      } else {
        req.logIn(user, (loginError) => {
          if (loginError) {
            req.flash('message', ['danger', loginError]);
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
