import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';

import { prisma } from '@/config/prisma';

export const localStrategy = new Strategy(async (username, password, cb) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username },
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
      cb("User doesn't exists", false);
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      cb('Wrong password', false);
      return;
    }

    cb(null, user);
  } catch (error) {
    cb(error);
  }
});
