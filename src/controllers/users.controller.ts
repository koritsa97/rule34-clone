import { NextFunction, Request, Response } from 'express';

import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';
import { Post, Tag, User } from '@prisma/client';
import { UpdateUserDto } from '@/types/users.dto';

export class UsersController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService
  ) {}

  async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = req.user as
        | (User & {
            favoritePosts: Post[];
            favoriteTags: Tag[];
            uploads: Post[];
          })
        | undefined;

      const user = await this.usersService.findOneById(+req.params.id);

      if (!user) {
        res.redirect('/');
        return;
      }

      const isAuthorized = authUser && authUser.id === user.id;
      console.log(isAuthorized);

      res.render('account', {
        user,
        isAuthorized,
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
      let { favoriteTags, ...data } = req.body as UpdateUserDto;
      favoriteTags = favoriteTags.toLowerCase().trim();

      const user = req.user as User;

      const tags = await this.tagsService.findManyByNames(
        favoriteTags.split(' ')
      );

      await this.usersService.update(
        user.id,
        tags.map(({ id }) => id),
        data
      );

      res.redirect(`/account/${user.id}`);
    } catch (error) {
      next(error);
    }
  }
}
