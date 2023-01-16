import { PostEntity } from '@/models/post.model';
import { Tag, TagEntity } from '@/models/tag.model';

export class TagsService {
  async findInPost(post: PostEntity): Promise<TagEntity[]> {
    return Tag.find({
      _id: {
        $in: post.tags,
      },
    });
  }

  async findInPosts(posts: PostEntity[]): Promise<TagEntity[]> {
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
    });
  }

  async findOneByName(name: string): Promise<TagEntity | null> {
    return Tag.findOne({ name });
  }

  async findManyByNames(tagsNames: string[]): Promise<TagEntity[]> {
    return Tag.find({
      name: {
        $in: tagsNames,
      },
    });
  }

  async findManyByIds(ids: string[]): Promise<TagEntity[]> {
    return Tag.find({
      _id: {
        $in: ids,
      },
    });
  }

  async search(name: string): Promise<TagEntity[]> {
    return Tag.find({
      name: {
        $regex: name,
        $options: 'i',
      },
    });
  }

  async findOrCreateByName(name: string, owner: string): Promise<TagEntity> {
    const tag = await this.findOneByName(name);
    if (tag) {
      return tag;
    } else {
      return await Tag.create({
        name,
        owner,
      });
    }
  }

  async findOrCreateManyByNames(
    tagsNames: string[],
    owner: string
  ): Promise<TagEntity[]> {
    return Promise.all(
      tagsNames.map((tagName) => this.findOrCreateByName(tagName, owner))
    );
  }

  async create(data: TagEntity): Promise<TagEntity> {
    return await Tag.create(data);
  }
}
