import passport from 'passport';
import User from '../models/User.js';

export class AuthController {
  getRegister(req, res) {
    res.render('register');
  }

  async register(req, res, next) {
    try {
      const user = await User.create({
        ...req.body,
      });

      passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/posts',
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  getLogin(req, res) {
    res.render('login');
  }

  login(req, res) {
    res.redirect('/posts');
  }

  logout(req, res) {
    req.logout((err) => {
      if (err) {
        console.log(err);
      }

      res.redirect('/');
    });
  }
}
