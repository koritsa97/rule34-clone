import { PrismaClient, Prisma, Tag } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

import { TagsService } from './tags.service';
import { prisma } from '@/config/prisma';
import { CreateTagDto } from '@/types/tags.dto';

jest.mock('../config/prisma.ts', () => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('Tags service', () => {
  let service: TagsService;

  beforeEach(() => {
    service = new TagsService();
  });

  test('should return tags without duplicates', () => {
    const tags: Tag[] = [
      {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'tag1',
        ownerId: 1,
        type: 'DEFAULT',
      },
      {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'tag1',
        ownerId: 1,
        type: 'DEFAULT',
      },
    ];

    const uniqueTags = service.getUniqueTags(tags);
    expect(uniqueTags).toHaveLength(1);
  });

  test('should find one tag by name', async () => {
    await service.findOneByName('tag1');
    expect(prisma.tag.findUnique).toBeCalledWith({
      where: {
        name: 'tag1',
      },
    });
  });

  test('should find all tags by names', async () => {
    const tagsNames = ['tag1', 'tag2', 'tag3'];
    await service.findManyByNames(tagsNames);
    expect(prisma.tag.findMany).toBeCalledWith({
      where: {
        name: {
          in: tagsNames,
        },
      },
    });
  });

  test('should find all tags by ids', async () => {
    const ids = [1, 2, 3];

    await service.findManyByIds(ids);
    expect(prisma.tag.findMany).toBeCalledWith({
      where: {
        id: {
          in: ids,
        },
      },
    });
  });

  test('should search tags by name', async () => {
    await service.search('tag1');
    expect(prisma.tag.findMany).toBeCalledWith({
      where: {
        name: {
          contains: 'tag1',
        },
      },
    });
  });

  test('should create new tag', async () => {
    const data: CreateTagDto = {
      name: 'tag1',
      ownerId: 1,
    };
    await service.create(data);
    expect(prisma.tag.create).toBeCalledWith({
      data: {
        name: data.name,
        owner: {
          connect: {
            id: data.ownerId,
          },
        },
      },
    });
  });
});
