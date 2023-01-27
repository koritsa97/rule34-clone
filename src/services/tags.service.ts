import { Tag } from '@prisma/client';

import { prisma } from '@/config/prisma';
import { CreateTagDto } from '@/types/tags.dto';

export class TagsService {
  getUniqueTags(tags: Tag[]): Tag[] {
    const tagsSet: Tag[] = tags.reduce<Tag[]>((prev, tag) => {
      if (!prev.find(({ id }) => tag.id === id)) {
        return [...prev, tag];
      }

      return prev;
    }, []);

    return tagsSet;
  }

  async findOneByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: {
        name,
      },
    });
  }

  async findManyByNames(tagsNames: string[]): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        name: {
          in: tagsNames,
        },
      },
    });
  }

  async findManyByIds(ids: number[]): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async search(name: string): Promise<Tag[]> {
    return prisma.tag.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });
  }

  async create(data: CreateTagDto): Promise<Tag> {
    return prisma.tag.create({
      data: {
        name: data.name,
        owner: {
          connect: {
            id: data.ownerId,
          },
        },
      },
    });
  }
}
