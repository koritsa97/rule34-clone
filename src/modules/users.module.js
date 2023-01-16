import { Router } from 'express';

import { UsersController } from '../controllers/users.controller.js';
import { PostsService } from '../services/posts.service.js';
import { TagsService } from '../services/tags.service.js';
import { UsersService } from '../services/users.service.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();
const postsService = new PostsService();
const tagsService = new TagsService();
const usersService = new UsersService();
const usersController = new UsersController(
  postsService,
  tagsService,
  usersService
);

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
