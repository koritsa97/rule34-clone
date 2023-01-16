import passport from 'passport';

import { localStrategy } from './local.strategy';
import { User, UserEntity } from '@/models/user.model';

passport.use(localStrategy);

export interface SerializedUser {
  _id: string;
}

passport.serializeUser<SerializedUser>((user, cb) => {
  cb(null, { _id: (user as UserEntity)._id });
});

passport.deserializeUser<SerializedUser>(async (user, cb) => {
  try {
    const targetUser = await User.findById(user._id).lean();
    if (!targetUser) {
      cb(null, false);
    } else {
      cb(null, targetUser);
    }
  } catch (error) {
    cb(error);
  }
});
