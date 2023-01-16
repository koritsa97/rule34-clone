import { NextFunction, Request, Response } from 'express';

import { PostsService } from '@/services/posts.service';
import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';
import { UserEntity } from '@/models/user.model';

export class UsersController {
  constructor(
    private readonly postsService: PostsService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService
  ) {}

  async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserEntity;

      const favoritePosts = await this.postsService.findManyByIds(
        user.favoritePosts.map((id) => id.toString())
      );
      const favoriteTags = await this.tagsService.findManyByIds(
        user.favoriteTags.map((id) => id.toString())
      );
      const uploads = await this.postsService.findManyByOwner(user._id);

      res.render('account', {
        css: ['account.css'],
        user: {
          ...user.toJSON(),
          favoritePosts: favoritePosts.map((post) => post.toJSON()),
          favoriteTags: favoriteTags.map((tag) => tag.toJSON()),
          uploads: uploads.map((post) => post.toJSON()),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserEntity;
      const favoriteTags = await this.tagsService.findManyByIds(
        user.favoriteTags.map((id) => id.toString())
      );

      const tagsString = favoriteTags.map(({ name }) => name).join(' ');
      res.render('account-settings', {
        user: user.toJSON(),
        tagsString,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      let { favoriteTags } = req.body as { favoriteTags: string };
      favoriteTags = favoriteTags.toLowerCase().trim();

      const user = req.user as UserEntity;

      if (favoriteTags === '') {
        res.redirect('/account/settings');
        return;
      }

      const tags = await this.tagsService.findManyByNames(
        favoriteTags.split(' ')
      );

      await this.usersService.updateFavoriteTags(
        user._id,
        tags.map(({ _id }) => _id)
      );

      res.redirect('/account/settings');
    } catch (error) {
      next(error);
    }
  }
}
