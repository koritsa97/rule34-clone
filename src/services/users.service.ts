import { prisma } from '@/config/prisma';
import { CreateUserDto, UpdateUserDto } from '@/types/users.dto';

export class UsersService {
  async create(data: CreateUserDto) {
    return prisma.user.create({
      data,
    });
  }

  async addPostToFavorites(userId: number, postId: number) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        favoritePosts: {
          connect: {
            id: postId,
          },
        },
      },
    });
  }

  async update(userId: number, tagsIds: number[], data: UpdateUserDto) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        favoriteTags: {
          set: tagsIds.map((id) => ({ id })),
        },
        username: data.username,
        password: data.password,
      },
    });
  }

  async findOneById(userId: number) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        favoritePosts: true,
        favoriteTags: true,
        uploads: true,
      },
    });
  }

  async findOneByUsername(username: string) {
    return prisma.user.findUnique({
      where: {
        username,
      },
    });
  }
}
