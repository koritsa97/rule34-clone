export class TagsController {
  constructor(tagsService) {
    this.tagsService = tagsService;
  }

  async getAutocomplete(req, res, next) {
    try {
      let { query } = req.query;
      query = query.toLowerCase().trim();

      if (query === '') {
        res.json([]);
        return;
      }

      const tags = await this.tagsService.search(query);
      res.json(tags);
    } catch (error) {
      next(error);
    }
  }
}
