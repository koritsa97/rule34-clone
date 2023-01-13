import passport from 'passport';

import { localStrategy } from './local.strategy.js';

passport.use(localStrategy);
