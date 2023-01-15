import express from 'express';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

import './config/passport/index.js';
import { PUBLIC_DIR, UPLOADS_DIR } from './utils/constants.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';
import postsModule from './modules/posts.module.js';
import authModule from './modules/auth.module.js';
import usersModule from './modules/users.module.js';
import tagsModule from './modules/tags.module.js';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
fs.access(UPLOADS_DIR, (err) => {
  if (err) {
    fs.mkdirSync(UPLOADS_DIR);
  }
});

const app = express();
const store = new MongoDBStore(session)({
  uri: process.env.DB_URL,
  collection: '_user_sessions',
});

app.engine(
  'hbs',
  engine({
    extname: 'hbs',
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
    store,
  })
);
app.use(passport.session());

app.get('/', (req, res) => {
  res.render('home', {
    css: ['home.css'],
    layout: 'home',
    user: req.user,
  });
});

app.use(postsModule);
app.use(authModule);
app.use(usersModule);
app.use(tagsModule);

app.use(errorHandler);

export default app;
