import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import morgan from 'morgan';
import mongoose from 'mongoose';
import multer from 'multer';
import Jimp from 'jimp';
import passport from 'passport';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

import Post from './models/Post.js';
import Tag from './models/Tag.js';
import User from './models/User.js';
import { TagType } from './utils/constants.js';
import './passport/index.js';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const store = new MongoDBStore(session)({
  uri: process.env.DB_URL,
  collection: '_user_sessions',
});

const uploadsDirPath = path.join(process.cwd(), 'static/uploads');
fs.access(uploadsDirPath, (err) => {
  if (err) {
    fs.mkdirSync(uploadsDirPath);
  }
});

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static(path.join(process.cwd(), 'static')));
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

const auth = (req, res, next) => (req.user ? next() : res.redirect('/login'));

app.get('/', (req, res) => {
  res.render('home', {
    css: ['home.css'],
    layout: 'home',
    user: req.user,
  });
});

app.get('/posts', async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      const posts = await Post.find().lean();
      const tags = await Tag.find().lean();

      res.render('posts', {
        css: ['posts.css'],
        posts,
        tags,
        user: req.user,
      });

      return;
    }

    const tagsNames = query.split(' ');

    const queriedTags = await Tag.find({
      name: {
        $in: tagsNames,
      },
    });
    const posts = await Post.find({
      tags: {
        $in: queriedTags,
      },
    }).lean();
    const tags = await Tag.find({
      _id: {
        $in: Array.from(
          posts.reduce((prev, post) => {
            for (const tagId of post.tags) {
              prev.add(tagId);
            }
            return prev;
          }, new Set())
        ),
      },
    }).lean();

    res.render('posts', {
      css: ['posts.css'],
      posts,
      tags,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/feed', async (req, res, next) => {
  try {
    const posts = await Post.find({
      tags: {
        $in: req.user.favoriteTags,
      },
    }).lean();

    const tags = await Tag.find({
      _id: {
        $in: Array.from(
          posts.reduce((prev, post) => {
            for (const tagId of post.tags) {
              prev.add(tagId);
            }
            return prev;
          }, new Set())
        ),
      },
    }).lean();

    res.render('feed', {
      posts,
      tags,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    const tags = await Tag.find({
      _id: {
        $in: post.tags,
      },
    }).lean();

    res.render('post', {
      ...post.toJSON(),
      tags: tags,
      user: req.user,
      css: ['post.css'],
    });
  } catch (error) {
    next(error);
  }
});

app.patch('/post/:id/favorite', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        favoritePosts: id,
      },
    });

    res.send('Success');
  } catch (error) {
    next(error);
  }
});

app.get('/upload', auth, (req, res) => {
  res.render('upload', {
    user: req.user,
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
});

app.post('/upload', auth, upload.single('image'), async (req, res, next) => {
  try {
    const ext = path.extname(req.file.path);
    const previewImagePath = req.file.path.replace(ext, '_preview') + ext;
    await (await Jimp.read(req.file.path))
      .scaleToFit(420, 640)
      .quality(70)
      .writeAsync(previewImagePath);

    const userTags = req.body.tags.split(' ');
    const tags = [];
    for (const userTag of userTags) {
      let tag = await Tag.findOne({
        name: userTag,
      });
      if (!tag) {
        tag = await Tag.create({
          name: userTag,
          type: TagType.CATEGORY,
          owner: req.user._id,
        });
      }

      tags.push(tag);
    }

    const previewRes = await cloudinary.uploader.upload(previewImagePath);
    fs.rmSync(previewImagePath);
    const originalRes = await cloudinary.uploader.upload(req.file.path);
    fs.rmSync(req.file.path);

    const post = await Post.create({
      previewImageUrl: previewRes.secure_url,
      originalImageUrl: originalRes.secure_url,
      tags,
      source: req.body.source,
      owner: req.user._id,
    });

    res.redirect('/posts');
  } catch (error) {
    next(error);
  }
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
    });

    res.redirect('/posts');
  } catch (error) {
    next(error);
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/posts');
  }
);

app.get('/account', auth, async (req, res) => {
  try {
    const favoritePosts = await Post.find({
      _id: {
        $in: req.user.favoritePosts,
      },
    }).lean();
    const favoriteTags = await Tag.find({
      _id: {
        $in: req.user.favoriteTags,
      },
    }).lean();
    const uploads = await Post.find({
      owner: req.user._id,
    }).lean();

    res.render('account', {
      user: {
        ...req.user,
        favoritePosts,
        favoriteTags,
        uploads,
      },
      css: ['account.css'],
    });
  } catch (error) {
    next(error);
  }
});

app.get('/account/settings', auth, async (req, res) => {
  try {
    const favoriteTags = await Tag.find({
      _id: {
        $in: req.user.favoriteTags,
      },
    });

    console.log(req.user);

    const tagsString = favoriteTags.map(({ name }) => name).join(' ');
    res.render('account-settings', {
      user: req.user,
      tagsString,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/account/settings', auth, async (req, res) => {
  try {
    const { favoriteTags } = req.body;
    if (favoriteTags === '') {
      res.redirect('/account/settings');
      return;
    }

    const tags = await Tag.find({
      name: {
        $in: favoriteTags.split(' '),
      },
    });

    console.log('tags', tags, favoriteTags);

    const user = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        favoriteTags: tags,
      },
    });

    res.redirect('/account/settings');
  } catch (error) {
    next(error);
  }
});

app.get('/logout', auth, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }

    res.redirect('/');
  });
});

app.get('/tags/autocomplete', async (req, res, next) => {
  try {
    const { query } = req.query;
    const tags = await Tag.find({
      name: {
        $regex: query,
        $options: 'i',
      },
    });

    res.json(query === '' ? [] : tags);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  console.log(err);
  res.status(status).send(err.message);
});

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('Database connected');

    const { PORT } = process.env;
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
