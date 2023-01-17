import { NextFunction, Request, Response } from 'express';

import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';
import { Post, Tag, User } from '@prisma/client';

export class UsersController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService
  ) {}

  async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User & {
        favoritePosts: Post[];
        favoriteTags: Tag[];
        uploads: Post[];
      };

      res.render('account', {
        css: ['account.css'],
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User & { favoriteTags: Tag[] };
      const favoriteTags = await this.tagsService.findManyByIds(
        user.favoriteTags.map(({ id }) => id)
      );

      const tagsString = favoriteTags.map(({ name }) => name).join(' ');
      res.render('account-settings', {
        user,
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

      const user = req.user as User;

      if (favoriteTags === '') {
        res.redirect('/account/settings');
        return;
      }

      const tags = await this.tagsService.findManyByNames(
        favoriteTags.split(' ')
      );

      await this.usersService.updateFavoriteTags(
        user.id,
        tags.map(({ id }) => id)
      );

      res.redirect('/account/settings');
    } catch (error) {
      next(error);
    }
  }
}
