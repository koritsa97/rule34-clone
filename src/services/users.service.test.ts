import { mockDeep } from 'jest-mock-extended';
import { PrismaClient, Prisma } from '@prisma/client';

import { prisma } from '../config/prisma';
import { UsersService } from './users.service';

jest.mock('../config/prisma.ts', () => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('Users service', () => {
  let service: UsersService;
  const userData = {
    username: 'user1',
    password: '12345',
  };

  beforeEach(() => {
    service = new UsersService();
  });

  test('should create new user', async () => {
    prisma.user.create = jest.fn((args: { data: any }) => args.data);

    const user = await service.create(userData);

    expect(user).toBeDefined();
    expect(user).toMatchObject(userData);
    expect(prisma.user.create).toBeCalled();
  });

  test('should add post to favorites', async () => {
    const userId = 1;
    const postId = 1;
    await service.addPostToFavorites(userId, postId);
    expect(prisma.user.update).toBeCalledWith({
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
  });

  test('should update favorite tags', async () => {
    const userId = 1;
    const tagsIds = [1, 2, 3];
    await service.update(userId, tagsIds, {
      username: '',
      password: '',
    });
    expect(prisma.user.update).toBeCalledWith({
      where: {
        id: userId,
      },
      data: {
        favoriteTags: {
          set: tagsIds.map((id) => ({ id })),
        },
        username: '',
        password: '',
      },
    });
  });

  test('should find one user by id', async () => {
    prisma.user.findUnique = jest.fn(
      (args: Prisma.UserFindUniqueArgs): any => ({
        ...userData,
        id: args.where.id,
      })
    );

    const user = await service.findOneById(1);
    expect(user).toBeDefined();
    expect(user).toMatchObject({
      ...userData,
      id: 1,
    });
    expect(prisma.user.findUnique).toBeCalled();
  });
});
