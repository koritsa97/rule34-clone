import { Router } from 'express';

import { AuthController } from '@/controllers/auth.controller';
import { UsersService } from '@/services/users.service';
import { auth } from '@/middlewares/auth.middleware';

const router = Router();
const usersService = new UsersService();
const authController = new AuthController(usersService);

router.get('/register', authController.getRegister.bind(authController));
router.post('/register', authController.register.bind(authController));
router.get('/login', authController.getLogin.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/logout', auth, authController.logout.bind(authController));

export default router;
