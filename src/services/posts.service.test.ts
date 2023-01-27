import { PrismaClient, Prisma, Post } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import { Jimp as JimpType } from '@jimp/core';
import * as Jimp from 'jimp';

import { PostsService } from './posts.service';
import { prisma } from '@/config/prisma';

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
        upload: jest.fn((path) => ({ secure_url: path })),
      },
    },
  };
});

jest.mock('jimp', () => {
  return {
    _esModule: true,
    ...mockDeep<JimpType>(),
    read: jest.fn().mockReturnValue({
      scaleToFit: jest.fn().mockReturnThis(),
      quality: jest.fn().mockReturnThis(),
      writeAsync: jest.fn().mockReturnThis(),
    }),
  };
});

describe('Tags service', () => {
  let service: PostsService;

  beforeEach(() => {
    service = new PostsService();
  });

  test('should find all posts', async () => {
    await service.findAll();
    expect(prisma.post.findMany).toBeCalled();
  });

  test('should find posts by tags', async () => {
    const tagIds = [1, 2, 3];
    await service.findManyByTags(tagIds);
    expect(prisma.post.findMany).toBeCalledWith({
      where: {
        tags: {
          some: {
            id: {
              in: tagIds,
            },
          },
        },
      },
      include: {
        tags: true,
      },
    });
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
    const { originalUrl, previewUrl } = await service.uploadImages(
      'images/img1.png',
      'images/im1_preview.png'
    );

    expect(originalUrl).toBeDefined();
    expect(previewUrl).toBeDefined();
    expect(cloudinary.uploader.upload).toHaveBeenNthCalledWith(
      1,
      'images/img1.png'
    );
    expect(cloudinary.uploader.upload).toHaveBeenNthCalledWith(
      2,
      'images/im1_preview.png'
    );
    expect(fs.rm).toHaveBeenNthCalledWith(1, 'images/img1.png');
    expect(fs.rm).toHaveBeenNthCalledWith(2, 'images/im1_preview.png');
  });

  test('should create preview image', async () => {
    const res = await service.createPreviewImage('images/img1.png');
    expect(res).toBe('images/img1_preview.png');
  });
});
