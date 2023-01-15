import Jimp from 'jimp';

import { Post } from '../models/post.model.js';
import { Tag } from '../models/tag.model.js';
import { User } from '../models/user.model.js';
import { TagType } from '../utils/constants.js';

export class PostsController {
  async getPosts(req, res, next) {
    try {
      const { query } = req.query;
      if (!query) {
        const posts = await Post.find().lean();
        const tags = await Tag.find().lean();

        res.render('posts', {
          css: ['posts.css'],
          posts,
          tags,
          user: req.user,
        });

        return;
      }

      const tagsNames = query.split(' ');

      const queriedTags = await Tag.find({
        name: {
          $in: tagsNames,
        },
      });
      const posts = await Post.find({
        tags: {
          $in: queriedTags,
        },
      }).lean();
      const tags = await Tag.find({
        _id: {
          $in: Array.from(
            posts.reduce((prev, post) => {
              for (const tagId of post.tags) {
                prev.add(tagId);
              }
              return prev;
            }, new Set())
          ),
        },
      }).lean();

      res.render('posts', {
        css: ['posts.css'],
        posts,
        tags,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req, res, next) {
    try {
      const posts = await Post.find({
        tags: {
          $in: req.user.favoriteTags,
        },
      }).lean();

      const tags = await Tag.find({
        _id: {
          $in: Array.from(
            posts.reduce((prev, post) => {
              for (const tagId of post.tags) {
                prev.add(tagId);
              }
              return prev;
            }, new Set())
          ),
        },
      }).lean();

      res.render('feed', {
        posts,
        tags,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      const tags = await Tag.find({
        _id: {
          $in: post.tags,
        },
      }).lean();

      res.render('post', {
        ...post.toJSON(),
        tags: tags,
        user: req.user,
        css: ['post.css'],
      });
    } catch (error) {
      next(error);
    }
  }

  async addPostToFavorites(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          favoritePosts: id,
        },
      });

      res.send('Success');
    } catch (error) {
      next(error);
    }
  }

  getUpload(req, res, next) {
    res.render('upload', {
      user: req.user,
    });
  }

  async uploadPost(req, res, next) {
    try {
      const ext = path.extname(req.file.path);
      const previewImagePath = req.file.path.replace(ext, '_preview') + ext;
      await (await Jimp.read(req.file.path))
        .scaleToFit(420, 640)
        .quality(70)
        .writeAsync(previewImagePath);

      const userTags = req.body.tags.split(' ');
      const tags = [];
      for (const userTag of userTags) {
        let tag = await Tag.findOne({
          name: userTag,
        });
        if (!tag) {
          tag = await Tag.create({
            name: userTag,
            type: TagType.CATEGORY,
            owner: req.user._id,
          });
        }

        tags.push(tag);
      }

      const previewRes = await cloudinary.uploader.upload(previewImagePath);
      fs.rmSync(previewImagePath);
      const originalRes = await cloudinary.uploader.upload(req.file.path);
      fs.rmSync(req.file.path);

      const post = await Post.create({
        previewImageUrl: previewRes.secure_url,
        originalImageUrl: originalRes.secure_url,
        tags,
        source: req.body.source,
        owner: req.user._id,
      });

      res.redirect('/posts');
    } catch (error) {
      next(error);
    }
  }
}
