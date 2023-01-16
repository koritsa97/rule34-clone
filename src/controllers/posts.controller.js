export class PostsController {
  constructor(postsService, tagsService, usersService) {
    this.postsService = postsService;
    this.tagsService = tagsService;
    this.usersService = usersService;
  }

  async getPosts(req, res, next) {
    try {
      const { query } = req.query;
      if (!query) {
        const posts = await this.postsService.findAll();
        const tags = await this.tagsService.findInPosts(posts);

        res.render('posts', {
          css: ['posts.css'],
          posts,
          tags,
          user: req.user,
        });

        return;
      }

      const tagsNames = query.toLowerCase().split(' ');

      const queriedTags = await this.tagsService.findManyByNames(tagsNames);
      const posts = await this.postsService.findByTags(queriedTags);
      const tags = await this.tagsService.findInPosts(posts);

      res.render('posts', {
        css: ['posts.css'],
        posts,
        tags,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeed(req, res, next) {
    try {
      const posts = await this.postsService.findByTags(req.user.favoriteTags);
      const tags = await this.tagsService.findInPosts(posts);

      res.render('feed', {
        posts,
        tags,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req, res, next) {
    try {
      const { id } = req.params;

      const post = await this.postsService.findById(id);
      const tags = await this.tagsService.findInPost(post);

      res.render('post', {
        css: ['post.css'],
        post,
        tags,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async addPostToFavorites(req, res, next) {
    try {
      const { id } = req.params;

      await this.usersService.addPostToFavorites(req.user._id, id);

      res.send('Success');
    } catch (error) {
      next(error);
    }
  }

  getUpload(req, res) {
    res.render('upload', {
      user: req.user,
    });
  }

  async uploadPost(req, res, next) {
    try {
      const tagNames = req.body.tags.toLowerCase().trim().split(' ');
      const tags = this.tagsService.findOrCreateManyByNames(
        tagNames,
        req.user._id
      );

      const previewImagePath = await this.postsService.createPreviewImage(
        req.file.path
      );
      const { originalUrl, previewUrl } = await this.postsService.uploadImages(
        req.file.path,
        previewImagePath
      );

      await this.postsService.create({
        originalImageUrl: originalUrl,
        previewImageUrl: previewUrl,
        tags,
        source: req.body.source,
        owner: req.user._id,
      });

      res.redirect('/posts');
    } catch (error) {
      next(error);
    }
  }
}
