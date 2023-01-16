import fs from 'fs/promises';
import Jimp from 'jimp';

import { Post } from '../models/post.model.js';

export class PostsService {
  async findAll() {
    const posts = await Post.find().populate('tags');
    return posts.map((post) => post.toJSON());
  }

  async findByTags(tags) {
    const posts = await Post.find({
      tags: {
        $in: tags,
      },
    }).populate('tags');
    return posts.map((post) => post.toJSON());
  }

  async findById(id) {
    const post = await Post.findById(id).populate('tags');
    return post.toJSON();
  }

  async findManyByIds(ids) {
    const posts = await Post.find({
      _id: {
        $in: ids,
      },
    }).populate('tags');
    return posts.map((post) => post.toJSON());
  }

  async findManyByOwner(ownerId) {
    const posts = await Post.find({
      owner: ownerId,
    }).populate('tags');
    return posts.map((post) => post.toJSON());
  }

  async create(data) {
    const post = await Post.create(data);
    await post.populate('tags');
    return post.toJSON();
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
