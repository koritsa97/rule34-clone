import { User, UserEntity } from '@/models/user.model';

export class UsersService {
  async create(data: UserEntity): Promise<UserEntity> {
    return User.create(data);
  }

  async addPostToFavorites(
    userId: string,
    postId: string
  ): Promise<UserEntity | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          favoritePosts: postId,
        },
      },
      { new: true }
    );
  }

  async updateFavoriteTags(
    userId: string,
    tags: string[]
  ): Promise<UserEntity | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        favoriteTags: tags,
      },
      { new: true }
    );
  }
}
