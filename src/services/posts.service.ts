import fs from 'fs/promises';
import Jimp from 'jimp';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

import { Post, PostEntity } from '@/models/post.model';
import { CreatePostDto } from '@/types/posts.dto';

export class PostsService {
  async findAll(): Promise<PostEntity[]> {
    const posts = await Post.find().populate('tags');
    return posts;
  }

  async findByTags(tags: string[]): Promise<PostEntity[]> {
    const posts = await Post.find({
      tags: {
        $in: tags,
      },
    }).populate('tags');
    return posts;
  }

  async findById(id: string): Promise<PostEntity | null> {
    const post = await Post.findById(id).populate('tags');
    return post;
  }

  async findManyByIds(ids: string[]): Promise<PostEntity[]> {
    const posts = await Post.find({
      _id: {
        $in: ids,
      },
    }).populate('tags');
    return posts;
  }

  async findManyByOwner(ownerId: string): Promise<PostEntity[]> {
    const posts = await Post.find({
      owner: ownerId,
    }).populate('tags');
    return posts;
  }

  async create(data: CreatePostDto): Promise<PostEntity> {
    const post = await Post.create(data);
    await post.populate('tags');
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

  async createPreviewImage(originalImagePath: string): Promise<string> {
    const ext = path.extname(originalImagePath);
    const previewImagePath = originalImagePath.replace(ext, '_preview' + ext);

    const image = await Jimp.read(originalImagePath);
    await image.scaleToFit(420, 640).quality(50).writeAsync(previewImagePath);
    return previewImagePath;
  }
}
