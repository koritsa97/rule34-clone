import express from 'express';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

import '@/config/passport';
import { PUBLIC_DIR, UPLOADS_DIR } from '@/utils/constants';
import { errorHandler } from '@/middlewares/error-handler.middleware';
import postsModule from '@/modules/posts.module';
import authModule from '@/modules/auth.module';
import usersModule from '@/modules/users.module';
import tagsModule from '@/modules/tags.module';

const envOutput = dotenv.config();
if (envOutput.error) {
  console.log(envOutput.error);
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});
fs.access(UPLOADS_DIR, (err) => {
  if (err) {
    fs.mkdirSync(UPLOADS_DIR);
  }
});

const app = express();
const mongoDBSessionStore = new (ConnectMongoDBSession(session))({
  uri: process.env.MONGODB_URL,
  collection: '_user_sessions',
});

app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    helpers: {
      ifEquals(arg1: any, arg2: any) {
        return arg1 === arg2;
      },
      ifNotEquals(arg1: any, arg2: any) {
        return arg1 !== arg2;
      },
    },
  })
);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.static(PUBLIC_DIR));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoDBSessionStore,
  })
);
app.use(passport.session());

app.get('/', (req, res) => {
  res.render('home', {
    user: req.user,
  });
});

app.use(postsModule);
app.use(authModule);
app.use(usersModule);
app.use(tagsModule);

app.use(errorHandler);

export default app;
