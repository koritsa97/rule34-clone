import { Strategy } from 'passport-local';

import { prisma } from '@/config/prisma';

export const localStrategy = new Strategy(async (username, password, cb) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username, password },
      include: {
        createdTags: true,
        favoritedBy: true,
        favoritePosts: true,
        favoriteTags: true,
        favoriteUsers: true,
        uploads: true,
      },
    });
    if (!user) {
      cb('Wrong credentials', false);
    } else {
      cb(null, user);
    }
  } catch (error) {
    cb(error);
  }
});
