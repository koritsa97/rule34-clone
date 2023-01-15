import passport from 'passport';

import { localStrategy } from './local.strategy.js';
import { User } from '../../models/user.model.js';

passport.use(localStrategy);

passport.serializeUser((user, cb) => {
  cb(null, { _id: user._id });
});

passport.deserializeUser(async (user, cb) => {
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
