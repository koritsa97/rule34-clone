import { Strategy } from 'passport-local';

import User from '../models/User.js';

export const localStrategy = new Strategy(async (username, password, cb) => {
  try {
    const user = await User.findOne({
      username,
      password,
    });
    if (!user) {
      cb(null, false);
    } else {
      cb(null, user);
    }
  } catch (error) {
    cb(error);
  }
});
