import { Router } from 'express';
import passport from 'passport';

import { AuthController } from '../controllers/auth.controller.js';
import { UsersService } from '../services/users.service.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();
const usersService = new UsersService();
const authController = new AuthController(usersService);

router.get('/register', authController.getRegister.bind(authController));
router.post('/register', authController.register.bind(authController));
router.get('/login', authController.getLogin.bind(authController));
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
  }),
  authController.login.bind(authController)
);
router.get('/logout', auth, authController.logout.bind(authController));

export default router;
