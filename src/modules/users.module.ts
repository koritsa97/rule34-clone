import { Router } from 'express';

import { UsersController } from '@/controllers/users.controller';
import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';
import { auth } from '@/middlewares/auth.middleware';

const router = Router();
const tagsService = new TagsService();
const usersService = new UsersService();
const usersController = new UsersController(tagsService, usersService);

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
router.get('/account/:id', usersController.getAccount.bind(usersController));

export default router;
