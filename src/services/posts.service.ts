import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { CreatePostDto } from '@/types/posts.dto';
import { ImageWidth } from '@/utils/constants';

export class PostsService {
  async findAll() {
    const posts = await prisma.post.findMany({
      include: {
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts;
  }

  async findManyByTags(tagIds: number[]) {
    const posts = await prisma.post.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts;
  }

  async findOneById(id: number) {
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        tags: true,
        owner: true,
      },
    });
    return post;
  }

  async findManyByIds(ids: number[]) {
    const posts = await prisma.post.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts;
  }

  async findManyByOwner(ownerId: number) {
    const posts = await prisma.post.findMany({
      where: {
        owner: {
          id: ownerId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts;
  }

  async create(data: CreatePostDto) {
    const post = await prisma.post.create({
      data: {
        originalUrl: data.originalUrl,
        previewUrl: data.previewUrl,
        sourceUrl: data.sourceUrl,
        owner: {
          connect: {
            id: data.ownerId,
          },
        },
        tags: {
          connectOrCreate: data.tags.map(
            (tagName): Prisma.TagCreateOrConnectWithoutPostsInput => ({
              where: {
                name: tagName,
              },
              create: {
                name: tagName,
                owner: {
                  connect: {
                    id: data.ownerId,
                  },
                },
              },
            })
          ),
        },
        tagsString: data.tags.join(' '),
      },
    });
    return post;
  }

  async uploadImage(originalImagePath: string) {
    const uploadResponse = await cloudinary.uploader.upload(originalImagePath);
    await fs.rm(originalImagePath);

    const previewUrl = cloudinary.url(uploadResponse.public_id, {
      width: ImageWidth.PREVIEW,
    });

    return {
      originalUrl: uploadResponse.secure_url,
      previewUrl,
    };
  }
}
