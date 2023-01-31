import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

import { PostsService } from './posts.service';
import { prisma } from '../config/prisma';

jest.mock('../config/prisma.ts', () => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

jest.mock('fs/promises', () => {
  return {
    _esModule: true,
    rm: jest.fn(),
  };
});

jest.mock('cloudinary', () => {
  return {
    v2: {
      uploader: {
        upload: jest.fn((path) => ({ secure_url: path, public_id: path })),
      },
      url: jest.fn((path) => path),
    },
  };
});

describe('Tags service', () => {
  let service: PostsService;

  beforeEach(() => {
    service = new PostsService();
  });

  test('should find all posts', async () => {
    await service.findAll(1);
    expect(prisma.post.findMany).toBeCalled();
  });

  test('should find posts by tags', async () => {
    const tagIds = [1, 2, 3];
    await service.findManyByTags(tagIds, 1);
    expect(prisma.post.findMany).toBeCalled();
  });

  test('should find post by id', async () => {
    await service.findOneById(1);
    expect(prisma.post.findUnique).toBeCalledWith({
      where: {
        id: 1,
      },
      include: {
        tags: true,
        owner: true,
      },
    });
  });

  test('should find posts by ids', async () => {
    const ids = [1, 2, 3];
    await service.findManyByIds(ids);
    expect(prisma.post.findMany).toBeCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        id: {
          in: ids,
        },
      },
    });
  });

  test('should find posts by owner', async () => {
    await service.findManyByOwner(1);
    expect(prisma.post.findMany).toBeCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        owner: {
          id: 1,
        },
      },
    });
  });

  test('should create new post', async () => {
    await service.create({
      originalUrl: '',
      ownerId: 1,
      previewUrl: '',
      tags: ['tag1'],
      sourceUrl: '',
    });
    expect(prisma.post.create).toBeCalled();
  });

  test('should upload images to cloudinary', async () => {
    const imagePath = 'images/img1.png';
    const { originalUrl, previewUrl } = await service.uploadImage(imagePath);

    expect(originalUrl).toBeDefined();
    expect(previewUrl).toBeDefined();
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(imagePath);
    expect(fs.rm).toHaveBeenCalledWith(imagePath);
  });
});
