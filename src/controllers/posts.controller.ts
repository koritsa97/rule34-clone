import { NextFunction, Request, Response } from 'express';
import { Post, Tag, User } from '@prisma/client';

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
      const { query, page } = req.query as { query: string; page: string };
      const user = req.user as User | undefined;

      const message = req.flash('message');

      if (!query) {
        const { posts, ...pagination } = await this.postsService.findAll(
          +page || 1
        );
        const tags = this.tagsService.getUniqueTags(
          posts.flatMap((post) => post.tags)
        );

        res.render('posts', {
          posts,
          pagination,
          tags,
          user,
          message:
            message && message.length > 0
              ? {
                  type: message[0],
                  text: message[1],
                }
              : null,
        });

        return;
      }

      const tagsNames = query.toLowerCase().split(' ');

      const queriedTags = await this.tagsService.findManyByNames(tagsNames);
      const { posts, ...pagination } = await this.postsService.findManyByTags(
        queriedTags.map(({ id }) => id),
        +page || 1
      );
      const tags = this.tagsService.getUniqueTags(
        posts.flatMap((post) => post.tags)
      );

      res.render('posts', {
        posts,
        pagination,
        tags,
        user,
        message:
          message && message.length > 0
            ? {
                type: message[0],
                text: message[1],
              }
            : null,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User & { favoriteTags: Tag[] };
      const { page } = req.query as { page: string };
      const { posts, ...pagination } = await this.postsService.findManyByTags(
        user.favoriteTags.map((tag) => tag.id),
        +page || 1
      );
      const tags = this.tagsService.getUniqueTags(
        posts.flatMap((post) => post.tags)
      );

      res.render('feed', {
        posts,
        pagination,
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
      const user = req.user as (User & { favoritePosts: Post[] }) | undefined;

      const post = await this.postsService.findOneById(+id);
      if (!post) {
        req.flash('message', ['danger', `Post with id ${id} not found`]);
        res.redirect('/posts');
        return;
      }

      const message = req.flash('message');

      res.render('post', {
        post,
        user,
        message:
          message && message.length > 0
            ? {
                type: message[0],
                text: message[1],
              }
            : null,
        isFavorited: !!user?.favoritePosts.find((post) => post.id === +id),
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

      const tagNames: string[] = (req.body.tags as string)
        .toLowerCase()
        .trim()
        .replace(',', '')
        .split(' ')
        .map((tagName) => tagName.trim());

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

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const postId = +req.params.id;

      const existingPost = await this.postsService.findOneById(postId);
      if (!existingPost) {
        req.flash('message', ['danger', `Post with id ${postId} not found`]);
        res.redirect('/posts');
        return;
      }

      if (existingPost.owner.id !== user.id) {
        req.flash('message', [
          'danger',
          "You don't have rights to delete this post",
        ]);
        res.redirect(`/posts/${postId}`);
        return;
      }

      await this.postsService.delete(postId);
      req.flash('message', [
        'info',
        `Post with id ${postId} successfully deleted`,
      ]);
      res.redirect('/posts');
    } catch (error) {
      next(error);
    }
  }

  async getEditPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const postId = +req.params.id;

      const existingPost = await this.postsService.findOneById(postId);
      if (!existingPost) {
        req.flash('message', ['danger', `Post with id ${postId} not found`]);
        res.redirect('/posts');
        return;
      }

      if (existingPost.owner.id !== user.id) {
        req.flash('message', [
          'danger',
          "You don't have rights to edit this post",
        ]);
        res.redirect(`/posts/${postId}`);
        return;
      }

      res.render('post-edit', {
        post: existingPost,
      });
    } catch (error) {
      next(error);
    }
  }

  async editPost(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User;
      const postId = +req.params.id;

      const existingPost = await this.postsService.findOneById(postId);
      if (!existingPost) {
        req.flash('message', ['danger', `Post with id ${postId} not found`]);
        res.redirect('/posts');
        return;
      }

      if (existingPost.owner.id !== user.id) {
        req.flash('message', [
          'danger',
          "You don't have rights to edit this post",
        ]);
        res.redirect(`/posts/${postId}`);
        return;
      }

      await this.postsService.update(postId, existingPost, {
        tags: (req.body.tags as string).split(' '),
        originalUrl: req.body.originalUrl,
        previewUrl: req.body.previewUrl,
        sourceUrl: req.body.sourceUrl,
      });
      req.flash('message', ['info', 'Post successfully updated']);
      res.redirect(`/posts/${postId}`);
    } catch (error) {
      next(error);
    }
  }
}
