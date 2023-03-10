import { Router } from 'express';

import { PostsController } from '@/controllers/posts.controller';
import { PostsService } from '@/services/posts.service';
import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';
import { auth } from '@/middlewares/auth.middleware';
import { upload } from '@/config/storage';

const router = Router();
const postsService = new PostsService();
const tagsService = new TagsService();
const usersService = new UsersService();
const postsController = new PostsController(
  postsService,
  tagsService,
  usersService
);

router.get('/posts', postsController.getPosts.bind(postsController));
router.get('/feed', auth, postsController.getFeed.bind(postsController));
router.get('/posts/:id', postsController.getPostById.bind(postsController));
router.patch(
  '/posts/:id/favorite',
  auth,
  postsController.addPostToFavorites.bind(postsController)
);
router.get('/upload', auth, postsController.getUpload.bind(postsController));
router.post(
  '/upload',
  auth,
  upload.single('image'),
  postsController.uploadPost.bind(postsController)
);
router.get(
  '/posts/:id/delete',
  auth,
  postsController.delete.bind(postsController)
);
router.get(
  '/posts/:id/edit',
  auth,
  postsController.getEditPost.bind(postsController)
);
router.post(
  '/posts/:id/edit',
  auth,
  postsController.editPost.bind(postsController)
);

export default router;
