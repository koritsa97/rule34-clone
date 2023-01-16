import { Tag } from '../models/tag.model.js';

export class TagsService {
  async findInPost(post) {
    return Tag.find({
      _id: {
        $in: post.tags,
      },
    }).lean();
  }

  async findInPosts(posts) {
    const tagsIds = new Set();
    for (const post of posts) {
      for (const tagId of post.tags) {
        tagsIds.add(tagId);
      }
    }

    return Tag.find({
      _id: {
        $in: Array.from(tagsIds),
      },
    }).lean();
  }

  async findOneByName(name) {
    return Tag.findOne({ name }).lean();
  }

  async findManyByNames(tagsNames) {
    return Tag.find({
      name: {
        $in: tagsNames,
      },
    }).lean();
  }

  async findManyByIds(ids) {
    return Tag.find({
      _id: {
        $in: ids,
      },
    }).lean();
  }

  async search(name) {
    return Tag.find({
      name: {
        $regex: name,
        $options: 'i',
      },
    }).lean();
  }

  async findOrCreateByName(name, owner) {
    const tag = await this.findOneByName(name);
    if (tag) {
      return tag;
    } else {
      return (
        await Tag.create({
          name,
          owner,
        })
      ).toJSON();
    }
  }

  async findOrCreateManyByNames(tagsNames, owner) {
    return Promise.all(
      tagsNames.map((tagName) => this.findOrCreateByName(tagName, owner))
    );
  }

  async create(data) {
    return (await Tag.create(data)).toJSON();
  }
}
