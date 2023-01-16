import { User } from '../models/user.model.js';

export class UsersService {
  async create(data) {
    return (await User.create(data)).toJSON();
  }

  async addPostToFavorites(userId, postId) {
    return User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          favoritePosts: postId,
        },
      },
      { new: true }
    ).lean();
  }

  async updateFavoriteTags(userId, tags) {
    return User.findByIdAndUpdate(
      userId,
      {
        favoriteTags: tags,
      },
      { new: true }
    ).lean();
  }
}
