import { Router } from 'express';

import { UsersController } from '../controllers/users.controller.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();
const usersController = new UsersController();

router.get('/account', auth, usersController.getAccount.bind(usersController));
router.get(
  '/account/settings',
  auth,
  usersController.getSettings.bind(usersController)
);
router.post(
  '/account/settings',
  auth,
  usersController.updateSettings.bind(usersController)
);

export default router;
