import Post from '../models/Post.js';
import Tag from '../models/Tag.js';
import User from '../models/User.js';

export class UsersController {
  async getAccount(req, res, next) {
    try {
      const favoritePosts = await Post.find({
        _id: {
          $in: req.user.favoritePosts,
        },
      }).lean();
      const favoriteTags = await Tag.find({
        _id: {
          $in: req.user.favoriteTags,
        },
      }).lean();
      const uploads = await Post.find({
        owner: req.user._id,
      }).lean();

      res.render('account', {
        user: {
          ...req.user,
          favoritePosts,
          favoriteTags,
          uploads,
        },
        css: ['account.css'],
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const favoriteTags = await Tag.find({
        _id: {
          $in: req.user.favoriteTags,
        },
      });

      const tagsString = favoriteTags.map(({ name }) => name).join(' ');
      res.render('account-settings', {
        user: req.user,
        tagsString,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const { favoriteTags } = req.body;
      if (favoriteTags === '') {
        res.redirect('/account/settings');
        return;
      }

      const tags = await Tag.find({
        name: {
          $in: favoriteTags.split(' '),
        },
      });

      const user = await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          favoriteTags: tags,
        },
      });

      res.redirect('/account/settings');
    } catch (error) {
      next(error);
    }
  }
}
