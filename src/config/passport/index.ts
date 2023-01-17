import passport from 'passport';
import { User } from '@prisma/client';

import { localStrategy } from './local.strategy';
import { prisma } from '@/config/prisma';

passport.use(localStrategy);

export interface SerializedUser {
  id: number;
}

passport.serializeUser<SerializedUser>((user, cb) => {
  cb(null, { id: (user as User).id });
});

passport.deserializeUser<SerializedUser>(async (user, cb) => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        createdTags: true,
        favoritedBy: true,
        favoritePosts: true,
        favoriteTags: true,
        favoriteUsers: true,
        uploads: true,
      },
    });
    if (!targetUser) {
      cb(null, false);
    } else {
      cb(null, targetUser);
    }
  } catch (error) {
    cb(error);
  }
});
