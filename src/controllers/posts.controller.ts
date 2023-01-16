import { NextFunction, Request, Response } from 'express';

import { PostsService } from '@/services/posts.service';
import { TagsService } from '@/services/tags.service';
import { UsersService } from '@/services/users.service';
import { UserEntity } from '@/models/user.model';

export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService
  ) {}

  async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query as { query: string };
      const user = req.user as UserEntity | undefined;

      if (!query) {
        const posts = await this.postsService.findAll();
        const tags = await this.tagsService.findInPosts(posts);

        res.render('posts', {
          css: ['posts.css'],
          posts: posts.map((post) => post.toJSON()),
          tags: tags.map((tag) => tag.toJSON()),
          user: user?.toJSON(),
        });

        return;
      }

      const tagsNames = query.toLowerCase().split(' ');

      const queriedTags = await this.tagsService.findManyByNames(tagsNames);
      const posts = await this.postsService.findByTags(
        queriedTags.map(({ _id }) => _id)
      );
      const tags = await this.tagsService.findInPosts(posts);

      res.render('posts', {
        css: ['posts.css'],
        posts: posts.map((post) => post.toJSON()),
        tags: tags.map((tag) => tag.toJSON()),
        user: user?.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserEntity;
      const posts = await this.postsService.findByTags(
        user.favoriteTags.map((tag) => tag.toString())
      );
      const tags = await this.tagsService.findInPosts(posts);

      res.render('feed', {
        posts: posts.map((post) => post.toJSON()),
        tags: tags.map((tag) => tag.toJSON()),
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const user = req.user as UserEntity | undefined;

      const post = await this.postsService.findById(id);
      if (!post) {
        res.redirect('/posts');
        return;
      }
      const tags = await this.tagsService.findInPost(post);

      res.render('post', {
        css: ['post.css'],
        post: post.toJSON(),
        tags: tags.map((tag) => tag.toJSON()),
        user: user?.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  }

  async addPostToFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const user = req.user as UserEntity;

      await this.usersService.addPostToFavorites(user._id, id);

      res.send('Success');
    } catch (error) {
      next(error);
    }
  }

  getUpload(req: Request, res: Response) {
    const user = req.user as UserEntity;
    res.render('upload', {
      user: user.toJSON(),
    });
  }

  async uploadPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as UserEntity;
      if (!req.file) {
        res.status(422).end();
        return;
      }

      const tagNames = req.body.tags.toLowerCase().trim().split(' ');
      const tags = await this.tagsService.findOrCreateManyByNames(
        tagNames,
        user._id
      );

      const previewImagePath = await this.postsService.createPreviewImage(
        req.file.path
      );
      const { originalUrl, previewUrl } = await this.postsService.uploadImages(
        req.file.path,
        previewImagePath
      );

      await this.postsService.create({
        originalImageUrl: originalUrl,
        previewImageUrl: previewUrl,
        tags: tags.map((tag) => tag._id),
        source: req.body.source as string,
        owner: user._id,
      });

      res.redirect('/posts');
    } catch (error) {
      next(error);
    }
  }
}
