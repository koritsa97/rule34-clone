import fs from 'fs/promises';
import Jimp from 'jimp';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { Post, Prisma, Tag } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { CreatePostDto } from '@/types/posts.dto';

export class PostsService {
  async findAll() {
    const posts = await prisma.post.findMany({
      include: {
        tags: true,
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

  async uploadImages(originalImagePath: string, previewImagePath: string) {
    const originalRes = await cloudinary.uploader.upload(originalImagePath);
    await fs.rm(originalImagePath);
    const previewRes = await cloudinary.uploader.upload(previewImagePath);
    await fs.rm(previewImagePath);

    return {
      originalUrl: originalRes.secure_url,
      previewUrl: previewRes.secure_url,
    };
  }

  async createPreviewImage(originalImagePath: string) {
    const ext = path.extname(originalImagePath);
    const previewImagePath = originalImagePath.replace(ext, '_preview' + ext);

    const image = await Jimp.read(originalImagePath);
    await image.scaleToFit(420, 640).quality(50).writeAsync(previewImagePath);
    return previewImagePath;
  }
}
