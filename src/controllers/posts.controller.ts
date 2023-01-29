import { NextFunction, Request, Response } from 'express';
import { Tag, User } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

import { PostsService } from '@/services/posts.service';
import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';

export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService
  ) {}

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query as { query: string };
      const user = req.user as User | undefined;

      if (!query) {
        const posts = await this.postsService.findAll();
        const tags = this.tagsService.getUniqueTags(
          posts.flatMap((post) => post.tags)
        );

        res.render('posts', {
          posts,
          tags,
          user,
        });

        return;
      }

      const tagsNames = query.toLowerCase().split(' ');

      const queriedTags = await this.tagsService.findManyByNames(tagsNames);
      const posts = await this.postsService.findManyByTags(
        queriedTags.map(({ id }) => id)
      );
      const tags = this.tagsService.getUniqueTags(
        posts.flatMap((post) => post.tags)
      );

      res.render('posts', {
        posts,
        tags,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User & { favoriteTags: Tag[] };
      const posts = await this.postsService.findManyByTags(
        user.favoriteTags.map((tag) => tag.id)
      );
      const tags = this.tagsService.getUniqueTags(
        posts.flatMap((post) => post.tags)
      );

      res.render('feed', {
        posts,
        tags,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const user = req.user as User | undefined;

      const post = await this.postsService.findOneById(+id);
      if (!post) {
        res.redirect('/posts');
        return;
      }

      res.render('post', {
        post,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  async addPostToFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const user = req.user as User;

      await this.usersService.addPostToFavorites(user.id, +id);

      res.send('Success');
    } catch (error) {
      next(error);
    }
  }

  getUpload(req: Request, res: Response) {
    const user = req.user as User;
    res.render('upload', {
      user,
    });
  }

  async uploadPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      if (!req.file) {
        res.status(422).end();
        return;
      }

      const tagNames = (req.body.tags as string)
        .toLowerCase()
        .trim()
        .split(' ');

      const { originalUrl, previewUrl } = await this.postsService.uploadImage(
        req.file.path
      );

      await this.postsService.create({
        originalUrl,
        previewUrl,
        tags: tagNames,
        sourceUrl: req.body.source as string,
        ownerId: user.id,
      });

      res.redirect('/posts');
    } catch (error) {
      next(error);
    }
  }
}
