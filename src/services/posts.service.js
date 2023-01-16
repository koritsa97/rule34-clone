import fs from 'fs/promises';
import Jimp from 'jimp';

import { Post } from '../models/post.model.js';

export class PostsService {
  async findAll() {
    return Post.find().lean();
  }

  async findByTags(tags) {
    return Post.find({
      tags: {
        $in: tags,
      },
    }).lean();
  }

  async findById(id) {
    return Post.findById(id).lean();
  }

  async findManyByIds(ids) {
    return Post.find({
      _id: {
        $in: ids,
      },
    }).lean();
  }

  async findManyByOwner(ownerId) {
    return Post.find({
      owner: ownerId,
    }).lean();
  }

  async create(data) {
    return (await Post.create(data)).toJSON();
  }

  async uploadImages(originalImagePath, previewImagePath) {
    const originalRes = await cloudinary.uploader.upload(originalImagePath);
    await fs.rm(originalImagePath);
    const previewRes = await cloudinary.uploader.upload(previewImagePath);
    await fs.rm(previewImagePath);

    return {
      originalUrl: originalRes.secure_url,
      previewUrl: previewRes.secure_url,
    };
  }

  async createPreviewImage(originalImagePath) {
    const ext = path.extname(originalImagePath);
    const previewImagePath = originalImagePath.replace(ext, '_preview' + ext);

    const image = await Jimp.read(originalImagePath);
    await image.scaleToFit(420, 640).quality(50).writeAsync(previewImagePath);
    return previewImagePath;
  }
}
