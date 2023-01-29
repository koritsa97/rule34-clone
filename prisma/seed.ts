import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

import { CreatePostDto } from '../src/types/posts.dto';

const prisma = new PrismaClient();

const imageUrls = [
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1674938006/bj8cddnt8etj9ow9th63.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1674937922/ew7bjoh7szewgvwd4emd.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1674937559/nyolx2o22rrjpn97h1zk.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1673920076/azsblguuixenhraulpe2.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1673919703/oyyoejvbuf4awus5bzgq.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1673913634/k6f9e6i3fadbs7jiry8v.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1673822713/yxisrskrs376cdit7pkn.jpg',
  'https://res.cloudinary.com/ds8vgs50s/image/upload/v1673734253/dirmbxkpxgyszucgj0nv.jpg',
];

async function main() {
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  const user1 = await prisma.user.create({
    data: {
      username: faker.internet.userName(),
      password: faker.internet.password(),
    },
  });
  const user2 = await prisma.user.create({
    data: {
      username: faker.internet.userName(),
      password: faker.internet.password(),
    },
  });

  for (let i = 0; i < imageUrls.length; i++) {
    await createPost({
      originalUrl: imageUrls[i],
      previewUrl: imageUrls[i],
      tags: new Array(Math.round(Math.random() * 5))
        .fill(null)
        .map(() => faker.lorem.word()),
      ownerId: [user1.id, user2.id][Math.round(Math.random())],
      sourceUrl: 'https://twitter.com',
    });
  }
}

async function createPost(data: CreatePostDto) {
  return await prisma.post.create({
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
}

main()
  .then(() => {
    console.log('Seeding completed');
  })
  .catch((error) => {
    console.log('SEEDING ERROR');
    console.log(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
