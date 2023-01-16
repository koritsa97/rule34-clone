export class UsersController {
  constructor(postsService, tagsService, usersService) {
    this.postsService = postsService;
    this.tagsService = tagsService;
    this.usersService = usersService;
  }

  async getAccount(req, res, next) {
    try {
      const favoritePosts = await this.postsService.findManyByIds(
        req.user.favoritePosts
      );
      const favoriteTags = await this.tagsService.findManyByIds(
        req.user.favoriteTags
      );
      const uploads = await this.postsService.findManyByOwner(req.user._id);

      res.render('account', {
        css: ['account.css'],
        user: {
          ...req.user,
          favoritePosts,
          favoriteTags,
          uploads,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const favoriteTags = await this.tagsService.findManyByIds(
        req.user.favoriteTags
      );

      const tagsString = favoriteTags.map(({ name }) => name).join(' ');
      res.render('account-settings', {
        user: req.user,
        tagsString,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      let { favoriteTags } = req.body;
      favoriteTags = favoriteTags.toLowerCase().trim();

      if (favoriteTags === '') {
        res.redirect('/account/settings');
        return;
      }

      const tags = await this.tagsService.findManyByNames(
        favoriteTags.split(' ')
      );

      await this.usersService.updateFavoriteTags(req.user._id, tags);

      res.redirect('/account/settings');
    } catch (error) {
      next(error);
    }
  }
}
