import passport from 'passport';

export class AuthController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  getRegister(req, res) {
    res.render('register');
  }

  async register(req, res, next) {
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
